/**
 * Signature router - capture canvas signature, store as S3 PNG with audit trail.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { router, authedProcedure, publicProcedure, assertCanAccessApplication } from "../trpc/trpc";
import { encrypt } from "@trinity/db/src/encryption";
import { auditLog, AuditActions } from "@trinity/db/src/audit";
import { Resend } from "resend";

const NOTIFY_EMAIL = "morgan@financetrinity.com";

async function sendApplicationNotification(
  applicationId: string,
  signerName: string,
  signerTitle: string,
  businessName: string,
  quickApp: Record<string, unknown> | null
) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return; // Silently skip until Resend is activated

  const resend = new Resend(apiKey);

  const fields = quickApp
    ? Object.entries(quickApp)
        .filter(([k]) => !["id", "applicationId", "createdAt", "updatedAt"].includes(k))
        .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555;font-size:13px;white-space:nowrap">${k}</td><td style="padding:4px 0;font-size:13px;color:#111">${String(v ?? "")}</td></tr>`)
        .join("")
    : "<tr><td colspan='2'>No quick app data saved</td></tr>";

  await resend.emails.send({
    from: "Trinity Finance <noreply@financetrinity.com>",
    to: NOTIFY_EMAIL,
    subject: `New Application Signed: ${businessName} (${applicationId.slice(0, 8)})`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:640px;margin:0 auto">
        <div style="background:#0B2545;padding:24px 32px">
          <h1 style="color:#C9A227;margin:0;font-size:20px">New Application Submitted</h1>
          <p style="color:#fff;margin:4px 0 0;font-size:13px">Trinity Finance Platform</p>
        </div>
        <div style="padding:24px 32px;background:#fff;border:1px solid #e5e7eb">
          <table style="width:100%;margin-bottom:24px">
            <tr><td style="padding:4px 12px 4px 0;color:#555;font-size:13px">Application ID</td><td style="font-size:13px;color:#111;font-family:monospace">${applicationId}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#555;font-size:13px">Business Name</td><td style="font-size:13px;color:#111;font-weight:600">${businessName}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#555;font-size:13px">Signer</td><td style="font-size:13px;color:#111">${signerName} — ${signerTitle}</td></tr>
          </table>
          <h2 style="font-size:14px;color:#0B2545;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:12px">Application Details</h2>
          <table style="width:100%">${fields}</table>
          <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:6px">
            <a href="https://trinity-finance.vercel.app/admin" style="color:#0B2545;font-size:13px;font-weight:600">View in Admin Dashboard →</a>
          </div>
        </div>
        <p style="color:#9ca3af;font-size:11px;padding:16px 32px 0">Trinity Finance · 613 Chillicothe St, Portsmouth, OH</p>
      </div>
    `,
  });
}

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

      // Email full application to Morgan
      const fullApp = await ctx.prisma.application.findUnique({
        where: { id: input.applicationId },
        include: { quickApp: true },
      });
      await sendApplicationNotification(
        input.applicationId,
        input.signerName,
        input.signerTitle,
        input.businessName,
        fullApp?.quickApp as Record<string, unknown> | null
      );

      return { signatureId: signature.id, success: true };
    }),
});
