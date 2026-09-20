import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import type { WorkflowItem } from '../../types';

export async function handleWorkflows(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const segments = path.split('/').filter(Boolean);
  const wfIdx = segments.indexOf('workflows');
  const wfId = (wfIdx !== -1 && segments[wfIdx + 1] && !['analyze'].includes(segments[wfIdx + 1]))
    ? segments[wfIdx + 1]
    : (event.pathParameters?.id || undefined);

  // GET /workflows
  if (method === 'GET' && !wfId) {
    const items = await db.queryByUserId('Workflows', user.userId);
    return successResponse(items);
  }

  // GET /workflows/{id}
  if (method === 'GET' && wfId) {
    const item = await db.get('Workflows', { userId: user.userId, id: wfId });
    if (!item) return errorResponse('Workflow not found', 'NOT_FOUND', 404);
    return successResponse(item);
  }

  // POST /workflows/analyze
  if (method === 'POST') {
    const docs = await db.queryByUserId('Documents', user.userId);
    if (!docs || docs.length === 0) {
      return errorResponse('No documents found in your account. Upload a process or requirement document first to generate workflows.', 'BAD_REQUEST', 400);
    }

    const docNames = docs.map((d) => d.name);
    const combinedText = docs.map((d) => d.extractedInfo?.rawText || d.name).join('\n\n');

    const newWf: WorkflowItem = {
      userId: user.userId,
      id: `wf-${Date.now()}`,
      name: docs[0]?.name ? `${docs[0].name.replace(/\.pdf|\.jpg|\.png/gi, '')} Process` : 'Workflow Process',
      description: `Workflow process generated from ${docs.length} uploaded document(s).`,
      currentStageId: 'stage-1',
      sourceEvidence: docNames,
      stages: [
        { id: 'stage-1', name: 'Document Ingestion', status: 'complete', description: 'Extracted text and metadata from uploaded files.' },
        { id: 'stage-2', name: 'Requirement Analysis', status: 'in_progress', description: 'Extracting key deadlines and required certificates.' },
        { id: 'stage-3', name: 'Verification & Action', status: 'waiting', description: 'Fulfill missing documents and submit.' },
        { id: 'stage-4', name: 'Final Approval', status: 'waiting', description: 'Review approval status from issuing body.' },
      ],
      createdAt: new Date().toISOString(),
    };

    await db.put('Workflows', newWf);
    return successResponse(newWf);
  }


  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
