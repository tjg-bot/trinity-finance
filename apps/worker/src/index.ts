/**
 * Trinity Finance BullMQ Worker
 * Processes: document stoplight, PDF generation, follow-up cadences, Plaid sync, underwriting.
 */
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { stoplightProcessor } from "./processors/stoplight";
import { pdfProcessor } from "./processors/pdf";
import { followUpProcessor } from "./processors/followup";
import { underwritingProcessor } from "./processors/underwriting";
import { plaidSyncProcessor } from "./processors/plaid-sync";
import { capitalEnhancementProcessor } from "./processors/capital-enhancement";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const WORKER_OPTIONS = {
  connection,
  concurrency: 5,
};

// ─── Workers ──────────────────────────────────────────────────

const stoplightWorker = new Worker("stoplight", stoplightProcessor, {
  ...WORKER_OPTIONS,
  concurrency: 10, // Can run many doc checks in parallel
});

const pdfWorker = new Worker("pdf-generation", pdfProcessor, WORKER_OPTIONS);

const followUpWorker = new Worker("follow-up", followUpProcessor, {
  ...WORKER_OPTIONS,
  concurrency: 20,
});

const underwritingWorker = new Worker("underwriting", underwritingProcessor, {
  ...WORKER_OPTIONS,
  concurrency: 3, // Claude Opus - rate limited
});

const plaidSyncWorker = new Worker("plaid-sync", plaidSyncProcessor, WORKER_OPTIONS);

const capitalEnhWorker = new Worker("capital-enhancement", capitalEnhancementProcessor, WORKER_OPTIONS);

// ─── Error handlers ────────────────────────────────────────────

const workers = [
  stoplightWorker, pdfWorker, followUpWorker,
  underwritingWorker, plaidSyncWorker, capitalEnhWorker,
];

for (const worker of workers) {
  worker.on("completed", (job) => {
    console.warn(`[${worker.name}] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[${worker.name}] Job ${job?.id} failed:`, err);
  });
}

// ─── Graceful shutdown ──────────────────────────────────────────

async function shutdown() {
  console.warn("Shutting down workers...");
  await Promise.all(workers.map((w) => w.close()));
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

console.warn("Trinity Finance Worker started. Listening for jobs...");
console.warn("Queues:", workers.map((w) => w.name).join(", "));
