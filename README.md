# Trinity Finance Platform

AI-driven commercial lending platform. Full lifecycle: applicant intake, agentic qualification, document collection with stoplight verification, AI underwriting, bank-criteria matching, lender-PDF generation with digital signatures, post-funding portfolio monitoring, and a secondary loan marketplace.

**613 Chillicothe Street, Portsmouth, Ohio 45662**

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop

### 1. Clone & Install

```bash
git clone https://github.com/trinity-finance/platform.git
cd trinity-finance
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in required values:
- `ENCRYPTION_KEY`: Generate with `openssl rand -hex 32`
- `CLERK_SECRET_KEY`: From [clerk.com](https://clerk.com) dashboard
- `ANTHROPIC_API_KEY`: From [console.anthropic.com](https://console.anthropic.com)
- `AWS_*`: S3 bucket + IAM credentials (see DEPLOYMENT.md)
- `RESEND_API_KEY`: From [resend.com](https://resend.com)
- `TWILIO_*`: From [twilio.com](https://twilio.com)

### 3. Start Infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL (port 5432) and Redis (port 6379).

### 4. Initialize Database

```bash
pnpm db:push      # Apply schema to local Postgres
pnpm db:seed      # Seed: 3 bank rules, 5 applications, 1 marketplace listing
```

### 5. Run Development Servers

```bash
pnpm dev
```

- **Web app**: http://localhost:3000
- **Worker**: starts automatically in parallel
- **Prisma Studio**: `pnpm db:studio` -> http://localhost:5555
- **Redis Commander**: http://localhost:8081

---

## Project Structure

```
trinity-finance/
├── apps/
│   ├── web/                    # Next.js 14 App Router (all 4 portals)
│   └── worker/                 # BullMQ job processors
├── packages/
│   ├── db/                     # Prisma schema + client + encryption + audit
│   ├── ai/                     # Claude wrappers, prompts, email templates
│   ├── forms/                  # Declarative field schemas + conditional logic engine
│   ├── pdf/                    # Lender PDF mapping + signature merge
│   ├── stoplight/              # Document validation (Green/Yellow/Red)
│   └── ui/                     # Shared shadcn/ui components
├── prisma/
│   └── schema.prisma           # Full Prisma schema (30+ models)
├── docker-compose.yml          # Local Postgres + Redis
└── .env.example                # All required environment variables
```

---

## Portals

| URL | Access | Description |
|-----|--------|-------------|
| `/` | Public | Landing page |
| `/apply` | Public (no login required) | Applicant portal |
| `/apply/qualify` | Public | 10-question AI intake |
| `/apply/debt-relief` | Public | Debt Relief funnel |
| `/partner` | Clerk auth (Agent/Manager/Owner) | Referral partner portal |
| `/bank` | Clerk auth (Bank User) | Lender portal |
| `/admin` | Clerk auth (Admin) | Trinity ops console |

---

## Application Flow

```
/apply -> Quick App (Section 1) -> Loan Section (2-9) -> Signature
       -> Document Vault (upload + stoplight loop)
       -> AI Underwriting -> Bank Matching -> Offer Selection
       -> Lender PDF Package -> Funding -> Plaid Servicing
```

## Loan Sections

| Section | Route | Loan Type |
|---------|-------|-----------|
| 1 | `/apply` | Quick App (always) |
| 2 | `/apply/equipment` | Equipment Financing |
| 3 | `/apply/factoring` | Invoice Factoring |
| 4 | `/apply/invoice-financing` | Invoice Financing |
| 5 | `/apply/line-of-credit` | Line of Credit |
| 6 | `/apply/mca` | Merchant Cash Advance |
| 7 | `/apply/sba` | SBA |
| 8 | `/apply/unsure` | Unsure (AI recommends) |
| 9 | `/apply/debt-relief` | Debt Relief |

---

## Architecture

- **Framework**: Next.js 14 (App Router) + TypeScript
- **API**: tRPC with end-to-end type safety
- **Auth**: Clerk (multi-tenant, role-based)
- **DB**: PostgreSQL 15 via Prisma ORM
- **Queue**: BullMQ + Redis
- **AI**: Anthropic Claude (Opus for underwriting, Haiku for intake)
- **Files**: AWS S3 with KMS encryption
- **OCR**: AWS Textract + Claude vision fallback
- **PDF**: pdf-lib (forms) + Puppeteer (credit memos)
- **Email**: Resend | **SMS**: Twilio
- **Monitoring**: Sentry + Axiom

---

## Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all packages
pnpm type-check   # TypeScript check all packages
pnpm test         # Run all tests
pnpm db:push      # Push Prisma schema to DB
pnpm db:seed      # Run seed data
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations (production)
pnpm format       # Format all files
```
