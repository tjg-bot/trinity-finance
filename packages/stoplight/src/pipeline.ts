/**
 * Stoplight pipeline: Textract -> Claude doc analysis -> stoplight status.
 * Runs as a BullMQ job in apps/worker.
 * Outputs GREEN / YELLOW / RED with structured aiAnalysis.
 */
import { runTextract } from "./textract";
import { runDocumentAnalysis } from "@trinity/ai";
import type { DocAnalysisOutput } from "@trinity/ai";

export interface StoplightInput {
  documentId: string;
  s3Bucket: string;
  s3Key: string;
  docType: string;
  applicationContext: {
    legalBusinessName: string;
    ownerName: string;
    declaredRevenue: string;
    desiredAmount: string;
  };
  imageBase64?: string; // Fallback for Claude vision
}

export interface StoplightResult {
  documentId: string;
  status: "GREEN" | "YELLOW" | "RED";
  aiAnalysis: DocAnalysisOutput;
  clarificationNote?: string;
  textractJobId: string;
}

export async function runStoplightPipeline(
  input: StoplightInput
): Promise<StoplightResult> {
  // Step 1: OCR via AWS Textract
  const textractResult = await runTextract(input.s3Bucket, input.s3Key).catch(
    async (err: unknown) => {
      // Fallback: if Textract fails, proceed with Claude vision only
      console.warn(`Textract failed for doc ${input.documentId}:`, err);
      return {
        rawText: "",
        formFields: [],
        tables: [],
        jobId: "textract-failed",
      };
    }
  );

  // Step 2: Claude doc analysis (with vision fallback)
  const analysis = await runDocumentAnalysis({
    docType: input.docType,
    extractedText: textractResult.rawText,
    extractedTables: textractResult.tables.flatMap((t) =>
      t.map((row) => ({ row }))
    ),
    applicationContext: input.applicationContext,
    imageBase64: input.imageBase64,
  });

  // Step 3: Determine final status
  const status = analysis.stoplightRecommendation;
  const clarificationNote =
    status === "YELLOW" ? analysis.clarificationPrompt : undefined;

  return {
    documentId: input.documentId,
    status,
    aiAnalysis: analysis,
    clarificationNote,
    textractJobId: textractResult.jobId,
  };
}
