/**
 * Seed data: 3 sample bank rules, 5 sample applications, 1 marketplace listing.
 */
import { prisma } from "./index";
import type { LoanType, ApplicationStatus } from "@prisma/client";

async function main() {
  console.warn("Seeding Trinity Finance database...");

  // Create internal org
  const internalOrg = await prisma.organization.upsert({
    where: { id: "trinity-internal" },
    update: {},
    create: {
      id: "trinity-internal",
      name: "Trinity Finance",
      type: "INTERNAL",
    },
  });

  // Create 3 sample bank organizations
  const bankOrgs = await Promise.all([
    prisma.organization.upsert({
      where: { id: "bank-first-national" },
      update: {},
      create: { id: "bank-first-national", name: "First National Lending", type: "BANK" },
    }),
    prisma.organization.upsert({
      where: { id: "bank-meridian" },
      update: {},
      create: { id: "bank-meridian", name: "Meridian Business Finance", type: "BANK" },
    }),
    prisma.organization.upsert({
      where: { id: "bank-coastal" },
      update: {},
      create: { id: "bank-coastal", name: "Coastal Capital Group", type: "BANK" },
    }),
  ]);

  // Create 3 sample bank rules
  await Promise.all([
    prisma.bankRule.upsert({
      where: { id: "rule-fnl-sba" },
      update: {},
      create: {
        id: "rule-fnl-sba",
        organizationId: bankOrgs[0]!.id,
        name: "First National - SBA Primary",
        criteria: {
          loanTypes: ["SBA", "LINE_OF_CREDIT"],
          ficoMin: 640,
          ficoMax: 850,
          timeInBusinessMonthsMin: 24,
          dealSizeMin: 150000,
          dealSizeMax: 5000000,
          dscrMin: 1.25,
          industries: ["*"],
          states: ["*"],
        },
        offerTemplates: [
          { ficoMin: 720, rate: 7.5, termMonths: 120 },
          { ficoMin: 680, ficoMax: 719, rate: 8.75, termMonths: 84 },
          { ficoMin: 640, ficoMax: 679, rate: 10.5, termMonths: 60 },
        ],
        isActive: true,
      },
    }),
    prisma.bankRule.upsert({
      where: { id: "rule-meridian-equipment" },
      update: {},
      create: {
        id: "rule-meridian-equipment",
        organizationId: bankOrgs[1]!.id,
        name: "Meridian - Equipment Finance",
        criteria: {
          loanTypes: ["EQUIPMENT_FINANCING"],
          ficoMin: 620,
          ficoMax: 850,
          timeInBusinessMonthsMin: 12,
          dealSizeMin: 25000,
          dealSizeMax: 2000000,
          dscrMin: 1.1,
          industries: [
            "Construction & Contractors",
            "Manufacturing",
            "Transportation",
            "Health Services",
          ],
          states: ["*"],
        },
        offerTemplates: [
          { ficoMin: 720, rate: 6.9, termMonths: 72 },
          { ficoMin: 680, ficoMax: 719, rate: 8.25, termMonths: 60 },
          { ficoMin: 620, ficoMax: 679, rate: 11.0, termMonths: 48 },
        ],
        isActive: true,
      },
    }),
    prisma.bankRule.upsert({
      where: { id: "rule-coastal-loc" },
      update: {},
      create: {
        id: "rule-coastal-loc",
        organizationId: bankOrgs[2]!.id,
        name: "Coastal - Line of Credit",
        criteria: {
          loanTypes: ["LINE_OF_CREDIT", "MCA", "INVOICE_FACTORING", "INVOICE_FINANCING"],
          ficoMin: 600,
          ficoMax: 850,
          timeInBusinessMonthsMin: 6,
          dealSizeMin: 10000,
          dealSizeMax: 500000,
          dscrMin: 1.0,
          industries: ["*"],
          states: ["OH", "KY", "WV", "IN", "PA", "VA", "TN"],
        },
        offerTemplates: [
          { ficoMin: 680, rate: 9.99, termMonths: 24 },
          { ficoMin: 640, ficoMax: 679, rate: 14.99, termMonths: 18 },
          { ficoMin: 600, ficoMax: 639, rate: 19.99, termMonths: 12 },
        ],
        isActive: true,
      },
    }),
  ]);

  // Create referral org + agent user
  const referralOrg = await prisma.organization.upsert({
    where: { id: "ref-portsmouth-partners" },
    update: {},
    create: {
      id: "ref-portsmouth-partners",
      name: "Portsmouth Business Partners",
      type: "REFERRAL",
    },
  });

  // Create 5 sample applications
  const loanTypes: LoanType[] = [
    "EQUIPMENT_FINANCING",
    "SBA",
    "LINE_OF_CREDIT",
    "MCA",
    "INVOICE_FACTORING",
  ];

  const statuses: ApplicationStatus[] = [
    "DOCS_PENDING",
    "UNDERWRITING",
    "MATCHED",
    "FUNDED",
    "IN_REVIEW",
  ];

  const sampleApps = [
    {
      id: "app-001",
      loanType: loanTypes[0]!,
      status: statuses[0]!,
      businessName: "Ohio Heavy Equipment LLC",
      amount: "450000",
    },
    {
      id: "app-002",
      loanType: loanTypes[1]!,
      status: statuses[1]!,
      businessName: "Scioto Valley Brewing Co",
      amount: "750000",
    },
    {
      id: "app-003",
      loanType: loanTypes[2]!,
      status: statuses[2]!,
      businessName: "Southern Ohio Medical Supply",
      amount: "200000",
    },
    {
      id: "app-004",
      loanType: loanTypes[3]!,
      status: statuses[3]!,
      businessName: "Portsmouth Restaurant Group",
      amount: "85000",
    },
    {
      id: "app-005",
      loanType: loanTypes[4]!,
      status: statuses[4]!,
      businessName: "Tri-State Freight Solutions",
      amount: "325000",
    },
  ];

  for (const app of sampleApps) {
    await prisma.application.upsert({
      where: { id: app.id },
      update: {},
      create: {
        id: app.id,
        loanType: app.loanType,
        status: app.status,
        quickApp: {
          create: {
            firstName: "Sample",
            lastName: "Applicant",
            businessEmail: `contact@${app.id}.example.com`,
            cellPhone: "+17405550100",
            legalBusinessName: app.businessName,
            entityType: "LLC",
            industry: "Manufacturing",
            natureOfBusiness: "Sample business for demonstration purposes.",
            timeInBusiness: "2-5 Years",
            numW2Employees: "12",
            num1099Employees: "3",
            annualRevenue: "1M-2M",
            netIncomeEbitda: "125000",
            ficoScore: "680-719",
            bankAccountType: "Business Account",
            useOfFunds: "Working Capital",
            urgency: "This Month",
            backgroundInfo: "Sample application for seed data.",
            homeOwnership: "I Have a Mortgage",
            desiredFundingAmount: app.amount,
            hasDebt: false,
            knowsLoanType: "I have a specific loan in mind",
            loanTypeSelection: app.loanType,
          },
        },
      },
    });
  }

  // Create 1 marketplace listing
  await prisma.marketplaceListing.upsert({
    where: { id: "listing-001" },
    update: {},
    create: {
      id: "listing-001",
      bankId: bankOrgs[0]!.id,
      loanIds: ["app-004"],
      price: 87500,
      status: "ACTIVE",
      performanceGrade: "A",
      projectedYield: 8.75,
      tags: ["MCA", "Restaurant", "Ohio"],
    },
  });

  console.warn("Seed complete.");
  console.warn(`  Internal org: ${internalOrg.name}`);
  console.warn(`  Bank orgs: ${bankOrgs.map((b) => b.name).join(", ")}`);
  console.warn(`  Referral org: ${referralOrg.name}`);
  console.warn(`  Applications: ${sampleApps.length}`);
  console.warn("  Marketplace listings: 1");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
