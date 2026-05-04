/**
 * Signature router - capture canvas signature, store as S3 PNG with audit trail.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { router, authedProcedure, publicProcedure, assertCanAccessApplication } from "../trpc/trpc";
import { encrypt } from "@trinity/db/src/encryption";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env["AWS_REGION"] ?? "us-east-1",
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
    },
  });
}

export const signatureRouter = router({
  /**
   * Capture and store a signature.
   * The PNG data URL is stripped of the data:image/png;base64, prefix,
   * uploaded to S3 with encryption, and the S3 key is encrypted in the DB.
   */
  capture: publicProcedure
    .input(
      z.object({
        applicationId: z.string(),
        signerName: z.string().min(1),
        signerTitle: z.string().min(1),
        businessName: z.string().min(1),
        signatureDataUrl: z.string().startsWith("data:image/png;base64,"),
        ip: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId, deletedAt: null },
      });
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });

      // Upload signature PNG to S3
      const base64Data = input.signatureDataUrl.replace("data:image/png;base64,", "");
      const pngBuffer = Buffer.from(base64Data, "base64");

      const s3 = getS3Client();
      const bucket = process.env["AWS_S3_BUCKET"] ?? "";
      const s3Key = `signatures/${input.applicationId}/${Date.now()}_sig.png`;

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          Body: pngBuffer,
          ContentType: "image/png",
          ServerSideEncryption: "aws:kms",
        })
      );

      // Store encrypted reference to S3 key
      const encryptedS3Key = encrypt(s3Key);

      const signature = await ctx.prisma.signature.create({
        data: {
          applicationId: input.applicationId,
          signerUserId: ctx.dbUser?.id,
          signerName: input.signerName,
          signerTitle: input.signerTitle,
          businessName: input.businessName,
          signaturePngS3Key: encryptedS3Key,
          ip: input.ip ?? "unknown",
          userAgent: input.userAgent ?? "unknown",
        },
      });

      // Move application to DOCS_PENDING after signature
      await ctx.prisma.application.update({
        where: { id: input.applicationId },
        data: { status: "DOCS_PENDING" },
      });

      await auditLog({
        actorUserId: ctx.dbUser?.id,
        action: AuditActions.SIGNATURE_CAPTURE,
        entity: "Signature",
        entityId: signature.id,
        applicationId: input.applicationId,
        after: {
          signerName: input.signerName,
          signerTitle: input.signerTitle,
          businessName: input.businessName,
          // Never log the actual signature data
        },
        ip: input.ip,
        userAgent: input.userAgent,
      });

      return { signatureId: signature.id, success: true };
    }),
});
