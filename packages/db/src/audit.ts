/**
 * Audit logging helpers for Trinity Finance.
 * Every PII read, status change, doc upload, and signature must be logged.
 * Never include PII values in the log payload.
 */
import { prisma } from "./index";

export interface AuditParams {
  actorUserId?: string;
  action: string;
  entity: string;
  entityId: string;
  applicationId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export async function auditLog(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      applicationId: params.applicationId,
      before: params.before ?? undefined,
      after: params.after ?? undefined,
      ip: params.ip,
      userAgent: params.userAgent,
    },
  });
}

export const AuditActions = {
  READ_PII: "READ_PII",
  STATUS_CHANGE: "STATUS_CHANGE",
  DOC_UPLOAD: "DOC_UPLOAD",
  DOC_STOPLIGHT_CHANGE: "DOC_STOPLIGHT_CHANGE",
  SIGNATURE_CAPTURE: "SIGNATURE_CAPTURE",
  MATCH_CREATED: "MATCH_CREATED",
  OFFER_SELECTED: "OFFER_SELECTED",
  FUNDED: "FUNDED",
  PLAID_CONNECTED: "PLAID_CONNECTED",
  USER_EXPORT: "USER_EXPORT",
  USER_DELETE_REQUEST: "USER_DELETE_REQUEST",
  ADMIN_OVERRIDE: "ADMIN_OVERRIDE",
  LOGIN: "LOGIN",
  FORM_SAVE: "FORM_SAVE",
} as const;
