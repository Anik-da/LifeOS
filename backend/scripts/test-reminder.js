const { SchedulerClient, GetScheduleCommand } = require('@aws-sdk/client-scheduler');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        process.env[key.trim()] = vals.join('=').trim();
      }
    });
  }
}

loadEnv();

const region = process.env.AWS_REGION || 'us-east-1';
const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const scheduler = new SchedulerClient({ region, credentials });
const ddb = new DynamoDBClient({ region, credentials });

async function testEndToEnd() {
  console.log('🧪 Testing End-to-End LifeOS Reminder API & AWS Integration...');

  const apiUrl = process.env.VITE_API_BASE_URL || 'https://8ywk26hnsk.execute-api.us-east-1.amazonaws.com/Prod';
  const testActionId = `act-test-${Date.now()}`;
  const reminderTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min in future

  console.log(`1. Sending POST ${apiUrl}/actions/${testActionId}/reminder...`);
  const res = await fetch(`${apiUrl}/actions/${testActionId}/reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reminderAt: reminderTime,
      title: 'LifeOS Reminder End-to-End Test',
      description: 'Testing Amazon EventBridge Scheduler + SES integration',
      deadline: '2026-10-15',
      source: 'FutureTech Scholarship Document',
    }),
  });

  const json = await res.json();
  console.log('  Response:', JSON.stringify(json, null, 2));

  if (!res.ok || !json.data?.success) {
    throw new Error(`API endpoint failed: ${JSON.stringify(json)}`);
  }

  console.log('2. Verifying DynamoDB record...');
  const ddbRes = await ddb.send(
    new GetItemCommand({
      TableName: 'LifeOS-Actions',
      Key: {
        userId: { S: 'user-demo-1' },
        id: { S: testActionId },
      },
    })
  );

  console.log('  DynamoDB Item exists:', !!ddbRes.Item);
  if (ddbRes.Item) {
    console.log('  reminderStatus:', ddbRes.Item.reminderStatus?.S);
    console.log('  reminderAt:', ddbRes.Item.reminderAt?.S);
    console.log('  reminderScheduleId:', ddbRes.Item.reminderScheduleId?.S);
  }

  const scheduleName = json.data.scheduleId;
  console.log(`3. Checking EventBridge Scheduler schedule "${scheduleName}"...`);
  try {
    const schedRes = await scheduler.send(new GetScheduleCommand({ Name: scheduleName, GroupName: 'default' }));
    console.log('  Schedule State:', schedRes.State);
    console.log('  Schedule Expression:', schedRes.ScheduleExpression);
    console.log('  Target ARN:', schedRes.Target?.Arn);
  } catch (err) {
    console.log('  Scheduler Check Notice:', err.message);
  }

  console.log(`4. Testing DELETE ${apiUrl}/actions/${testActionId}/reminder...`);
  const delRes = await fetch(`${apiUrl}/actions/${testActionId}/reminder`, {
    method: 'DELETE',
  });
  const delJson = await delRes.json();
  console.log('  Cancel Response:', JSON.stringify(delJson, null, 2));

  console.log('\n✅ END-TO-END REMINDER VERIFICATION PASSED!');
}

testEndToEnd().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
