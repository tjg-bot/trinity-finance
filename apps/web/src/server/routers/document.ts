/**
 * Document router - S3 presigned URLs, stoplight status, clarification notes.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { router, authedProcedure, assertCanAccessApplication } from "../trpc/trpc";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env["AWS_REGION"] ?? "us-east-1",
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
    },
  });
}

export const documentRouter = router({
  /**
   * Get a presigned S3 upload URL for a document.
   * Rate-limited to 50/hour/applicant in middleware.
   */
  getUploadUrl: authedProcedure
    .input(
      z.object({
        applicationId: z.string(),
        docType: z.enum([
          "GOVERNMENT_ID", "VOIDED_CHECK", "BANK_STATEMENT",
          "TAX_RETURN_BUSINESS", "TAX_RETURN_PERSONAL", "EQUIPMENT_QUOTE",
          "AR_AGING_REPORT", "SAMPLE_INVOICE", "CUSTOMER_LIST", "PNL_YTD",
          "BALANCE_SHEET", "DEBT_SCHEDULE", "BUSINESS_PLAN", "FRANCHISE_AGREEMENT",
          "REAL_ESTATE_APPRAISAL", "MCA_CONTRACT", "CREDIT_AUTHORIZATION", "OTHER",
        ]),
        filename: z.string().max(255),
        mimeType: z.string(),
        sizeBytes: z.number().max(MAX_FILE_SIZE),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File type not allowed. Accepted: PDF, JPG, PNG, HEIC`,
        });
      }

      const s3 = getS3Client();
      const bucket = process.env["AWS_S3_BUCKET"] ?? "";
      const s3Key = `documents/${input.applicationId}/${input.docType}/${Date.now()}_${input.filename}`;

      const uploadUrl = await getSignedUrl(
        s3,
        new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          ContentType: input.mimeType,
          ContentLength: input.sizeBytes,
          ServerSideEncryption: "aws:kms",
          Metadata: {
            applicationId: input.applicationId,
            docType: input.docType,
            uploadedBy: ctx.dbUser.id,
          },
        }),
        { expiresIn: 900 } // 15 minutes
      );

      // Create Document record
      const doc = await ctx.prisma.document.create({
        data: {
          applicationId: input.applicationId,
          docType: input.docType,
          s3Key,
          s3Bucket: bucket,
          originalFilename: input.filename,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          stoplightStatus: "PENDING",
          uploadedByUserId: ctx.dbUser.id,
        },
      });

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.DOC_UPLOAD,
        entity: "Document",
        entityId: doc.id,
        applicationId: input.applicationId,
        after: { docType: input.docType, s3Key },
      });

      return { uploadUrl, documentId: doc.id, s3Key };
    }),

  /**
   * Confirm upload complete and enqueue stoplight processing job.
   */
  confirmUpload: authedProcedure
    .input(
      z.object({
        documentId: z.string(),
        applicationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const doc = await ctx.prisma.document.findUnique({
        where: { id: input.documentId },
        include: {
          application: {
            include: { quickApp: true, owners: { take: 1 } },
          },
        },
      });
      if (!doc || doc.deletedAt) throw new TRPCError({ code: "NOT_FOUND" });

      // Enqueue BullMQ job via HTTP (worker runs separately)
      await enqueueStoplightJob({
        documentId: doc.id,
        s3Bucket: doc.s3Bucket,
        s3Key: doc.s3Key,
        docType: doc.docType,
        applicationId: doc.applicationId,
        legalBusinessName: doc.application.quickApp?.legalBusinessName ?? "",
        ownerName: doc.application.owners[0]?.fullName ?? "",
        declaredRevenue: doc.application.quickApp?.annualRevenue ?? "",
        desiredAmount: doc.application.quickApp?.desiredFundingAmount ?? "",
      });

      return { success: true, documentId: doc.id };
    }),

  /**
   * Get all documents and their stoplight status for an application.
   */
  getVault: authedProcedure
    .input(z.object({ applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const [documents, requests] = await Promise.all([
        ctx.prisma.document.findMany({
          where: { applicationId: input.applicationId, deletedAt: null },
          orderBy: { createdAt: "desc" },
        }),
        ctx.prisma.documentRequest.findMany({
          where: { applicationId: input.applicationId, deletedAt: null },
          include: { document: true },
        }),
      ]);

      return { documents, requests };
    }),

  /**
   * Submit clarification note for a YELLOW document.
   */
  submitClarification: authedProcedure
    .input(
      z.object({
        documentId: z.string(),
        applicationId: z.string(),
        clarificationNote: z.string().min(10).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      await ctx.prisma.document.update({
        where: { id: input.documentId },
        data: { clarificationNote: input.clarificationNote },
      });

      return { success: true };
    }),

  /**
   * Get a presigned download URL for a document (PII-gated with audit).
   */
  getDownloadUrl: authedProcedure
    .input(z.object({ documentId: z.string(), applicationId: z.string() }))
    .query(async ({ ctx, input }) => {
      await assertCanAccessApplication(ctx, input.applicationId);

      const doc = await ctx.prisma.document.findUnique({
        where: { id: input.documentId },
      });
      if (!doc || doc.deletedAt) throw new TRPCError({ code: "NOT_FOUND" });

      const s3 = getS3Client();
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: doc.s3Bucket,
          Key: doc.s3Key,
          ResponseContentDisposition: `attachment; filename="${doc.originalFilename}"`,
        }),
        { expiresIn: 300 } // 5 minutes
      );

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.READ_PII,
        entity: "Document",
        entityId: doc.id,
        applicationId: doc.applicationId,
        after: { action: "DOCUMENT_DOWNLOAD" },
      });

      return { url };
    }),

  /**
   * Admin: override stoplight status.
   */
  adminOverrideStatus: authedProcedure
    .input(
      z.object({
        documentId: z.string(),
        applicationId: z.string(),
        status: z.enum(["GREEN", "YELLOW", "RED", "PENDING"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.dbUser.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const doc = await ctx.prisma.document.findUnique({
        where: { id: input.documentId },
      });
      if (!doc) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.document.update({
        where: { id: input.documentId },
        data: { stoplightStatus: input.status },
      });

      await auditLog({
        actorUserId: ctx.dbUser.id,
        action: AuditActions.ADMIN_OVERRIDE,
        entity: "Document",
        entityId: input.documentId,
        applicationId: input.applicationId,
        before: { status: doc.stoplightStatus },
        after: { status: input.status, reason: input.reason },
      });

      return { success: true };
    }),
});

async function enqueueStoplightJob(data: {
  documentId: string;
  s3Bucket: string;
  s3Key: string;
  docType: string;
  applicationId: string;
  legalBusinessName: string;
  ownerName: string;
  declaredRevenue: string;
  desiredAmount: string;
}): Promise<void> {
  // In production, this uses the shared Redis connection
  // For now, enqueue via the worker's Bull queue
  const { Queue } = await import("bullmq");
  const { getRedisConnection } = await import("@/lib/redis");

  const queue = new Queue("stoplight", { connection: getRedisConnection() });
  await queue.add("process-document", data, {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}
