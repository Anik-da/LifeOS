import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { errorResponse } from './utils/response';
import { handleAuth } from './handlers/auth';
import { handleDocuments } from './handlers/documents';
import { handleDashboard } from './handlers/dashboard';
import { handleActions } from './handlers/actions';
import { handleAI } from './handlers/ai';
import { handleChanges } from './handlers/changes';
import { handleWorkflows } from './handlers/workflows';
import { handleCareer } from './handlers/career';
import { handleFinance } from './handlers/finance';
import { handleSecurity } from './handlers/security';
import { handleNotifications } from './handlers/notifications';
import { handleKnowledge } from './handlers/knowledge';
import { handleWeb } from './handlers/web';
import { db } from './services/dynamodb';
import { sendReminderEmail } from './services/ses';
import type { ActionItem } from './types';

export async function handleScheduledReminder(eventPayload: any): Promise<any> {
  const { actionId, userId, email, title, description, dueDate, sourceDocument } = eventPayload;
  console.log(`[Scheduled Reminder Target] Executing for action ${actionId} (userId: ${userId}, email: ${email})`);

  if (!actionId || !userId) {
    console.error('[Scheduled Reminder Target] Missing actionId or userId');
    return { status: 'ERROR', message: 'Missing actionId or userId' };
  }

  // Retrieve authoritative action from DynamoDB
  const action: ActionItem = await db.get('Actions', { userId, id: actionId });

  if (!action) {
    console.warn(`[Scheduled Reminder Target] Action ${actionId} not found in DynamoDB. Skipping.`);
    return { status: 'SKIPPED', reason: 'Action not found' };
  }

  // Check if action completed or reminder cancelled
  if (action.status === 'completed' || action.reminderStatus === 'CANCELLED') {
    console.log(`[Scheduled Reminder Target] Action ${actionId} is ${action.status}/${action.reminderStatus}. Skipping email.`);
    action.reminderStatus = 'SKIPPED';
    await db.put('Actions', action);
    return { status: 'SKIPPED', reason: action.status };
  }

  // Idempotency check: if already sent, skip
  if (action.reminderStatus === 'SENT') {
    console.log(`[Scheduled Reminder Target] Action ${actionId} reminder was already sent.`);
    return { status: 'ALREADY_SENT' };
  }

  try {
    const recipientEmail = email || (action.userId.includes('@') ? action.userId : 'demo@lifeos.app');

    const sesRes = await sendReminderEmail({
      toEmail: recipientEmail,
      title: action.title || title || 'LifeOS Action Item',
      description: action.description || description || '',
      dueDate: action.deadline || dueDate || 'N/A',
      source: action.source || sourceDocument || 'LifeOS Document Intelligence',
      actionId: action.id,
    });

    action.reminderStatus = 'SENT';
    action.reminderSentAt = new Date().toISOString();
    await db.put('Actions', action);

    console.log(`[Scheduled Reminder Target] Sent SES Email. MessageId: ${sesRes.messageId}`);
    return { status: 'SENT', messageId: sesRes.messageId };
  } catch (err: any) {
    console.error(`[Scheduled Reminder Target] SES Send Error:`, err);
    action.reminderStatus = 'FAILED';
    action.reminderError = err.message || String(err);
    await db.put('Actions', action);
    return { status: 'FAILED', error: err.message };
  }
}

export async function handler(event: any, _context?: Context): Promise<APIGatewayProxyResult | any> {
  // Check if invoked directly by EventBridge Scheduler
  if (event.source === 'aws.scheduler' || event.type === 'LIFEOS_ACTION_REMINDER') {
    return await handleScheduledReminder(event);
  }

  const httpEvent = event as APIGatewayProxyEvent;

  // CORS Preflight Options handling
  if (httpEvent.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      },
      body: '',
    };
  }

  const path = httpEvent.path || '';

  try {
    if (path.includes('/auth/')) return await handleAuth(httpEvent);
    if (path.includes('/documents')) return await handleDocuments(httpEvent);
    if (path.includes('/dashboard/')) return await handleDashboard(httpEvent);
    if (path.includes('/actions')) return await handleActions(httpEvent);
    if (path.includes('/ai/')) return await handleAI(httpEvent);
    if (path.includes('/changes')) return await handleChanges(httpEvent);
    if (path.includes('/workflows')) return await handleWorkflows(httpEvent);
    if (path.includes('/career/')) return await handleCareer(httpEvent);
    if (path.includes('/finance/')) return await handleFinance(httpEvent);
    if (path.includes('/security/')) return await handleSecurity(httpEvent);
    if (path.includes('/notifications')) return await handleNotifications(httpEvent);
    if (path.includes('/knowledge/')) return await handleKnowledge(httpEvent);
    if (path.includes('/web/')) return await handleWeb(httpEvent);

    return errorResponse(`Route ${path} not found`, 'NOT_FOUND', 404);
  } catch (err: any) {
    console.error('Unhandled Lambda exception:', err);
    return errorResponse(err?.message || 'An internal server error occurred', 'INTERNAL_ERROR', 500);
  }
}
