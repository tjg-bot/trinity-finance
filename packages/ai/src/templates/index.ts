/**
 * Email + SMS templates for stoplight follow-ups.
 * All emails are branded; SMS is plain text with shortlink.
 */

export interface FollowUpContext {
  applicantName: string;
  businessName: string;
  docType: string;
  docDisplayName: string;
  applicationId: string;
  deepLinkUrl: string;
  agentName?: string;
}

// ─────────────────────────────────────────────────────────────
// RED DOC - IMMEDIATE (T+0)
// ─────────────────────────────────────────────────────────────

export function redDocEmailSubject(ctx: FollowUpContext): string {
  return `Action Required: Document Needs to Be Re-Uploaded - ${ctx.businessName}`;
}

export function redDocEmailHtml(ctx: FollowUpContext): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #0B2545; padding: 32px; text-align: center; }
    .header h1 { color: #C9A227; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
    .body { padding: 32px; }
    .alert { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
    .btn { display: inline-block; background: #C9A227; color: #0B2545; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 15px; }
    .footer { background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Trinity Finance</h1>
    </div>
    <div class="body">
      <p>Hello ${ctx.applicantName},</p>
      <div class="alert">
        <strong>Document Issue Detected</strong><br/>
        We were unable to process your <strong>${ctx.docDisplayName}</strong> for <strong>${ctx.businessName}</strong>.
      </div>
      <p>Please re-upload a clear, complete copy of this document to continue your application. Common issues include:</p>
      <ul>
        <li>Image quality too low or blurry</li>
        <li>Missing pages</li>
        <li>Wrong document uploaded</li>
        <li>Name on document does not match application</li>
      </ul>
      <p style="text-align:center;margin:32px 0;">
        <a class="btn" href="${ctx.deepLinkUrl}">Re-Upload Document</a>
      </p>
      <p>Questions? Reply to this email or call us at <strong>(740) 555-0100</strong>.</p>
      <p>- The Trinity Finance Team<br/>613 Chillicothe Street, Portsmouth, Ohio 45662</p>
    </div>
    <div class="footer">This email was sent regarding Application #${ctx.applicationId}. Do not share this link.</div>
  </div>
</body>
</html>`;
}

export function redDocSms(ctx: FollowUpContext): string {
  return `Trinity Finance: Your ${ctx.docDisplayName} for ${ctx.businessName} needs to be re-uploaded. Please visit: ${ctx.deepLinkUrl}`;
}

// ─────────────────────────────────────────────────────────────
// REMINDER (T+24h)
// ─────────────────────────────────────────────────────────────

export function reminderEmailSubject(ctx: FollowUpContext): string {
  return `Reminder: Document Still Needed - ${ctx.businessName}`;
}

export function reminderEmailHtml(ctx: FollowUpContext): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Inter, Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #0B2545; padding: 32px; text-align: center; }
    .header h1 { color: #C9A227; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .btn { display: inline-block; background: #C9A227; color: #0B2545; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; }
    .footer { background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Trinity Finance</h1></div>
    <div class="body">
      <p>Hello ${ctx.applicantName},</p>
      <p>We're still waiting on your <strong>${ctx.docDisplayName}</strong> for <strong>${ctx.businessName}</strong>. Your application cannot advance until this document is uploaded and verified.</p>
      <p style="text-align:center;margin:32px 0;">
        <a class="btn" href="${ctx.deepLinkUrl}">Upload Now</a>
      </p>
      <p>- The Trinity Finance Team</p>
    </div>
    <div class="footer">Application #${ctx.applicationId}</div>
  </div>
</body>
</html>`;
}

export function reminderSms(ctx: FollowUpContext): string {
  return `Trinity Finance reminder: We still need your ${ctx.docDisplayName} for ${ctx.businessName}. Upload here: ${ctx.deepLinkUrl}`;
}

// ─────────────────────────────────────────────────────────────
// ESCALATION TO AGENT (T+72h)
// ─────────────────────────────────────────────────────────────

export function escalationEmailSubject(ctx: FollowUpContext): string {
  return `ESCALATION: Applicant Has Not Re-Uploaded Document - ${ctx.businessName}`;
}

export function escalationEmailHtml(ctx: FollowUpContext): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
  body { font-family: Inter, Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #0B2545; padding: 24px 32px; }
  .header h1 { color: #C9A227; margin: 0; font-size: 20px; }
  .body { padding: 32px; }
  .btn { display: inline-block; background: #DC2626; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 700; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Trinity Finance - Agent Alert</h1></div>
    <div class="body">
      <p>Hello ${ctx.agentName ?? "Agent"},</p>
      <p><strong>${ctx.applicantName}</strong> at <strong>${ctx.businessName}</strong> has not re-uploaded their <strong>${ctx.docDisplayName}</strong> after 72 hours of requests.</p>
      <p>Application ID: <strong>${ctx.applicationId}</strong></p>
      <p>Please reach out directly to help resolve the issue.</p>
      <p><a class="btn" href="${ctx.deepLinkUrl}">View Application</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// YELLOW DOC - CLARIFICATION REQUEST
// ─────────────────────────────────────────────────────────────

export function yellowDocEmailSubject(ctx: FollowUpContext): string {
  return `Clarification Needed on Your Document - ${ctx.businessName}`;
}

export function yellowDocEmailHtml(ctx: FollowUpContext, clarificationNote: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
  body { font-family: Inter, Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #0B2545; padding: 24px 32px; }
  .header h1 { color: #C9A227; margin: 0; font-size: 22px; }
  .body { padding: 32px; }
  .notice { background: #FEFCE8; border-left: 4px solid #EAB308; padding: 16px; border-radius: 4px; margin-bottom: 24px; }
  .btn { display: inline-block; background: #C9A227; color: #0B2545; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Trinity Finance</h1></div>
    <div class="body">
      <p>Hello ${ctx.applicantName},</p>
      <div class="notice">
        <strong>Your document has been accepted, but we have a question:</strong><br/><br/>
        ${clarificationNote}
      </div>
      <p>Please log in and provide a written explanation for the above.</p>
      <p><a class="btn" href="${ctx.deepLinkUrl}">Provide Explanation</a></p>
      <p>- The Trinity Finance Team</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// DEBT RELIEF CROSS-SELL
// ─────────────────────────────────────────────────────────────

export function debtReliefCrossSellEmailSubject(businessName: string): string {
  return `${businessName}: You May Qualify for Debt Relief - Trinity Finance`;
}

export function debtReliefCrossSellEmailHtml(
  applicantName: string,
  businessName: string,
  deepLinkUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><style>
  body { font-family: Inter, Arial, sans-serif; color: #1a1a1a; background: #f5f5f5; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #0B2545; padding: 24px 32px; }
  .header h1 { color: #C9A227; margin: 0; font-size: 22px; }
  .body { padding: 32px; }
  .btn { display: inline-block; background: #C9A227; color: #0B2545; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Trinity Finance</h1></div>
    <div class="body">
      <p>Hello ${applicantName},</p>
      <p>Based on your application for <strong>${businessName}</strong>, you may qualify for our <strong>Business Debt Relief Program</strong> - which could help restructure your high-interest debt into a more manageable payment.</p>
      <p>Many businesses in similar situations have saved thousands per month by consolidating MCAs and other high-interest obligations.</p>
      <p><a class="btn" href="${deepLinkUrl}">See If You Qualify - Free Analysis</a></p>
      <p>This is a no-obligation review. Your existing application continues in parallel.</p>
      <p>- The Trinity Finance Team<br/>613 Chillicothe Street, Portsmouth, Ohio 45662</p>
    </div>
  </div>
</body>
</html>`;
}

export function debtReliefCrossSellSms(
  businessName: string,
  deepLinkUrl: string
): string {
  return `Trinity Finance: ${businessName} may qualify for our Debt Relief Program. Free analysis - no obligation: ${deepLinkUrl}`;
}
