import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';

export async function handleDashboard(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;

  if (method === 'GET' && path.endsWith('/dashboard/metrics')) {
    const docs = await db.queryByUserId('Documents', user.userId);
    const actionsList = await db.queryByUserId('Actions', user.userId);
    const workflowsList = await db.queryByUserId('Workflows', user.userId);
    const changesList = await db.queryByUserId('Changes', user.userId);

    const pendingActionsCount = actionsList.filter((a) => a.status !== 'completed').length;
    const activeWorkflowsCount = workflowsList.length;
    const detectedChangesCount = changesList.length;

    const metrics = [
      { id: 'knowledge', label: 'Knowledge', value: String(docs.length), sublabel: 'sources', icon: 'BookOpen', link: '/knowledge', accent: 'info' },
      { id: 'actions', label: 'Actions', value: String(pendingActionsCount), sublabel: 'requiring attention', icon: 'Zap', link: '/actions', accent: 'urgent' },
      { id: 'processes', label: 'Processes', value: String(activeWorkflowsCount), sublabel: 'active', icon: 'GitBranch', link: '/workflows', accent: 'warning' },
      { id: 'changes', label: 'Changes', value: String(detectedChangesCount), sublabel: 'new changes', icon: 'RefreshCw', link: '/changes', accent: 'info' },
    ];
    return successResponse(metrics);
  }

  if (method === 'GET' && path.endsWith('/dashboard/events')) {
    const notifications = await db.queryByUserId('Notifications', user.userId);
    return successResponse(notifications);
  }

  if (method === 'GET' && path.endsWith('/dashboard/actions')) {
    const actionsList = await db.queryByUserId('Actions', user.userId);
    return successResponse(actionsList);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}

