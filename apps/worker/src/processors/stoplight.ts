/**
 * Stoplight processor - runs the full OCR -> Claude analysis -> status pipeline.
 * After processing: updates DB, fires follow-up if RED/YELLOW, checks if all docs GREEN.
 */
import type { Job } from "bullmq";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { prisma } from "@trinity/db";
import { runStoplightPipeline } from "@trinity/stoplight";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

interface StoplightJobData {
  documentId: string;
  s3Bucket: string;
  s3Key: string;
  docType: string;
  applicationId: string;
  legalBusinessName: string;
  ownerName: string;
  declaredRevenue: string;
  desiredAmount: string;
}

const connection = new IORedis(process.env["REDIS_URL"] ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export async function stoplightProcessor(job: Job<StoplightJobData>): Promise<void> {
  const data = job.data;

  await job.updateProgress(10);

  // Run the full stoplight pipeline
  const result = await runStoplightPipeline({
    documentId: data.documentId,
    s3Bucket: data.s3Bucket,
    s3Key: data.s3Key,
    docType: data.docType,
    applicationContext: {
      legalBusinessName: data.legalBusinessName,
      ownerName: data.ownerName,
      declaredRevenue: data.declaredRevenue,
      desiredAmount: data.desiredAmount,
    },
  });

  await job.updateProgress(80);

  // Update document record
  await prisma.document.update({
    where: { id: data.documentId },
    data: {
      stoplightStatus: result.status,
      aiAnalysis: result.aiAnalysis as unknown as Record<string, unknown>,
      clarificationNote: result.clarificationNote,
      textractJobId: result.textractJobId,
      virusScanPassed: true, // ClamAV scan would run before Textract in production
    },
  });

  await auditLog({
    action: AuditActions.DOC_STOPLIGHT_CHANGE,
    entity: "Document",
    entityId: data.documentId,
    applicationId: data.applicationId,
    after: { status: result.status, docType: data.docType },
  });

  // Fire follow-up if RED or YELLOW
  if (result.status === "RED" || result.status === "YELLOW") {
    const followUpQueue = new Queue("follow-up", { connection });
    await followUpQueue.add(
      "immediate-follow-up",
      {
        documentId: data.documentId,
        applicationId: data.applicationId,
        status: result.status,
        clarificationNote: result.clarificationNote,
        delay: 0, // T+0 immediate
      },
      { removeOnComplete: 50, attempts: 3 }
    );
  }

  await job.updateProgress(90);

  // Check if all required docs are now GREEN -> trigger underwriting
  await checkAndTriggerUnderwriting(data.applicationId);

  await job.updateProgress(100);
}

async function checkAndTriggerUnderwriting(applicationId: string): Promise<void> {
  const app = await prisma.application.findUnique({
    where: { id: applicationId, deletedAt: null },
    include: {
      documents: { where: { deletedAt: null } },
      documentRequests: { where: { deletedAt: null } },
    },
  });

  if (!app || app.status !== "DOCS_PENDING") return;

  const pendingOrRed = app.documents.some(
    (d) => d.stoplightStatus === "PENDING" || d.stoplightStatus === "RED"
  );

  if (!pendingOrRed) {
    // All docs are GREEN or YELLOW (accepted) - trigger underwriting
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "UNDERWRITING" },
    });

    const underwritingQueue = new Queue("underwriting", { connection });
    await underwritingQueue.add(
      "run-underwriting",
      { applicationId },
      { removeOnComplete: 50, attempts: 2 }
    );
  }
}
