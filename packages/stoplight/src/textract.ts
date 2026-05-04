/**
 * AWS Textract integration for document OCR.
 * Extracts text, form fields, and tables from uploaded documents.
 */
import {
  TextractClient,
  StartDocumentAnalysisCommand,
  GetDocumentAnalysisCommand,
  type Block,
} from "@aws-sdk/client-textract";

function getTextractClient(): TextractClient {
  return new TextractClient({
    region: process.env["AWS_REGION"] ?? "us-east-1",
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
    },
  });
}

export interface TextractResult {
  rawText: string;
  formFields: Array<{ key: string; value: string }>;
  tables: Array<Array<string[]>>;
  jobId: string;
}

/**
 * Start async Textract analysis for a document in S3.
 * Returns the jobId to poll.
 */
export async function startTextractJob(
  s3Bucket: string,
  s3Key: string
): Promise<string> {
  const client = getTextractClient();

  const response = await client.send(
    new StartDocumentAnalysisCommand({
      DocumentLocation: {
        S3Object: { Bucket: s3Bucket, Name: s3Key },
      },
      FeatureTypes: ["FORMS", "TABLES"],
    })
  );

  const jobId = response.JobId;
  if (!jobId) throw new Error("Textract did not return a JobId");
  return jobId;
}

/**
 * Poll Textract for job completion and extract results.
 */
export async function runTextract(
  s3Bucket: string,
  s3Key: string
): Promise<TextractResult> {
  const client = getTextractClient();

  // Start job
  const jobId = await startTextractJob(s3Bucket, s3Key);

  // Poll with exponential backoff (max 2 minutes)
  let attempts = 0;
  const maxAttempts = 24;
  let allBlocks: Block[] = [];

  while (attempts < maxAttempts) {
    await sleep(5000 + attempts * 1000);

    const result = await client.send(
      new GetDocumentAnalysisCommand({ JobId: jobId })
    );

    if (result.JobStatus === "SUCCEEDED") {
      allBlocks = result.Blocks ?? [];

      // Paginate if needed
      let nextToken = result.NextToken;
      while (nextToken) {
        const page = await client.send(
          new GetDocumentAnalysisCommand({ JobId: jobId, NextToken: nextToken })
        );
        allBlocks = [...allBlocks, ...(page.Blocks ?? [])];
        nextToken = page.NextToken;
      }
      break;
    } else if (result.JobStatus === "FAILED") {
      throw new Error(`Textract job failed: ${result.StatusMessage ?? "unknown error"}`);
    }

    attempts++;
  }

  if (allBlocks.length === 0) {
    throw new Error("Textract job timed out or returned no blocks");
  }

  return parseTextractBlocks(allBlocks, jobId);
}

function parseTextractBlocks(blocks: Block[], jobId: string): TextractResult {
  const lineBlocks = blocks.filter((b) => b.BlockType === "LINE");
  const rawText = lineBlocks.map((b) => b.Text ?? "").join("\n");

  // Extract key-value pairs from forms
  const keyBlocks = blocks.filter((b) => b.BlockType === "KEY_VALUE_SET" && b.EntityTypes?.includes("KEY"));
  const valueMap = new Map<string, string>();

  for (const b of blocks) {
    if (b.BlockType === "KEY_VALUE_SET" && b.EntityTypes?.includes("VALUE") && b.Id) {
      const valueText = (b.Relationships ?? [])
        .filter((r) => r.Type === "CHILD")
        .flatMap((r) => r.Ids ?? [])
        .map((id) => blocks.find((blk) => blk.Id === id)?.Text ?? "")
        .join(" ");
      valueMap.set(b.Id, valueText);
    }
  }

  const formFields: Array<{ key: string; value: string }> = [];
  for (const keyBlock of keyBlocks) {
    const keyText = (keyBlock.Relationships ?? [])
      .filter((r) => r.Type === "CHILD")
      .flatMap((r) => r.Ids ?? [])
      .map((id) => blocks.find((b) => b.Id === id)?.Text ?? "")
      .join(" ");

    const valueId = (keyBlock.Relationships ?? [])
      .filter((r) => r.Type === "VALUE")
      .flatMap((r) => r.Ids ?? [])[0];

    formFields.push({
      key: keyText,
      value: valueId ? (valueMap.get(valueId) ?? "") : "",
    });
  }

  // Extract tables
  const tableBlocks = blocks.filter((b) => b.BlockType === "TABLE");
  const tables: Array<Array<string[]>> = tableBlocks.map((table) => {
    const cellBlocks = (table.Relationships ?? [])
      .filter((r) => r.Type === "CHILD")
      .flatMap((r) => r.Ids ?? [])
      .map((id) => blocks.find((b) => b.Id === id))
      .filter((b): b is Block => b?.BlockType === "CELL");

    const rows: Map<number, Map<number, string>> = new Map();
    for (const cell of cellBlocks) {
      const row = cell.RowIndex ?? 0;
      const col = cell.ColumnIndex ?? 0;
      if (!rows.has(row)) rows.set(row, new Map());
      const cellText = (cell.Relationships ?? [])
        .filter((r) => r.Type === "CHILD")
        .flatMap((r) => r.Ids ?? [])
        .map((id) => blocks.find((b) => b.Id === id)?.Text ?? "")
        .join(" ");
      rows.get(row)!.set(col, cellText);
    }

    return Array.from(rows.entries())
      .sort(([a], [b]) => a - b)
      .map(([, cols]) =>
        Array.from(cols.entries())
          .sort(([a], [b]) => a - b)
          .map(([, text]) => text)
      );
  });

  return { rawText, formFields, tables, jobId };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
