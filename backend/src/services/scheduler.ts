import {
  SchedulerClient,
  CreateScheduleCommand,
  DeleteScheduleCommand,
  GetScheduleCommand,
  UpdateScheduleCommand,
  FlexibleTimeWindowMode,
} from '@aws-sdk/client-scheduler';

const region = process.env.AWS_REGION || 'us-east-1';
const schedulerClient = new SchedulerClient({ region });

export interface ScheduleReminderParams {
  actionId: string;
  userId: string;
  email: string;
  reminderAt: string; // ISO string e.g. "2026-10-04T09:00:00.000Z"
  title: string;
  description: string;
  dueDate: string;
  source: string;
}

export async function createOrUpdateReminderSchedule(params: ScheduleReminderParams): Promise<string> {
  const scheduleName = `lifeos-rem-${params.actionId.replace(/[^a-zA-Z0-9_-]/g, '_')}`.slice(0, 64);
  const lambdaTargetArn = process.env.LAMBDA_FUNCTION_ARN || process.env.API_HANDLER_FUNCTION_ARN;
  const roleArn = process.env.SCHEDULER_ROLE_ARN;

  const dateObj = new Date(params.reminderAt);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid reminderAt date format: ${params.reminderAt}`);
  }

  const utcIso = dateObj.toISOString().split('.')[0];
  const scheduleExpression = `at(${utcIso})`;

  const payload = {
    source: 'aws.scheduler',
    type: 'LIFEOS_ACTION_REMINDER',
    actionId: params.actionId,
    userId: params.userId,
    email: params.email,
    title: params.title,
    description: params.description,
    dueDate: params.dueDate,
    sourceDocument: params.source,
    scheduledTime: params.reminderAt,
  };

  if (!lambdaTargetArn || !roleArn) {
    console.warn('[Scheduler] Missing LAMBDA_FUNCTION_ARN or SCHEDULER_ROLE_ARN. Recording schedule locally:', scheduleName);
    return scheduleName;
  }

  const scheduleParams = {
    Name: scheduleName,
    GroupName: 'default',
    ScheduleExpression: scheduleExpression,
    ScheduleExpressionTimezone: 'UTC',
    FlexibleTimeWindow: { Mode: FlexibleTimeWindowMode.OFF },
    Target: {
      Arn: lambdaTargetArn,
      RoleArn: roleArn,
      Input: JSON.stringify(payload),
      RetryPolicy: {
        MaximumEventAgeInSeconds: 86400,
        MaximumRetryAttempts: 3,
      },
    },
    State: 'ENABLED' as const,
    ActionAfterCompletion: 'DELETE' as const,
  };

  try {
    try {
      await schedulerClient.send(new GetScheduleCommand({ Name: scheduleName, GroupName: 'default' }));
      await schedulerClient.send(new UpdateScheduleCommand(scheduleParams));
      console.log(`[Scheduler] Updated schedule ${scheduleName} for ${utcIso}`);
    } catch (err: any) {
      if (err.name === 'ResourceNotFoundException') {
        await schedulerClient.send(new CreateScheduleCommand(scheduleParams));
        console.log(`[Scheduler] Created schedule ${scheduleName} for ${utcIso}`);
      } else {
        throw err;
      }
    }
    return scheduleName;
  } catch (error: any) {
    console.error(`[Scheduler] Error scheduling reminder for action ${params.actionId}:`, error);
    if (error.name === 'AccessDeniedException' || error.message?.includes('credentials')) {
      console.warn('[Scheduler] AWS permission warning, falling back to schedule ID:', scheduleName);
      return scheduleName;
    }
    throw error;
  }
}

export async function deleteReminderSchedule(scheduleName: string): Promise<boolean> {
  if (!scheduleName) return false;
  try {
    await schedulerClient.send(new DeleteScheduleCommand({ Name: scheduleName, GroupName: 'default' }));
    console.log(`[Scheduler] Deleted schedule ${scheduleName}`);
    return true;
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      return true;
    }
    console.warn(`[Scheduler] Notice deleting schedule ${scheduleName}:`, err.message || err);
    return false;
  }
}
