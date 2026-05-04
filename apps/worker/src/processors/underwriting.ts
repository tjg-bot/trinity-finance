/**
 * AI Underwriting processor.
 * Aggregates all application data + doc extractions, runs Claude Opus underwriting,
 * generates Credit Memo PDF, runs bank matching algorithm.
 */
import type { Job } from "bullmq";
import { prisma } from "@trinity/db";
import { runUnderwriting } from "@trinity/ai";
import { generateCreditMemoPdf } from "@trinity/pdf";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { auditLog, AuditActions } from "@trinity/db/src/audit";

interface UnderwritingJobData {
  applicationId: string;
}

export async function underwritingProcessor(job: Job<UnderwritingJobData>): Promise<void> {
  const { applicationId } = job.data;

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
      unsureApp: true,
      debtReliefApp: true,
      owners: { where: { deletedAt: null } },
      documents: { where: { stoplightStatus: "GREEN", deletedAt: null } },
    },
  });

  if (!app || !app.quickApp) return;

  const loanSpecificApp = getLoanSpecificApp(app);

  // Build extracted doc data summary (in production, would pull Textract results)
  const extractedDocData = {
    verifiedDocTypes: app.documents.map((d) => d.docType),
    documentCount: app.documents.length,
    // In production: pull aiAnalysis JSON from each GREEN doc and aggregate
    financialSummary: {
      declaredRevenue: app.quickApp.annualRevenue,
      declaredFico: app.quickApp.ficoScore,
    },
  };

  await job.updateProgress(30);

  // Run AI underwriting
  const underwritingResult = await runUnderwriting({
    applicationId,
    loanType: app.loanType,
    quickApp: app.quickApp as unknown as Record<string, unknown>,
    loanSpecificApp: loanSpecificApp as Record<string, unknown>,
    owners: app.owners as unknown as Record<string, unknown>[],
    extractedDocData,
  });

  await job.updateProgress(60);

  // Generate Credit Memo PDF
  const creditMemoPdfBytes = await generateCreditMemoPdf(applicationId, {
    businessSummary: underwritingResult.creditMemo.businessSummary,
    dscr: underwritingResult.dscr,
    debtToIncome: underwritingResult.debtToIncome,
    cashFlowStabilityScore: underwritingResult.cashFlowStabilityScore,
    strengths: underwritingResult.creditMemo.strengths,
    risks: underwritingResult.creditMemo.risks,
    recommendedStructure: underwritingResult.creditMemo.recommendedStructure,
    overallRating: underwritingResult.creditMemo.overallRating,
  });

  // Upload credit memo to S3
  const s3 = new S3Client({
    region: process.env["AWS_REGION"] ?? "us-east-1",
    credentials: {
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
    },
  });

  const creditMemoKey = `credit-memos/${applicationId}/credit-memo-${Date.now()}.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env["AWS_S3_BUCKET"] ?? "",
      Key: creditMemoKey,
      Body: creditMemoPdfBytes,
      ContentType: "application/pdf",
      ServerSideEncryption: "aws:kms",
    })
  );

  await job.updateProgress(75);

  // Save credit memo and score to application
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      creditMemo: underwritingResult.creditMemo as unknown as Record<string, unknown>,
      underwritingScore: underwritingResult.cashFlowStabilityScore,
    },
  });

  // Run bank matching algorithm
  await runBankMatching(applicationId, app.quickApp, underwritingResult);

  await job.updateProgress(95);

  // Update status to MATCHED
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "MATCHED" },
  });

  await auditLog({
    action: AuditActions.MATCH_CREATED,
    entity: "Application",
    entityId: applicationId,
    applicationId,
    after: {
      underwritingScore: underwritingResult.cashFlowStabilityScore,
      overallRating: underwritingResult.creditMemo.overallRating,
    },
  });

  await job.updateProgress(100);
}

async function runBankMatching(
  applicationId: string,
  quickApp: {
    ficoScore: string;
    annualRevenue: string;
    desiredFundingAmount: string;
    timeInBusiness: string;
    industry: string;
  },
  underwritingResult: { dscr: number; cashFlowStabilityScore: number; creditMemo: { overallRating: string } }
): Promise<void> {
  const activeRules = await prisma.bankRule.findMany({
    where: { isActive: true, deletedAt: null },
    include: { organization: true },
  });

  const ficoNumeric = parseFico(quickApp.ficoScore);
  const fundingAmount = parseFloat(quickApp.desiredFundingAmount.replace(/[^0-9.]/g, "")) || 0;
  const timeInBusinessMonths = parseTimeInBusiness(quickApp.timeInBusiness);

  const matches: Array<{
    applicationId: string;
    organizationId: string;
    bankRuleId: string;
    score: number;
    projectedTerms: object;
    status: "PROPOSED";
  }> = [];

  for (const rule of activeRules) {
    const criteria = rule.criteria as {
      ficoMin?: number;
      ficoMax?: number;
      timeInBusinessMonthsMin?: number;
      dealSizeMin?: number;
      dealSizeMax?: number;
      dscrMin?: number;
      industries?: string[];
      states?: string[];
    };

    // Hard filters
    if (criteria.ficoMin && ficoNumeric < criteria.ficoMin) continue;
    if (criteria.ficoMax && ficoNumeric > criteria.ficoMax) continue;
    if (criteria.timeInBusinessMonthsMin && timeInBusinessMonths < criteria.timeInBusinessMonthsMin) continue;
    if (criteria.dealSizeMin && fundingAmount < criteria.dealSizeMin) continue;
    if (criteria.dealSizeMax && fundingAmount > criteria.dealSizeMax) continue;
    if (criteria.dscrMin && underwritingResult.dscr < criteria.dscrMin) continue;
    if (criteria.industries && !criteria.industries.includes("*") && !criteria.industries.includes(quickApp.industry)) continue;

    // Soft score (0-100)
    let score = 50;
    if (ficoNumeric >= 720) score += 20;
    else if (ficoNumeric >= 680) score += 10;

    if (underwritingResult.dscr >= 1.5) score += 15;
    else if (underwritingResult.dscr >= 1.25) score += 8;

    if (underwritingResult.cashFlowStabilityScore >= 80) score += 15;
    else if (underwritingResult.cashFlowStabilityScore >= 60) score += 8;

    score = Math.min(100, score);

    // Compute projected offer from templates
    const templates = rule.offerTemplates as Array<{
      ficoMin: number;
      ficoMax?: number;
      rate: number;
      termMonths: number;
    }>;

    const matchingTemplate = templates.find(
      (t) =>
        ficoNumeric >= t.ficoMin &&
        (t.ficoMax === undefined || ficoNumeric <= t.ficoMax)
    );

    if (!matchingTemplate) continue;

    const monthlyRate = matchingTemplate.rate / 100 / 12;
    const n = matchingTemplate.termMonths;
    const monthlyPayment =
      fundingAmount * (monthlyRate * Math.pow(1 + monthlyRate, n)) /
      (Math.pow(1 + monthlyRate, n) - 1);

    matches.push({
      applicationId,
      organizationId: rule.organizationId,
      bankRuleId: rule.id,
      score,
      projectedTerms: {
        rate: matchingTemplate.rate,
        termMonths: n,
        monthlyPayment: Math.round(monthlyPayment),
        totalCost: Math.round(monthlyPayment * n),
        timeToClose: "5-10 business days",
      },
      status: "PROPOSED",
    });
  }

  // Sort by score, take top 5
  const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 5);

  if (topMatches.length > 0) {
    await prisma.match.createMany({ data: topMatches });

    // Create Offer records for each match
    for (const match of topMatches) {
      const created = await prisma.match.findFirst({
        where: {
          applicationId,
          bankRuleId: match.bankRuleId,
          organizationId: match.organizationId,
        },
        orderBy: { createdAt: "desc" },
      });

      if (created) {
        const terms = match.projectedTerms as {
          rate: number; termMonths: number; monthlyPayment: number; totalCost: number;
        };
        await prisma.offer.create({
          data: {
            applicationId,
            matchId: created.id,
            rate: terms.rate,
            termMonths: terms.termMonths,
            amount: fundingAmount,
            fees: fundingAmount * 0.02, // 2% origination fee
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });
      }
    }
  }
}

function getLoanSpecificApp(app: {
  loanType: string;
  equipmentApp: unknown;
  factoringApp: unknown;
  invoiceFinApp: unknown;
  locApp: unknown;
  mcaApp: unknown;
  sbaApp: unknown;
  unsureApp: unknown;
  debtReliefApp: unknown;
}): unknown {
  switch (app.loanType) {
    case "EQUIPMENT_FINANCING": return app.equipmentApp;
    case "INVOICE_FACTORING": return app.factoringApp;
    case "INVOICE_FINANCING": return app.invoiceFinApp;
    case "LINE_OF_CREDIT": return app.locApp;
    case "MCA": return app.mcaApp;
    case "SBA": return app.sbaApp;
    case "UNSURE": return app.unsureApp;
    case "DEBT_RELIEF": return app.debtReliefApp;
    default: return {};
  }
}

function parseFico(ficoStr: string): number {
  if (ficoStr.includes("720")) return 740;
  if (ficoStr.includes("680")) return 695;
  if (ficoStr.includes("640")) return 655;
  if (ficoStr.includes("600")) return 615;
  if (ficoStr.includes("599")) return 580;
  return 600;
}

function parseTimeInBusiness(timeStr: string): number {
  if (timeStr.includes("0-6")) return 3;
  if (timeStr.includes("6-12")) return 9;
  if (timeStr.includes("1-2")) return 18;
  if (timeStr.includes("2-5")) return 36;
  if (timeStr.includes("5-10")) return 84;
  if (timeStr.includes("10+")) return 120;
  return 6;
}
