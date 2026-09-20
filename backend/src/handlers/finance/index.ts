import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../../utils/response';
import { getUserFromEvent } from '../../middleware/auth';
import { db } from '../../services/dynamodb';
import type { ScholarshipMatchItem, ExpenseItem } from '../../types';


export async function handleFinance(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const user = getUserFromEvent(event);
  const method = event.httpMethod;
  const path = event.path;

  // GET /finance/scholarships
  if (method === 'GET' && path.endsWith('/finance/scholarships')) {
    const allFinanceItems = await db.queryByUserId('Finance', user.userId);
    const matches = allFinanceItems.filter((item) => item.status === 'potential_match' || item.matchPercentage || item.provider);
    return successResponse(matches);
  }

  // GET /finance/expenses
  if (method === 'GET' && path.endsWith('/finance/expenses')) {
    const expensesList: ExpenseItem[] = await db.queryByUserId('Finance', user.userId);
    return successResponse(expensesList);
  }

  return errorResponse('Route not found', 'NOT_FOUND', 404);
}

