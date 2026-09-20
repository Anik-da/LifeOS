import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import { bedrockService } from '../../services/bedrock';
import type { ChangeItem, DocumentItem } from '../../types';

export async function handleChanges(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  // GET /changes
  if (method === 'GET') {
    const items = await db.queryByUserId('Changes', user.userId);
    return successResponse(items);
  }

  // POST /changes/compare
  if (method === 'POST') {
    const { docId1, docId2 } = body;

    if (!docId1 || !docId2) {
      return errorResponse('docId1 and docId2 are required for document version comparison.', 'BAD_REQUEST', 400);
    }

    const d1: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId1 });
    const d2: DocumentItem = await db.get('Documents', { userId: user.userId, id: docId2 });

    if (!d1 || !d2) {
      return errorResponse('One or both selected document versions were not found in your account.', 'NOT_FOUND', 404);
    }

    const v1Text = d1.extractedInfo?.rawText || d1.name;
    const v2Text = d2.extractedInfo?.rawText || d2.name;
    const docName = d1.name.replace(/\.pdf|\.jpg|\.png/gi, '');

    const comparison = await bedrockService.compareDocuments(`${docName} v1`, v1Text, `${docName} v2`, v2Text);

    const changeRecord: ChangeItem = {
      userId: user.userId,
      id: `chg-${Date.now()}`,
      documentName: docName,
      version1: d1.name,
      version2: d2.name,
      summary: comparison.summary,
      changes: comparison.changes,
      createdAt: new Date().toISOString(),
    };

    await db.put('Changes', changeRecord);
    return successResponse(changeRecord);
  }


  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
