import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import type { ActionItem } from '../../types';
import { createOrUpdateReminderSchedule, deleteReminderSchedule } from '../../services/scheduler';

export async function handleActions(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const segments = path.split('/').filter(Boolean);
  const actIdx = segments.indexOf('actions');
  const actionId = (actIdx !== -1 && segments[actIdx + 1])
    ? segments[actIdx + 1]
    : (event.pathParameters?.id || undefined);

  const isReminderEndpoint = path.includes('/reminder');

  // GET /actions
  if (method === 'GET' && (path.endsWith('/actions') || path.endsWith('/actions/'))) {
    const items = await db.queryByUserId('Actions', user.userId);
    return successResponse(items);
  }

  // POST /actions/{id}/reminder
  if (method === 'POST' && actionId && isReminderEndpoint) {
    let body: any = {};
    try {
      if (event.body) body = JSON.parse(event.body);
    } catch {
      return errorResponse('Invalid JSON payload', 'BAD_REQUEST', 400);
    }

    const { reminderAt } = body;
    if (!reminderAt) {
      return errorResponse('reminderAt is required', 'BAD_REQUEST', 400);
    }

    const reminderDate = new Date(reminderAt);
    if (isNaN(reminderDate.getTime())) {
      return errorResponse('Invalid reminderAt date format', 'BAD_REQUEST', 400);
    }

    // Retrieve authoritative action from DynamoDB
    let action: ActionItem = await db.get('Actions', { userId: user.userId, id: actionId });
    if (!action) {
      // Create fallback action entry if missing in DynamoDB
      action = {
        userId: user.userId,
        id: actionId,
        title: body.title || 'LifeOS Action Item',
        description: body.description || 'Action extracted from LifeOS',
        source: body.source || 'LifeOS Document Intelligence',
        sourceId: body.sourceId || '',
        deadline: body.deadline || reminderAt,
        daysLeft: 1,
        priority: body.priority || 'warning',
        status: 'pending',
        relatedDocuments: [],
        createdAt: new Date().toISOString(),
      };
    }

    // Schedule in Amazon EventBridge Scheduler
    const scheduleId = await createOrUpdateReminderSchedule({
      actionId: action.id,
      userId: user.userId,
      email: user.email,
      reminderAt: reminderDate.toISOString(),
      title: action.title,
      description: action.description,
      dueDate: action.deadline,
      source: action.source,
    });

    // Update DynamoDB action item
    action.reminderEnabled = true;
    action.reminderAt = reminderDate.toISOString();
    action.reminderScheduleId = scheduleId;
    action.reminderStatus = 'SCHEDULED';
    await db.put('Actions', action);

    return successResponse({
      success: true,
      actionId: action.id,
      reminderStatus: 'SCHEDULED',
      reminderAt: action.reminderAt,
      scheduleId,
      recipientEmail: user.email,
    });
  }

  // DELETE /actions/{id}/reminder
  if (method === 'DELETE' && actionId && isReminderEndpoint) {
    const action: ActionItem = await db.get('Actions', { userId: user.userId, id: actionId });
    if (action && action.reminderScheduleId) {
      await deleteReminderSchedule(action.reminderScheduleId);
      action.reminderEnabled = false;
      action.reminderStatus = 'CANCELLED';
      await db.put('Actions', action);
    }

    return successResponse({
      success: true,
      actionId,
      reminderStatus: 'CANCELLED',
    });
  }

  // PATCH /actions/{id}/complete or PATCH /actions/{id}
  if (method === 'PATCH' && actionId) {
    const action: ActionItem = await db.get('Actions', { userId: user.userId, id: actionId });
    if (!action) {
      return successResponse({ id: actionId, status: 'completed' });
    }

    action.status = 'completed';

    // If there is an active schedule, clean it up
    if (action.reminderScheduleId && action.reminderStatus === 'SCHEDULED') {
      await deleteReminderSchedule(action.reminderScheduleId);
      action.reminderStatus = 'SKIPPED';
    }

    await db.put('Actions', action);
    return successResponse(action);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
