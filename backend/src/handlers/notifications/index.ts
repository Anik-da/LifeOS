import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import type { NotificationItem } from '../../types';

export async function handleNotifications(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const segments = path.split('/').filter(Boolean);
  const notifIdx = segments.indexOf('notifications');
  const notifId = (notifIdx !== -1 && segments[notifIdx + 1])
    ? segments[notifIdx + 1]
    : (event.pathParameters?.id || undefined);

  // GET /notifications
  if (method === 'GET') {
    const items = await db.queryByUserId('Notifications', user.userId);
    return successResponse(items);
  }

  // PATCH /notifications/{id}/read
  if (method === 'PATCH' && notifId) {
    const item: NotificationItem = await db.get('Notifications', { userId: user.userId, id: notifId });
    if (item) {
      item.read = true;
      await db.put('Notifications', item);
    }
    return successResponse({ id: notifId, read: true });
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
