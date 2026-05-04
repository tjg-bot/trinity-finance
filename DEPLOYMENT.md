# Trinity Finance - Deployment Guide

## Production Stack

| Service | Provider | Purpose |
|---------|----------|---------|
| Web App | Vercel | Next.js hosting + Edge functions |
| Postgres | Railway | PostgreSQL 15 database |
| Redis | Railway | BullMQ queues + rate limiting |
| Worker | Railway | BullMQ background processor |
| Files | AWS S3 | Document storage (KMS encrypted) |
| OCR | AWS Textract | Document extraction |
| Auth | Clerk | Multi-tenant authentication |
| Email | Resend | Transactional emails |
| SMS | Twilio | Follow-up notifications |
| Errors | Sentry | Error monitoring |
| Logs | Axiom | Structured log aggregation |

---

## Step 1: Railway Setup (Postgres + Redis + Worker)

### 1.1 Create Railway Project

```bash
npm install -g @railway/cli
railway login
railway init
```

### 1.2 Add Postgres Service

In Railway dashboard:
1. New Service -> Database -> PostgreSQL 15
2. Copy `DATABASE_URL` from the service settings

### 1.3 Add Redis Service

1. New Service -> Database -> Redis
2. Copy `REDIS_URL` from service settings

### 1.4 Deploy Worker

In Railway dashboard:
1. New Service -> Deploy from GitHub repo
2. Set Root Directory: `apps/worker`
3. Start Command: `pnpm build && pnpm start`
4. Add all environment variables from `.env.example`

### 1.5 Run Database Migrations

```bash
railway run --service postgres pnpm db:migrate
railway run pnpm db:seed
```

---

## Step 2: AWS Setup

### 2.1 Create S3 Bucket

```bash
aws s3api create-bucket \
  --bucket trinity-finance-docs-prod \
  --region us-east-1

# Enable KMS encryption
aws s3api put-bucket-encryption \
  --bucket trinity-finance-docs-prod \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms"
      },
      "BucketKeyEnabled": true
    }]
  }'

# Block all public access
aws s3api put-public-access-block \
  --bucket trinity-finance-docs-prod \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 2.2 Create IAM User

```bash
aws iam create-user --user-name trinity-finance-app

aws iam attach-user-policy \
  --user-name trinity-finance-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-user-policy \
  --user-name trinity-finance-app \
  --policy-arn arn:aws:iam::aws:policy/AmazonTextractFullAccess

aws iam create-access-key --user-name trinity-finance-app
```

Save the `AccessKeyId` and `SecretAccessKey` as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

### 2.3 Generate Encryption Key

```bash
openssl rand -hex 32
# Save as ENCRYPTION_KEY
```

---

## Step 3: Clerk Setup

1. Create organization at [clerk.com](https://clerk.com)
2. Create application: "Trinity Finance"
3. Enable: Email + SMS passwordless
4. Configure roles in Clerk Dashboard: APPLICANT, AGENT, MANAGER, OWNER, BANK_USER, ADMIN
5. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
6. Copy keys to environment variables

---

## Step 4: Vercel Deployment (Web App)

### 4.1 Connect Repository

```bash
npm install -g vercel
vercel login
vercel link
```

### 4.2 Set Environment Variables

```bash
# Copy from .env.example and fill in production values
vercel env add DATABASE_URL
vercel env add ENCRYPTION_KEY
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_S3_BUCKET
vercel env add REDIS_URL
vercel env add RESEND_API_KEY
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add SENTRY_DSN
```

### 4.3 Deploy

```bash
# Preview deployment
vercel deploy

# Production deployment
vercel deploy --prod
```

### 4.4 Configure Domain

In Vercel dashboard:
1. Settings -> Domains
2. Add `trinityfinance.com` and `www.trinityfinance.com`
3. Update DNS at your registrar:
   - A record: `76.76.21.21` (Vercel IP)
   - CNAME: `www` -> `cname.vercel-dns.com`

---

## Step 5: DNS Configuration

```
trinityfinance.com.        A      76.76.21.21
www.trinityfinance.com.    CNAME  cname.vercel-dns.com
```

Clerk custom domain (optional but recommended):
```
clerk.trinityfinance.com.  CNAME  frontend-api.clerk.dev
```

---

## Step 6: Post-Deployment Verification

```bash
# Check database connection
curl https://trinityfinance.com/api/health

# Verify Clerk webhook is receiving events
# (create a test user and check logs)

# Verify S3 uploads work
# (submit a test application and upload a document)

# Check BullMQ worker is running in Railway
railway logs --service worker
```

---

## Environment-Specific Notes

### Plaid
- Start with `PLAID_ENV=sandbox` for testing
- Use Plaid Link test credentials for sandbox
- Switch to `production` after going live

### AWS Textract
- Async document analysis can take 15-120 seconds
- BullMQ handles polling with exponential backoff
- Fallback to Claude vision if Textract times out

### Sentry
- Set `SENTRY_DSN` - Sentry auto-instruments Next.js
- PII scrubbing: configured in `sentry.config.ts` (never logs SSN, DOB, DL)
