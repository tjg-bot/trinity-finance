/**
 * Phase 6 - Capital Enhancement processor.
 * Checks NMTC, Opportunity Zone, SSBCI eligibility.
 * (Scaffold - activate when external API keys configured)
 */
import type { Job } from "bullmq";
import { prisma } from "@trinity/db";

interface CapitalEnhancementJobData {
  applicationId: string;
  businessAddress: string;
  industry: string;
  stateCode: string;
}

export async function capitalEnhancementProcessor(job: Job<CapitalEnhancementJobData>): Promise<void> {
  const { applicationId, businessAddress, industry, stateCode } = job.data;

  // In production: geocode address, check against HUD/CDFI NMTC tracts,
  // IRS OZ tracts, SSBCI state programs

  const eligibility = {
    nmtcEligible: false, // Would check against CDFI Fund census tract data
    ozEligible: false,   // Would check against IRS OZ tract boundaries
    ssbciEligible: checkSsbciByState(stateCode),
    stateGuaranteeEligible: checkStateGuarantee(stateCode, industry),
    madeInAmericaEligible: checkMadeInAmerica(industry),
  };

  await prisma.capitalEnhancement.upsert({
    where: { applicationId },
    create: {
      applicationId,
      ...eligibility,
      eligibilityDetail: {
        businessAddress,
        industry,
        stateCode,
        checkedAt: new Date().toISOString(),
      },
      processedAt: new Date(),
    },
    update: {
      ...eligibility,
      processedAt: new Date(),
    },
  });

  // Tag marketplace listing if applicable
  if (eligibility.nmtcEligible || eligibility.ozEligible) {
    await prisma.marketplaceListing.updateMany({
      where: {
        loanIds: { array_contains: applicationId },
      },
      data: {
        tags: { push: eligibility.nmtcEligible ? "NMTC-Eligible" : "OZ-Eligible" },
      },
    });
  }

  void businessAddress; // suppress unused warning in scaffold
}

function checkSsbciByState(stateCode: string): boolean {
  // States with active SSBCI programs (simplified list)
  const ssbciStates = ["OH", "KY", "IN", "WV", "PA", "VA", "TN", "MI"];
  return ssbciStates.includes(stateCode);
}

function checkStateGuarantee(stateCode: string, _industry: string): boolean {
  const guaranteeStates = ["OH", "KY", "IN"];
  return guaranteeStates.includes(stateCode);
}

function checkMadeInAmerica(industry: string): boolean {
  const manufacturingIndustries = ["Manufacturing", "Construction & Contractors", "Freight"];
  return manufacturingIndustries.includes(industry);
}
