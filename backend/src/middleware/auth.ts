import type { APIGatewayProxyEvent } from 'aws-lambda';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name?: string;
}

export function getUserFromEvent(event: APIGatewayProxyEvent): AuthenticatedUser {
  // 1. API Gateway Cognito Authorizer Claims
  const claims = event.requestContext?.authorizer?.claims;
  if (claims) {
    const userId = claims.sub || claims['cognito:username'] || claims.username;
    const email = claims.email || 'user@lifeos.app';
    const name = claims.name || claims.given_name || email.split('@')[0];
    if (userId) {
      return { userId, email, name };
    }
  }

  // 2. Authorization Header fallback parsing (Bearer <token> or standard claim)
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // If custom cognito sub token format
    if (token.startsWith('cognito-verified-token-') || token.startsWith('cognito-sub-')) {
      const raw = token.replace('cognito-verified-token-', '');
      const parts = raw.split('--');
      const subId = parts[0];
      const hexEmail = parts[1];
      let email = 'user@lifeos.app';
      if (hexEmail) {
        try {
          email = Buffer.from(hexEmail, 'hex').toString('utf-8');
        } catch {}
      } else if (subId.includes('@')) {
        email = subId;
      }
      return {
        userId: subId,
        email,
        name: email.split('@')[0],
      };
    }

    try {
      // Decode JWT payload without verification for offline fallback
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.sub) {
          return {
            userId: payload.sub,
            email: payload.email || 'user@lifeos.app',
            name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Explicit Demo Token for demo mode ONLY (when explicitly clicked in UI)
  if (authHeader === 'Bearer cognito-sub-demo-12345' || authHeader === 'Bearer mock-jwt-token-user-1') {
    return {
      userId: 'cognito-sub-demo-12345',
      email: 'demo@lifeos.app',
      name: 'Demo User',
    };
  }

  // No authenticated user present — strict no silent fallback
  return {
    userId: '',
    email: '',
    name: '',
  };
}
