/**
 * Section 1: Finance Quick Application (always shown, 27 fields)
 */
import type { FieldDef, SectionDef } from "../engine";
import {
  ENTITY_TYPES, INDUSTRIES, TIME_IN_BUSINESS_OPTIONS, ANNUAL_REVENUE_OPTIONS,
  FICO_OPTIONS, BANK_ACCOUNT_TYPES, USE_OF_FUNDS_OPTIONS, URGENCY_OPTIONS,
  HOME_OWNERSHIP_OPTIONS, LOAN_TYPE_OPTIONS,
} from "./constants";

export const section1Fields: FieldDef[] = [
  // ── Applicant Contact ──
  { id: "firstName", label: "First Name", inputType: "text", required: true },
  { id: "lastName", label: "Last Name", inputType: "text", required: true },
  { id: "businessEmail", label: "Business Email", inputType: "email", required: true },
  { id: "cellPhone", label: "Cell Phone", inputType: "tel", required: true },

  // ── Business Profile ──
  { id: "legalBusinessName", label: "Legal Business Name", inputType: "text", required: true },
  {
    id: "entityType",
    label: "Legal Business Entity Type",
    inputType: "select_one",
    required: true,
    options: ENTITY_TYPES,
  },
  {
    id: "entityTypeOther",
    label: "Specify Entity Type",
    inputType: "text",
    required: true,
    showIf: { fieldId: "entityType", equals: "Other" },
  },
  { id: "businessWebsite", label: "Business Website", inputType: "url", required: false },
  {
    id: "industry",
    label: "Industry",
    inputType: "dropdown",
    required: true,
    options: INDUSTRIES,
  },
  {
    id: "industryOther",
    label: "Please Specify Industry",
    inputType: "text",
    required: true,
    showIf: { fieldId: "industry", equals: "Other" },
  },
  {
    id: "natureOfBusiness",
    label: "Explain the Nature of Your Business",
    inputType: "textarea",
    required: true,
    rows: 4,
  },
  {
    id: "timeInBusiness",
    label: "Time in Business",
    inputType: "dropdown",
    required: true,
    options: TIME_IN_BUSINESS_OPTIONS,
  },
  { id: "numW2Employees", label: "Number of W2 Employees", inputType: "number", required: true },
  {
    id: "num1099Employees",
    label: "Number of 1099 Employees (Including Contractors)",
    inputType: "number",
    required: true,
  },

  // ── Financial Overview ──
  {
    id: "annualRevenue",
    label: "Annual Revenue",
    inputType: "dropdown",
    required: true,
    options: ANNUAL_REVENUE_OPTIONS,
  },
  { id: "netIncomeEbitda", label: "Net Income / EBITDA", inputType: "monetary", required: true },
  {
    id: "ficoScore",
    label: "FICO Score",
    inputType: "dropdown",
    required: true,
    options: FICO_OPTIONS,
  },
  {
    id: "bankAccountType",
    label: "Bank Account Type",
    inputType: "dropdown",
    required: true,
    options: BANK_ACCOUNT_TYPES,
  },

  // ── Funding Details ──
  {
    id: "useOfFunds",
    label: "Use of Funds",
    inputType: "dropdown",
    required: true,
    options: USE_OF_FUNDS_OPTIONS,
  },
  {
    id: "urgency",
    label: "Urgency",
    inputType: "dropdown",
    required: true,
    options: URGENCY_OPTIONS,
  },
  {
    id: "backgroundInfo",
    label: "Background Info",
    inputType: "textarea",
    required: true,
    rows: 4,
    helpText: "Tell us more about your business and how you plan to use the funds.",
  },
  {
    id: "homeOwnership",
    label: "Home Ownership Status",
    inputType: "dropdown",
    required: true,
    options: HOME_OWNERSHIP_OPTIONS,
  },
  {
    id: "homeOwnershipOther",
    label: "Please Explain",
    inputType: "text",
    required: true,
    showIf: { fieldId: "homeOwnership", equals: "Other" },
  },
  { id: "desiredFundingAmount", label: "Desired Funding Amount", inputType: "monetary", required: true },

  // ── Current Debt ──
  {
    id: "hasDebt",
    label: "Does the Business Currently Have Debt?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "totalDebtAmount",
    label: "Total Debt Amount",
    inputType: "monetary",
    required: true,
    showIf: { fieldId: "hasDebt", equals: "Yes" },
  },
  {
    id: "totalMonthlyDebtPayment",
    label: "Total Monthly Payment for Your Debt(s)",
    inputType: "monetary",
    required: true,
    showIf: { fieldId: "hasDebt", equals: "Yes" },
  },
  {
    id: "hasHighInterestDebt",
    label: "Is Any of the Debt High Interest, Like MCAs?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
    showIf: { fieldId: "hasDebt", equals: "Yes" },
  },
  {
    id: "mcaDebtAmount",
    label: "How Much of the Debt is MCA or Other High Interest Rate Debt?",
    inputType: "monetary",
    required: true,
    showIf: { fieldId: "hasHighInterestDebt", equals: "Yes" },
  },
  {
    id: "mcaMonthlyPayment",
    label: "Total Monthly Payment for Your High Interest Debt(s)",
    inputType: "monetary",
    required: true,
    showIf: { fieldId: "hasHighInterestDebt", equals: "Yes" },
  },

  // ── Loan Type Selection ──
  {
    id: "knowsLoanType",
    label: "Do you know what type of loan you're looking for?",
    inputType: "dropdown",
    required: true,
    options: [
      "I have a specific loan in mind",
      "I'd like some help figuring out what's best for my situation",
    ],
  },
  {
    id: "loanTypeSelection",
    label: "What Type of Loan Would You Like to Apply For?",
    inputType: "select_one",
    required: true,
    options: LOAN_TYPE_OPTIONS,
    showIf: { fieldId: "knowsLoanType", equals: "I have a specific loan in mind" },
  },
];

export const section1: SectionDef = {
  id: "section1",
  title: "Finance Quick Application",
  description: "Let's start with some basic information about you and your business.",
  fields: section1Fields,
};
