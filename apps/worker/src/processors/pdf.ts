/**
 * PDF generation processor - generates lender-specific PDF package after offer selection.
 */
import type { Job } from "bullmq";
import { prisma } from "@trinity/db";
import { generateLenderPdf } from "@trinity/pdf";
import { LENDER_MAPPINGS } from "@trinity/pdf";
import { decrypt } from "@trinity/db/src/encryption";
import { PutObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auditLog } from "@trinity/db/src/audit";

interface PdfJobData {
  applicationId: string;
  offerId: string;
}

export async function pdfProcessor(job: Job<PdfJobData>): Promise<void> {
  const { applicationId, offerId } = job.data;

  await job.updateProgress(10);

  const app = await prisma.application.findUnique({
    where: { id: applicationId, deletedAt: null },
    include: {
      quickApp: true,
      equipmentApp: true,
      factoringApp: true,
      invoiceFinApp: true,
      locApp: true,
      mcaApp: true,
      sbaApp: true,
      owners: { where: { deletedAt: null } },
      signatures: { orderBy: { signedAt: "desc" }, take: 1 },
      documents: { where: { stoplightStatus: "GREEN", deletedAt: null } },
    },
  });

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { match: { include: { organization: true } } },
  });

  if (!app || !offer) return;

  const s3 = new S3Client({
    region: process.env["AWS_REGION"] ?? "us-east-1",
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
    },
  });

  // Fetch signature PNG from S3
  let signaturePngBytes: Uint8Array | undefined;
  const sig = app.signatures[0];
  if (sig) {
    const decryptedKey = decrypt(sig.signaturePngS3Key);
    const sigResponse = await s3.send(
      new GetObjectCommand({
        Bucket: process.env["AWS_S3_BUCKET"] ?? "",
        Key: decryptedKey,
      })
    );
    if (sigResponse.Body) {
      const chunks: Uint8Array[] = [];
      const reader = sigResponse.Body as NodeJS.ReadableStream;
      for await (const chunk of reader) {
        chunks.push(chunk as Uint8Array);
      }
      signaturePngBytes = Buffer.concat(chunks);
    }
  }

  await job.updateProgress(30);

  // Fetch supporting GREEN docs
  const supportingDocBuffers: Array<{ name: string; buffer: Uint8Array }> = [];
  for (const doc of app.documents.slice(0, 10)) { // Cap at 10 docs
    const response = await s3.send(
      new GetObjectCommand({ Bucket: doc.s3Bucket, Key: doc.s3Key })
    );
    if (response.Body) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as NodeJS.ReadableStream) {
        chunks.push(chunk as Uint8Array);
      }
      supportingDocBuffers.push({
        name: doc.originalFilename,
        buffer: Buffer.concat(chunks),
      });
    }
  }

  await job.updateProgress(60);

  // Determine which lender template to use
  const lenderId = offer.match.organizationId;
  const lenderExists = lenderId in LENDER_MAPPINGS;
  const effectiveLenderId = lenderExists ? lenderId : "bank-first-national"; // fallback

  const applicationData = {
    quickApp: app.quickApp ?? {},
    loanApp: (app.equipmentApp ?? app.factoringApp ?? app.invoiceFinApp ??
              app.locApp ?? app.mcaApp ?? app.sbaApp ?? {}) as Record<string, unknown>,
    owners: app.owners,
    offer: {
      rate: offer.rate,
      termMonths: offer.termMonths,
      amount: offer.amount,
      fees: offer.fees,
    },
  };

  const result = await generateLenderPdf({
    lenderId: effectiveLenderId,
    applicationData,
    signaturePngBytes,
    supportingDocBuffers,
    applicationId,
  });

  // Upload combined PDF to S3
  const pdfKey = `lender-submissions/${applicationId}/${lenderId}/submission-${Date.now()}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env["AWS_S3_BUCKET"] ?? "",
      Key: pdfKey,
      Body: result.pdfBytes,
      ContentType: "application/pdf",
      ServerSideEncryption: "aws:kms",
    })
  );

  await job.updateProgress(90);

  // Update Funding record with the PDF reference
  await prisma.funding.upsert({
    where: { offerId },
    create: {
      applicationId,
      offerId,
      amount: offer.amount,
      fundedDate: new Date(),
      originatorCommission: offer.amount * 0.015, // 1.5%
      underwritingFee: offer.fees,
      servicingSpread: offer.amount * 0.005, // 0.5% annual
      lenderSubmissionPdfS3Key: pdfKey,
    },
    update: {
      lenderSubmissionPdfS3Key: pdfKey,
    },
  });

  await auditLog({
    action: "LENDER_PDF_SUBMITTED",
    entity: "Application",
    entityId: applicationId,
    applicationId,
    after: { lenderId, fieldsMapped: result.fieldsMapped, pdfKey },
  });

  await job.updateProgress(100);
}
