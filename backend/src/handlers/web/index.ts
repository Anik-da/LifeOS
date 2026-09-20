import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import { webSearchService } from '../../services/webSearch';
import type { DocumentItem } from '../../types';

export async function handleWeb(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  // POST /web/search or POST /public-search
  if (method === 'POST' && (path.endsWith('/web/search') || path.endsWith('/public-search'))) {
    const { query } = body;
    if (!query || !query.trim()) {
      return errorResponse('query parameter is required', 'BAD_REQUEST', 400);
    }

    try {
      const searchResults = await webSearchService.searchPublicWeb(query);
      return successResponse({
        query: query.trim(),
        searchedAt: new Date().toISOString(),
        results: searchResults,
      });
    } catch (err: any) {
      console.error('[handleWeb] Public web search exception:', err);
      return errorResponse('Live web search is currently unavailable. LifeOS did not generate synthetic sources.', 'SERVICE_UNAVAILABLE', 503);
    }
  }

  // POST /web/save-source
  if (method === 'POST' && path.endsWith('/web/save-source')) {
    const { title, url, snippet, domain, sourceType, authority } = body;
    if (!title || !url) return errorResponse('title and url are required', 'BAD_REQUEST', 400);

    const docId = `webdoc-${Date.now()}`;
    const retrievedIso = new Date().toISOString();
    const docItem: DocumentItem = {
      userId: user.userId,
      id: docId,
      name: title,
      type: 'pdf',
      category: 'personal',
      dateAdded: retrievedIso.split('T')[0],
      actionCount: 0,
      thumbnailColor: '#8b5cf6',
      s3Key: `public-sources/${domain || 'web'}/${docId}`,
      status: 'ready',
      extractedInfo: {
        documentType: `Public Web Source (${sourceType || authority || 'Web Result'})`,
        importantDates: [],
        requirements: [],
        people: [],
        amounts: [],
        actions: [],
        relatedDocuments: [],
        rawText: `Title: ${title}\nURL: ${url}\nDomain: ${domain}\nRetrieved At: ${retrievedIso}\nClassification: ${sourceType || authority || 'PUBLIC_WEB'}\n\nSnippet:\n${snippet || 'No snippet provided.'}`,
        pagesText: [{ pageNumber: 1, text: `Public Source: ${url}\n${snippet || ''}` }],
      },
      createdAt: retrievedIso,
      updatedAt: retrievedIso,
    };

    await db.put('Documents', docItem);
    return successResponse({
      success: true,
      document: docItem,
    });
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
