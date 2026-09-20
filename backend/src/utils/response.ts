import type { APIGatewayProxyResult } from 'aws-lambda';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

export function successResponse(data: any, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers,
    body: JSON.stringify({ data }),
  };
}

export function errorResponse(message: string, code = 'INTERNAL_ERROR', statusCode = 500): APIGatewayProxyResult {
  return {
    statusCode,
    headers,
    body: JSON.stringify({
      error: {
        code,
        message,
      },
    }),
  };
}
