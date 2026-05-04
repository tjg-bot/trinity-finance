/**
 * Agentic 10-question intake using claude-haiku-4-5-20251001.
 * Determines qualified loan types, gap analysis, urgency.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicClient } from "./client";

export interface IntakeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GapAnalysis {
  qualifiedFor: string[];
  gapAnalysis: {
    loanType: string;
    missingCriteria: string[];
    howToQualify: string;
  }[];
  recommendedNext: string;
  prefillFields: Record<string, string>;
  questionCount: number;
}

const INTAKE_SYSTEM_PROMPT = `You are Trinity Finance's intake specialist. Your goal is to ask AT MOST 10 short, intelligent questions to determine:
1. Which loan types this business likely qualifies for
2. Which they do not yet qualify for and exactly what they would need to change to qualify
3. Urgency

Rules:
- Ask ONE question at a time.
- Do NOT request SSN, DOB, driver's license number, or any sensitive PII.
- Keep questions conversational and brief.
- After gathering enough signal (at most 10 questions), output a JSON block tagged with <GAP_ANALYSIS> exactly like this:

<GAP_ANALYSIS>
{
  "qualifiedFor": ["SBA", "Line of Credit"],
  "gapAnalysis": [
    {
      "loanType": "Equipment Financing",
      "missingCriteria": ["Less than 12 months in business"],
      "howToQualify": "After 12+ months of operations with documented revenue, you would qualify."
    }
  ],
  "recommendedNext": "SBA",
  "prefillFields": {
    "timeInBusiness": "2-5 Years",
    "annualRevenue": "500K-750K",
    "ficoScore": "680-719"
  },
  "questionCount": 7
}
</GAP_ANALYSIS>

Start by greeting the applicant and asking your first question.`;

export async function runAgenticIntake(
  conversationHistory: IntakeMessage[],
  newUserMessage?: string
): Promise<{ response: string; gapAnalysis?: GapAnalysis; complete: boolean }> {
  const client = createAnthropicClient();

  const messages: Anthropic.MessageParam[] = conversationHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (newUserMessage) {
    messages.push({ role: "user", content: newUserMessage });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages,
    system: INTAKE_SYSTEM_PROMPT,
  });

  const content = response.content[0];
  if (content?.type !== "text") {
    throw new Error("Unexpected response type from Claude intake");
  }

  const text = content.text;

  // Check if gap analysis is complete
  const gapAnalysisMatch = text.match(/<GAP_ANALYSIS>([\s\S]*?)<\/GAP_ANALYSIS>/);
  if (gapAnalysisMatch?.[1]) {
    const gapAnalysis = JSON.parse(gapAnalysisMatch[1]) as GapAnalysis;
    const displayText = text.replace(/<GAP_ANALYSIS>[\s\S]*?<\/GAP_ANALYSIS>/, "").trim();
    return {
      response: displayText || "Great, I have enough information to analyze your options.",
      gapAnalysis,
      complete: true,
    };
  }

  return { response: text, complete: false };
}
