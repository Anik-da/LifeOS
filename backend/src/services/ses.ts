import { SESClient, SendEmailCommand, ListIdentitiesCommand } from '@aws-sdk/client-ses';

const region = process.env.AWS_REGION || 'us-east-1';
const sesClient = new SESClient({ region });

export interface SendReminderEmailParams {
  toEmail: string;
  title: string;
  description: string;
  dueDate: string;
  source: string;
  actionId: string;
}

export async function sendReminderEmail(params: SendReminderEmailParams): Promise<{ messageId?: string; isMock?: boolean }> {
  const fromEmail = process.env.SES_FROM_EMAIL || 'notifications@lifeos.app';
  const webAppUrl = process.env.LIFEOS_WEB_URL || 'http://062577348302-us-east-1-lifeos-web.s3-website-us-east-1.amazonaws.com/#/actions';

  const subject = `LifeOS Reminder: ${params.title}`;

  const textBody = `LifeOS — Personal Action Intelligence

You have an upcoming action that needs your attention.

ACTION:
${params.title}

${params.description || 'No description provided.'}

DEADLINE:
${params.dueDate || 'N/A'}

SOURCE EVIDENCE:
${params.source || 'LifeOS Document Intelligence'}

REMINDER:
This reminder was scheduled from your LifeOS Action Center.

Open LifeOS:
${webAppUrl}
`;

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07080b; color: #e2e8f0; margin: 0; padding: 24px; }
    .container { max-width: 560px; margin: 0 auto; background-color: #0d0f17; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .logo { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 24px; display: flex; items-center; gap: 8px; }
    .logo span { color: #3b82f6; }
    .badge { display: inline-block; background-color: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0; line-height: 1.3; }
    .desc { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; background-color: #131622; padding: 16px; border-radius: 10px; border-left: 4px solid #3b82f6; }
    .meta-box { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
    .meta-item { flex: 1; background-color: #131622; border: 1px solid rgba(255,255,255,0.05); padding: 12px 14px; border-radius: 10px; }
    .meta-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; tracking: 0.5px; margin-bottom: 4px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #f1f5f9; }
    .btn { display: inline-block; width: 100%; text-align: center; box-sizing: border-box; background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 14px 0; border-radius: 10px; shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4); margin-top: 8px; margin-bottom: 24px; }
    .footer { font-size: 11px; color: #64748b; text-align: center; border-t: 1px solid rgba(255,255,255,0.05); pt: 20px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Life<span>OS</span></div>
    <div class="badge">🔔 ACTION REMINDER</div>
    <h1 class="title">${params.title}</h1>
    <div class="desc">${params.description || 'No description provided.'}</div>
    
    <div class="meta-box">
      <div class="meta-item">
        <div class="meta-label">DUE DATE</div>
        <div class="meta-value" style="color: #f59e0b;">${params.dueDate || 'N/A'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">SOURCE EVIDENCE</div>
        <div class="meta-value">${params.source || 'LifeOS Document Intelligence'}</div>
      </div>
    </div>

    <a href="${webAppUrl}" class="btn" target="_blank">Open LifeOS Action Center →</a>

    <div class="footer">
      This reminder was scheduled from your LifeOS Action Center.<br/>
      Powered by Amazon SES & EventBridge Scheduler.
    </div>
  </div>
</body>
</html>`;

  try {
    const command = new SendEmailCommand({
      Source: fromEmail,
      Destination: {
        ToAddresses: [params.toEmail],
      },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Text: { Data: textBody, Charset: 'UTF-8' },
          Html: { Data: htmlBody, Charset: 'UTF-8' },
        },
      },
    });

    const response = await sesClient.send(command);
    console.log(`[SES] Reminder email sent to ${params.toEmail}, MessageId: ${response.MessageId}`);
    return { messageId: response.MessageId };
  } catch (err: any) {
    console.error(`[SES] Failed to send reminder email to ${params.toEmail}:`, err);
    if (err.name === 'MessageRejected' || err.name === 'AccountSendingPausedException' || err.message?.includes('IdentityNotVerified')) {
      console.warn(`[SES] Amazon SES Sandbox warning for recipient ${params.toEmail}: Recipient or Sender email identity requires verification in AWS SES Console.`);
    }
    throw err;
  }
}

export async function checkSESIdentityStatus(): Promise<{ verified: boolean; identities: string[] }> {
  try {
    const res = await sesClient.send(new ListIdentitiesCommand({ IdentityType: 'EmailAddress' }));
    return { verified: (res.Identities?.length || 0) > 0, identities: res.Identities || [] };
  } catch (err) {
    console.warn('[SES] Could not list SES identities:', err);
    return { verified: false, identities: [] };
  }
}
