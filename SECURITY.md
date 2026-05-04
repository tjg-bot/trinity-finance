# Trinity Finance - Security Documentation

## Encryption

### PII at Rest (AES-256-GCM)
The following fields are encrypted before storage using AES-256-GCM:
- `Owner.ssn` - Social Security Number
- `Owner.dateOfBirth` - Date of Birth
- `Owner.dlNumber` - Driver's License Number
- `BankReference.accountNumbers` - Bank account numbers
- `Signature.signaturePngS3Key` - S3 key reference to signature image
- `PlaidConnection.accessToken` - Plaid API access token

**Key Management**:
- Encryption key stored as `ENCRYPTION_KEY` environment variable (64 hex chars / 32 bytes)
- In production: use AWS KMS to wrap the data key; rotate annually
- Never commit `ENCRYPTION_KEY` to version control

**Implementation**: `packages/db/src/encryption.ts`
- Algorithm: AES-256-GCM
- IV: 12-byte random (per-encryption)
- Auth tag: 16 bytes
- Ciphertext format: `base64(iv + authTag + ciphertext)`

### S3 Encryption (AWS KMS)
- All S3 objects use `aws:kms` server-side encryption
- Public access is blocked at the bucket level
- Presigned URLs expire in 15 minutes (uploads) / 5 minutes (downloads)

### TLS
- Vercel enforces TLS 1.2+ with automatic HTTPS
- HSTS header set: `max-age=63072000; includeSubDomains; preload`

---

## Authentication & Authorization

### Clerk (Authentication)
- All portal routes (`/partner`, `/bank`, `/admin`) require valid Clerk session
- `middleware.ts` enforces authentication before any portal API call
- Webhook signature verified via `svix` library

### Role-Based Access Control
Roles: `APPLICANT | AGENT | MANAGER | OWNER | BANK_USER | ADMIN`

| Route/Action | APPLICANT | AGENT | MANAGER | OWNER | BANK_USER | ADMIN |
|---|---|---|---|---|---|---|
| View own application | YES | - | - | - | - | YES |
| View agent's deals | - | YES (own only) | YES (bucket) | YES (all) | - | YES |
| Bank pipeline | - | - | - | - | YES (own org) | YES |
| Override stoplight | - | - | - | - | - | YES |
| Admin console | - | - | - | - | - | YES |

**Application scoping** enforced by `assertCanAccessApplication()` in `apps/web/src/server/trpc/trpc.ts`.
An AGENT cannot access another agent's application via any API call - verified at the tRPC middleware layer.

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/apply` submissions | 10/hour/IP |
| Document uploads | 50/hour/applicant |
| tRPC endpoints | 100/min/IP (Vercel edge) |

Enforced in `apps/web/src/middleware.ts`.

---

## Audit Logging

Every significant action is logged to `AuditLog`:
- Every PII field read (`READ_PII`)
- Every status change (`STATUS_CHANGE`)
- Every document upload (`DOC_UPLOAD`)
- Every stoplight change (`DOC_STOPLIGHT_CHANGE`)
- Every signature capture (`SIGNATURE_CAPTURE`)
- Every match created (`MATCH_CREATED`)
- Every offer selection (`OFFER_SELECTED`)
- Every admin override (`ADMIN_OVERRIDE`)
- User data exports (`USER_EXPORT`)
- User deletion requests (`USER_DELETE_REQUEST`)

Audit records are **never hard-deleted** (no `deletedAt` on `AuditLog`).

---

## File Upload Security

- File type whitelist enforced server-side: PDF, JPG, PNG, HEIC
- Max file size: 25MB
- Virus scanning: ClamAV worker runs before Textract (scaffold in `stoplightProcessor`)
- Files stored in private S3 bucket - never publicly accessible
- Download via short-lived presigned URLs (5 minute expiry)

---

## Data Retention

- Funded loans: 7-year minimum (state-specific overrides in `packages/db/src/retention.ts`)
- California, New York: 10 years
- Soft-delete only: `deletedAt` timestamp, records never hard-deleted
- User deletion requests: 30-day grace period before soft-delete

---

## PII in Logs

**NEVER logged**:
- SSN values
- Date of birth values
- Driver's license numbers
- Bank account numbers
- Signature images
- Plaid access tokens
- Encryption keys

Sentry is configured to scrub PII fields from error reports.
Axiom logs use structured JSON and never include encrypted field values.

---

## GDPR / CCPA Compliance

**Data Export**: `GET /api/me/export`
- Returns full user record + all applications as JSON
- Excludes SSN, DL numbers (never exported for security)
- Logged in `AuditLog` as `USER_EXPORT`

**Data Deletion**: `POST /api/trpc/user.requestDeletion`
- 30-day soft-delete grace period
- Cannot delete if active loan in servicing
- Logged in `AuditLog` as `USER_DELETE_REQUEST`

---

## SOC 2 Readiness

- [x] Encryption at rest for all PII
- [x] TLS 1.3 in transit
- [x] Role-based access control
- [x] Comprehensive audit logging
- [x] No secrets in code (all via env vars)
- [x] Soft-delete with retention policies
- [x] Rate limiting on sensitive endpoints
- [x] File type validation + size limits
- [x] Error monitoring (Sentry)
- [x] Structured logs (Axiom)
- [ ] Penetration test (schedule before go-live)
- [ ] SOC 2 Type 1 audit (engage auditor)
- [ ] Background checks on employees with PII access

---

## Incident Response

1. **Detect**: Sentry alert or Axiom anomaly
2. **Contain**: Rotate affected credentials immediately (`ENCRYPTION_KEY`, AWS keys, Clerk keys)
3. **Assess**: Check `AuditLog` for unauthorized `READ_PII` actions
4. **Notify**: If PII breach: notify affected users within 72 hours (GDPR), 45 days (CCPA)
5. **Remediate**: Fix root cause, deploy patch
6. **Review**: Post-incident report, update runbook

**Key rotation procedure**:
```bash
# 1. Generate new encryption key
openssl rand -hex 32

# 2. Run migration script to re-encrypt all PII fields
# (see packages/db/src/migrate-encryption.ts - must be built before incident)

# 3. Update ENCRYPTION_KEY in Vercel + Railway

# 4. Rotate AWS credentials in IAM console

# 5. Invalidate all Clerk sessions
```
