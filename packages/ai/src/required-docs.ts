/**
 * Required document matrix per loan type.
 * Used by the document vault to determine what to request.
 */
import type { DocType } from "@prisma/client";

export type LoanTypeKey =
  | "EQUIPMENT_FINANCING"
  | "INVOICE_FACTORING"
  | "INVOICE_FINANCING"
  | "LINE_OF_CREDIT"
  | "MCA"
  | "SBA"
  | "UNSURE"
  | "DEBT_RELIEF";

export const REQUIRED_DOCS: Record<LoanTypeKey, DocType[]> = {
  EQUIPMENT_FINANCING: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 3 most recent months
    "EQUIPMENT_QUOTE",
    "TAX_RETURN_BUSINESS", // last 2 years
  ],
  INVOICE_FACTORING: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 3 months
    "AR_AGING_REPORT",
    "SAMPLE_INVOICE", // 3-5
    "CUSTOMER_LIST",
  ],
  INVOICE_FINANCING: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 3 months
    "AR_AGING_REPORT",
    "SAMPLE_INVOICE", // 3-5
    "CUSTOMER_LIST",
  ],
  LINE_OF_CREDIT: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 6 months
    "TAX_RETURN_BUSINESS", // last 2 years
    "TAX_RETURN_PERSONAL", // last year
  ],
  MCA: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 4 months
    "MCA_CONTRACT", // last MCA contracts (if applicable)
  ],
  SBA: [
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT", // 3 months
    "TAX_RETURN_BUSINESS", // last 3 years
    "TAX_RETURN_PERSONAL", // last 3 years
    "PNL_YTD",
    "BALANCE_SHEET",
    "DEBT_SCHEDULE",
    "BUSINESS_PLAN", // if startup
    "FRANCHISE_AGREEMENT", // if franchisee
    "REAL_ESTATE_APPRAISAL", // if real estate purchase
  ],
  UNSURE: [
    // AI recommendation runs first; swaps to the recommended type's doc list
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
    "BANK_STATEMENT",
  ],
  DEBT_RELIEF: [
    "DEBT_SCHEDULE",
    "BANK_STATEMENT", // 6 months
    "MCA_CONTRACT",
    "GOVERNMENT_ID",
    "VOIDED_CHECK",
  ],
};

export const BANK_STATEMENT_MONTHS: Record<LoanTypeKey, number> = {
  EQUIPMENT_FINANCING: 3,
  INVOICE_FACTORING: 3,
  INVOICE_FINANCING: 3,
  LINE_OF_CREDIT: 6,
  MCA: 4,
  SBA: 3,
  UNSURE: 3,
  DEBT_RELIEF: 6,
};

export function getRequiredDocs(loanType: LoanTypeKey): DocType[] {
  return REQUIRED_DOCS[loanType] ?? REQUIRED_DOCS.UNSURE;
}

export function getBankStatementMonths(loanType: LoanTypeKey): number {
  return BANK_STATEMENT_MONTHS[loanType] ?? 3;
}

export const DOC_DISPLAY_NAMES: Record<DocType, string> = {
  GOVERNMENT_ID: "Government-Issued ID (Driver's License or Passport)",
  VOIDED_CHECK: "Voided Business Check",
  BANK_STATEMENT: "Business Bank Statements",
  TAX_RETURN_BUSINESS: "Business Tax Returns",
  TAX_RETURN_PERSONAL: "Personal Tax Returns",
  EQUIPMENT_QUOTE: "Equipment Quote / Invoice from Supplier",
  AR_AGING_REPORT: "Accounts Receivable Aging Report",
  SAMPLE_INVOICE: "Sample Invoices (3-5)",
  CUSTOMER_LIST: "Customer List with Addresses",
  PNL_YTD: "Profit & Loss Statement (Year-to-Date)",
  BALANCE_SHEET: "Balance Sheet (Year-to-Date)",
  DEBT_SCHEDULE: "Debt Schedule",
  BUSINESS_PLAN: "Business Plan",
  FRANCHISE_AGREEMENT: "Franchise Agreement",
  REAL_ESTATE_APPRAISAL: "Real Estate Appraisal",
  MCA_CONTRACT: "MCA Contracts (Most Recent)",
  CREDIT_AUTHORIZATION: "Signed Credit Authorization",
  OTHER: "Additional Document",
};
