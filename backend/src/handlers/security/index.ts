import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { bedrockService } from '../../services/bedrock';

export async function handleSecurity(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : {};

  if (method === 'POST') {
    const { input, inputType } = body;
    if (!input) return errorResponse('input text is required', 'BAD_REQUEST', 400);

    const safeType = inputType || 'message';
    const result = await bedrockService.checkScam(input, safeType);
    result.userId = user.userId;

    return successResponse(result);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}
