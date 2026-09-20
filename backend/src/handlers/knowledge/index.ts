import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';

export async function handleKnowledge(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;

  if (method === 'GET' && path.endsWith('/knowledge/graph')) {
    const docs = await db.queryByUserId('Documents', user.userId);
    const actions = await db.queryByUserId('Actions', user.userId);

    const nodes: { id: string; label: string; type: string; x: number; y: number }[] = [];
    const edges: { from: string; to: string }[] = [];

    docs.forEach((doc, idx) => {
      const docNodeId = `doc-node-${doc.id}`;
      nodes.push({
        id: docNodeId,
        label: doc.name,
        type: 'document',
        x: 50 + (idx % 3) * 150,
        y: 50 + Math.floor(idx / 3) * 100,
      });

      if (doc.extractedInfo?.requirements) {
        doc.extractedInfo.requirements.forEach((req: any, rIdx: number) => {
          const reqNodeId = `req-node-${doc.id}-${rIdx}`;
          nodes.push({
            id: reqNodeId,
            label: req.name,
            type: 'requirement',
            x: 220 + (rIdx % 2) * 120,
            y: 80 + rIdx * 60,
          });
          edges.push({ from: docNodeId, to: reqNodeId });
        });
      }
    });

    actions.forEach((act, aIdx) => {
      const actNodeId = `act-node-${act.id}`;
      nodes.push({
        id: actNodeId,
        label: act.title,
        type: 'action',
        x: 400,
        y: 100 + aIdx * 70,
      });

      if (act.sourceId) {
        edges.push({ from: `doc-node-${act.sourceId}`, to: actNodeId });
      }
    });

    return successResponse({ nodes, edges });
  }

  if (method === 'GET' && path.endsWith('/knowledge/events')) {
    const events = await db.queryByUserId('Notifications', user.userId);
    return successResponse(events);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}

