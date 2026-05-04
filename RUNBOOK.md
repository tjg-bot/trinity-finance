# Trinity Finance - Operations Runbook

## What to Do If Plaid Disconnects

**Symptom**: Plaid webhook fires `ITEM.ERROR` or servicing events stop updating.

**Steps**:
1. Check Railway logs for the worker service: `railway logs --service worker`
2. Find the affected `PlaidConnection` in the database:
   ```sql
   SELECT * FROM "PlaidConnection" WHERE "isActive" = false ORDER BY "updatedAt" DESC;
   ```
3. The applicant will receive an automatic alert to reconnect.
4. If not, manually trigger reconnect email:
   ```bash
   curl -X POST https://trinityfinance.com/api/admin/plaid-reconnect \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -d '{"applicationId": "app_xxx"}'
   ```
5. Applicant clicks link -> Plaid Link re-authentication flow
6. New `access_token` is encrypted and stored; `isActive` set back to `true`

---

## How to Override a Stoplight State

**When**: Admin needs to manually approve/reject a document.

**Steps**:
1. Log in to `/admin` as an ADMIN role user
2. Find the application -> Document Vault section
3. Click the "Override" button next to the document
4. Select new status (GREEN/YELLOW/RED) and enter reason
5. This calls `document.adminOverrideStatus` via tRPC which:
   - Updates `Document.stoplightStatus`
   - Creates an `AuditLog` entry with actor, before/after state
   - If GREEN: re-runs underwriting trigger check

**Via database (emergency)**:
```sql
UPDATE "Document"
SET "stoplightStatus" = 'GREEN', "updatedAt" = NOW()
WHERE id = 'doc_xxx';

-- Then log the override
INSERT INTO "AuditLog" (id, "actorUserId", action, entity, "entityId", after)
VALUES (gen_random_uuid(), 'user_xxx', 'ADMIN_OVERRIDE', 'Document', 'doc_xxx',
        '{"status": "GREEN", "reason": "Manual review completed"}');
```

---

## How to Re-run a Stalled Underwriting Job

**Symptom**: Application stuck in `UNDERWRITING` status, no matches created.

**Check**:
```bash
# View failed jobs in Redis
railway run redis-cli -u $REDIS_URL LRANGE bullmq:underwriting:failed 0 10
```

**Fix**:
1. In Railway console, find the failed job ID from logs
2. Re-queue manually:
   ```bash
   railway run --service worker node -e "
   const { Queue } = require('bullmq');
   const queue = new Queue('underwriting', {
     connection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }
   });
   queue.add('run-underwriting', { applicationId: 'app_xxx' }, { removeOnComplete: 50 });
   console.log('Job queued');
   "
   ```
3. Or via admin panel: `/admin/deals` -> find application -> "Re-run Underwriting"

**Root causes to check**:
- Claude API timeout: check `ANTHROPIC_API_KEY` is valid
- Postgres connection: check `DATABASE_URL`
- S3 access: check `AWS_*` credentials

---

## How to Add a New Lender PDF Template

1. Obtain the lender's PDF with named form fields
2. Save to: `packages/pdf/templates/lenders/{lenderId}/template-v1.pdf`
3. Add field mapping in `packages/pdf/src/lenders/registry.ts`:
   ```typescript
   "new-lender-id": {
     name: "New Lender Name",
     templatePath: path.join(__dirname, "../templates/lenders/new-lender-id/template-v1.pdf"),
     fields: [
       { trinityField: "quickApp.legalBusinessName", lenderField: "BusinessName" },
       // ... map all required fields
     ],
   },
   ```
4. Create the lender's `Organization` record in the DB:
   ```sql
   INSERT INTO "Organization" (id, name, type)
   VALUES ('new-lender-id', 'New Lender Name', 'BANK');
   ```
5. Create `BankRule` with the lender's criteria
6. Deploy updated code
7. Test: submit a test application, select the new lender's offer, verify PDF generation

**PDF field inspection tool**:
```bash
# Find all named fields in a PDF
node -e "
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const bytes = fs.readFileSync('template.pdf');
PDFDocument.load(bytes).then(doc => {
  const fields = doc.getForm().getFields();
  fields.forEach(f => console.log(f.getName(), '-', f.constructor.name));
});
"
```

---

## How to Handle a Delinquent Loan (Phase 4)

1. Worker fires `DELINQUENCY_ALERT` `ServicingEvent`
2. Applicant receives SMS one-click pay link (Stripe)
3. If unpaid after 7 days: escalate to ops team email
4. Trinity ops contacts applicant directly
5. If payment arrangement needed: update `ServicingEvent.resolvedAt` and `payload`

---

## How to Add/Modify a Referral Org Hierarchy

**Add a new Owner** (top-level):
```sql
-- Create org
INSERT INTO "Organization" (id, name, type) VALUES (gen_random_uuid(), 'New Partner Org', 'REFERRAL');

-- Grant OWNER role to a user
UPDATE "User" SET role = 'OWNER' WHERE email = 'owner@example.com';

INSERT INTO "OrgMembership" (id, "userId", "organizationId", tier)
VALUES (gen_random_uuid(), 'user_xxx', 'org_xxx', 'OWNER');
```

**Add a Manager bucket**:
```sql
INSERT INTO "OrgMembership" (id, "userId", "organizationId", tier, "bucketId")
VALUES (gen_random_uuid(), 'user_manager', 'org_xxx', 'MANAGER', 'bucket-ohio-east');
```

**Add an Agent to a bucket**:
```sql
INSERT INTO "OrgMembership" (id, "userId", "organizationId", tier, "bucketId")
VALUES (gen_random_uuid(), 'user_agent', 'org_xxx', 'AGENT', 'bucket-ohio-east');
```

---

## Emergency Contacts

- **Database issues**: Railway support + check `DATABASE_URL` connection pooling
- **Claude API down**: [status.anthropic.com](https://status.anthropic.com) - underwriting jobs will retry 2x
- **S3 down**: AWS Service Health Dashboard - uploads will fail gracefully with error message to applicant
- **Clerk auth down**: [status.clerk.com](https://status.clerk.com) - public /apply pages continue working (no auth required)

---

## Log Queries (Axiom)

```bash
# All errors in last hour
dataset:trinity-finance-prod level:error | limit 100

# PII access audit
dataset:trinity-finance-prod action:READ_PII | limit 50

# Failed underwriting jobs
dataset:trinity-finance-prod processor:underwriting failed | limit 20

# Stoplight RED events
dataset:trinity-finance-prod action:DOC_STOPLIGHT_CHANGE status:RED | limit 50
```
