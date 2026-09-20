import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import { bedrockService } from '../../services/bedrock';
import type { DocumentItem } from '../../types';

import { webSearchService } from '../../services/webSearch';

export async function handleAI(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === 'GET' && (path.endsWith('/ai/health') || path.endsWith('/health'))) {
    const startTime = Date.now();
    try {
      const testRes = await bedrockService.askKnowledge('Health test query', []);
      const latencyMs = Date.now() - startTime;
      return successResponse({
        status: 'CONNECTED',
        region: process.env.AWS_REGION || 'us-east-1',
        provider: 'Amazon Bedrock Runtime',
        modelId: process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        fallbackModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        latencyMs,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return errorResponse('AI service check failed: ' + (err?.message || 'Unavailable'), 'SERVICE_UNAVAILABLE', 503);
    }
  }

  if (method === 'POST') {
    const { question } = body;
    if (!question) return errorResponse('Question is required', 'BAD_REQUEST', 400);

    // Fetch user documents from DynamoDB
    const documents: DocumentItem[] = await db.queryByUserId('Documents', user.userId);

    const docContexts = documents.map((d: DocumentItem) => {
      const info = d.extractedInfo;
      const fullText = info?.rawText || (info?.pagesText ? info.pagesText.map((p: { pageNumber: number; text: string }) => `[Page ${p.pageNumber}] ${p.text}`).join('\n') : '');
      const fullContent = info
        ? `[DOCUMENT: ${d.name}] (ID: ${d.id}, Synthetic Demo: ${info.isSyntheticDemo ? 'YES' : 'NO'})
Title: ${info.title || d.name}
Document Type: ${info.documentType}
Summary: ${info.summary || ''}
Raw Text Content:
${fullText}
Important Dates & Deadlines: ${JSON.stringify(info.deadlines || info.importantDates || [])}
Requirements: ${JSON.stringify(info.requirements || [])}
Amounts: ${JSON.stringify(info.amounts || [])}
People & Organizations: ${JSON.stringify([...(info.people || []), ...(info.organizations || [])])}
Actions: ${JSON.stringify(info.actions || [])}
Important Terms: ${JSON.stringify(info.importantTerms || [])}
Risks: ${JSON.stringify(info.risks || [])}`
        : `[DOCUMENT: ${d.name}] (ID: ${d.id})\nContent: ${d.name}`;

      return {
        id: d.id,
        name: d.name,
        type: d.type,
        rawText: fullContent,
        pagesText: info?.pagesText || [],
      };
    });

    // Fetch live public web search results for grounded RAG
    let searchResults: any[] = [];
    try {
      searchResults = await webSearchService.searchPublicWeb(question);
    } catch {}

    // Perform AI Knowledge Search via Bedrock (Dual RAG: Private Docs + Live Web)
    const aiAnswer = await bedrockService.askKnowledge(question, docContexts, searchResults);

    return successResponse(aiAnswer);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
