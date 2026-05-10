/**
 * Anthropic Claude API wrappers for Trinity Finance.
 * - claude-opus-4-6: underwriting, document analysis (complex reasoning)
 * - claude-haiku-4-5-20251001: 10-question agentic intake (fast, cheap)
 */
import Anthropic from "@anthropic-ai/sdk";

export function createAnthropicClient(): Anthropic {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

// ─────────────────────────────────────────────────────────────
// UNDERWRITING ENGINE
// ─────────────────────────────────────────────────────────────

export interface UnderwritingInput {
  applicationId: string;
  loanType: string;
  quickApp: Record<string, unknown>;
  loanSpecificApp: Record<string, unknown>;
  owners: Record<string, unknown>[];
  extractedDocData: Record<string, unknown>;
}

export interface UnderwritingOutput {
  dscr: number;
  debtToIncome: number;
  cashFlowStabilityScore: number;
  currentRatio?: number;
  quickRatio?: number;
  strengths: string[];
  risks: string[];
  recommendedDealStructure: string;
  creditMemo: {
    businessSummary: string;
    financialHighlights: Record<string, unknown>;
    strengths: string[];
    risks: string[];
    recommendedStructure: string;
    overallRating: "STRONG" | "ACCEPTABLE" | "MARGINAL" | "DECLINE";
  };
}

export async function runUnderwriting(
  input: UnderwritingInput
): Promise<UnderwritingOutput> {
  const client = createAnthropicClient();

  const systemPrompt = `You are Trinity Finance's AI underwriter. Analyze commercial loan applications and produce structured credit memos.
Be objective, precise, and conservative. Flag all risks clearly.
Output ONLY valid JSON matching the UnderwritingOutput schema. Never include markdown fences or extra text.`;

  const userPrompt = `Underwrite this ${input.loanType} application:

APPLICATION DATA:
${JSON.stringify(input.quickApp, null, 2)}

LOAN-SPECIFIC DATA:
${JSON.stringify(input.loanSpecificApp, null, 2)}

OWNERS (${input.owners.length} principals):
${JSON.stringify(input.owners, null, 2)}

EXTRACTED DOCUMENT DATA:
${JSON.stringify(input.extractedDocData, null, 2)}

Compute: DSCR (NOI / total debt service), debt-to-income, cash flow stability (0-100 score),
current ratio, quick ratio. Identify 3-5 strengths and 3-5 risks. Recommend deal structure.
Rate overall as STRONG / ACCEPTABLE / MARGINAL / DECLINE.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content?.type !== "text") {
    throw new Error("Unexpected response type from Claude underwriting");
  }

  return JSON.parse(content.text) as UnderwritingOutput;
}

// ─────────────────────────────────────────────────────────────
// DOCUMENT ANALYSIS
// ─────────────────────────────────────────────────────────────

export interface DocAnalysisInput {
  docType: string;
  extractedText: string;
  extractedTables?: Record<string, unknown>[];
  applicationContext: {
    legalBusinessName: string;
    ownerName: string;
    declaredRevenue: string;
    desiredAmount: string;
  };
  imageBase64?: string; // For vision fallback
}

export interface DocAnalysisOutput {
  docTypeConfirmed: boolean;
  docTypeDetected: string;
  qualityChecks: {
    resolution: "OK" | "LOW";
    pageCount: "OK" | "MISMATCH";
    signaturePresent?: boolean;
    dateCurrent: boolean;
  };
  crossRefChecks: {
    nameMatch: boolean;
    nameFound: string;
    revenueReconciles: boolean;
    accountConsistent: boolean;
  };
  forgeryIndicators: string[];
  largeUnexplainedDeposits: { date: string; amount: number; description: string }[];
  stoplightRecommendation: "GREEN" | "YELLOW" | "RED";
  reason: string;
  clarificationPrompt?: string;
}

export async function runDocumentAnalysis(
  input: DocAnalysisInput
): Promise<DocAnalysisOutput> {
  const client = createAnthropicClient();

  const systemPrompt = `You are Trinity Finance's document verification AI. Analyze uploaded financial documents for authenticity, completeness, and consistency.
Output ONLY valid JSON. Never include markdown fences.`;

  const contentBlocks: Anthropic.ContentBlock[] = [];

  // If we have an image, include it for vision analysis
  if (input.imageBase64) {
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: input.imageBase64,
      },
    } as unknown as Anthropic.ContentBlock);
  }

  const userText = `Analyze this ${input.docType} document.

EXTRACTED TEXT:
${input.extractedText.slice(0, 8000)}

${input.extractedTables ? `EXTRACTED TABLES:\n${JSON.stringify(input.extractedTables, null, 2).slice(0, 2000)}` : ""}

APPLICATION CONTEXT:
- Legal Business Name: ${input.applicationContext.legalBusinessName}
- Owner Name: ${input.applicationContext.ownerName}
- Declared Annual Revenue: ${input.applicationContext.declaredRevenue}
- Desired Funding Amount: ${input.applicationContext.desiredAmount}

Check:
1. Doc type matches expected (${input.docType})
2. Quality (resolution, pages, signatures)
3. Name matches legal business/owner name
4. Revenue figures roughly reconcile with declared revenue
5. Account numbers consistent across pages
6. Forgery indicators (font inconsistencies, altered dates, OCR artifacts suggesting edits)
7. Large unexplained deposits (>10% of monthly revenue without clear source)

Recommend GREEN (all pass), YELLOW (flagged but acceptable - ask for clarification), or RED (reject).`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: input.imageBase64 ? [...contentBlocks, { type: "text", text: userText }] : userText },
  ];

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages,
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content?.type !== "text") {
    throw new Error("Unexpected response type from Claude document analysis");
  }

  return JSON.parse(content.text) as DocAnalysisOutput;
}

// ─────────────────────────────────────────────────────────────
// LOAN RECOMMENDATION (Section 8 - Unsure)
// ─────────────────────────────────────────────────────────────

export interface LoanRecommendationInput {
  applicationData: Record<string, unknown>;
}

export interface LoanRecommendationOutput {
  topRecommendations: {
    loanType: string;
    rank: number;
    fitScore: number;
    reasoning: string;
    keyStrengths: string[];
    potentialConcerns: string[];
  }[];
  primaryRecommendation: string;
  summaryForApplicant: string;
}

export async function runLoanRecommendation(
  input: LoanRecommendationInput
): Promise<LoanRecommendationOutput> {
  const client = createAnthropicClient();

  const systemPrompt = `You are Trinity Finance's loan recommendation AI. Based on business data, recommend the top 3 loan types ranked by fit.
Output ONLY valid JSON. Never include markdown fences.`;

  const userPrompt = `Recommend loan types for this business profile:
${JSON.stringify(input.applicationData, null, 2)}

Available loan types: Equipment Financing, Invoice Factoring, Invoice Financing, Line of Credit, MCA, SBA.
Rank top 3 by fit (1 = best). Include reasoning, strengths, and concerns for each.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const content = response.content[0];
  if (content?.type !== "text") {
    throw new Error("Unexpected response from Claude recommendation");
  }

  return JSON.parse(content.text) as LoanRecommendationOutput;
}

// ─────────────────────────────────────────────────────────────
// AGENTIC INTAKE (10-question, claude-haiku)
// ─────────────────────────────────────────────────────────────

export { runAgenticIntake } from "./intake";
