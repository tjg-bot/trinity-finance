/**
 * Shared field blocks reused across sections:
 * - Owner/Principal block (10% and 20% thresholds)
 * - Trade References
 * - Bank References
 * - Accountant References
 * - MCA block (conditional on Quick App high-interest debt)
 * - Credit Authorization & Signature
 * - Legal & Compliance (base + expanded)
 */
import type { FieldDef } from "../engine";
import { US_STATES, FICO_OPTIONS } from "./constants";

// ─── Owner Block ───────────────────────────────────────────────

export function makeOwnerFields(
  prefix: string,
  index: number,
  label: string
): FieldDef[] {
  const p = `${prefix}_${index}_`;
  const disp = index === 0 ? label : `Additional Owner ${index} - ${label}`;
  return [
    { id: `${p}fullName`, label: `${disp} Full Name`, inputType: "text", required: true },
    { id: `${p}bestPhone`, label: `${disp} Best Phone`, inputType: "tel", required: true },
    { id: `${p}title`, label: `${disp} Title`, inputType: "text", required: true },
    { id: `${p}homeAddress`, label: `${disp} Home Address`, inputType: "text", required: true },
    {
      id: `${p}dateOfBirth`,
      label: `${disp} Date of Birth`,
      inputType: "text",
      required: true,
      encrypt: true,
      placeholder: "MM/DD/YYYY",
    },
    { id: `${p}bestEmail`, label: `${disp} Best Email`, inputType: "email", required: true },
    {
      id: `${p}personalFico`,
      label: `${disp} Personal FICO Score`,
      inputType: "dropdown",
      required: true,
      options: FICO_OPTIONS,
    },
    {
      id: `${p}ssn`,
      label: `${disp} Social Security Number`,
      inputType: "text",
      required: true,
      encrypt: true,
      placeholder: "XXX-XX-XXXX",
    },
    {
      id: `${p}dlState`,
      label: `${disp} Driver's License State`,
      inputType: "dropdown",
      required: true,
      options: US_STATES,
    },
    {
      id: `${p}dlNumber`,
      label: `${disp} Driver's License Number`,
      inputType: "text",
      required: true,
      encrypt: true,
    },
    {
      id: `${p}ownershipPercent`,
      label: `${disp} Percent of Ownership`,
      inputType: "number",
      required: true,
    },
  ];
}

export function makeAdditionalOwnerCountField(
  id: string,
  max: number
): FieldDef {
  return {
    id,
    label: `How Many Additional Owners at or Above the Threshold?`,
    inputType: "select_one",
    required: true,
    options: Array.from({ length: max }, (_, i) => String(i + 1)),
  };
}

export function makeSoleOwnerField(id: string): FieldDef {
  return {
    id,
    label: "Are You the Only Owner at or Above the Ownership Threshold?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  };
}

// ─── Trade Reference Block ──────────────────────────────────────

export function makeTradeRefFields(index: number, expanded = false): FieldDef[] {
  const p = `tradeRef${index}_`;
  const base: FieldDef[] = [
    { id: `${p}companyName`, label: `Trade Reference ${index} - Company Name`, inputType: "text", required: true },
    { id: `${p}phone`, label: `Trade Reference ${index} - Phone`, inputType: "tel", required: true },
    { id: `${p}address`, label: `Trade Reference ${index} - Address`, inputType: "text", required: true },
    { id: `${p}contactName`, label: `Trade Reference ${index} - Contact Name`, inputType: "text", required: true },
  ];
  if (expanded) {
    base.push(
      { id: `${p}contactEmail`, label: `Trade Reference ${index} - Contact Email`, inputType: "email", required: false },
      { id: `${p}association`, label: `Trade Reference ${index} - Association`, inputType: "text", required: false },
      { id: `${p}relationshipLen`, label: `Trade Reference ${index} - Length of Business Relationship`, inputType: "text", required: false }
    );
  }
  return base;
}

// ─── Bank Reference Block ───────────────────────────────────────

export const bankRefFields: FieldDef[] = [
  { id: "bankRef_bankName", label: "Bank Name", inputType: "text", required: false },
  { id: "bankRef_address", label: "Bank Address", inputType: "text", required: false },
  { id: "bankRef_contactPerson", label: "Contact Person", inputType: "text", required: false },
  { id: "bankRef_phone", label: "Phone", inputType: "tel", required: false },
  {
    id: "bankRef_accountNumbers",
    label: "Account Number(s)",
    inputType: "text",
    required: false,
    encrypt: true,
    helpText: "Separate multiple account numbers with commas.",
  },
];

// ─── Accountant Reference Block ─────────────────────────────────

export const accountantRefFields: FieldDef[] = [
  { id: "acctRef_accountantName", label: "Accountant Name", inputType: "text", required: false },
  { id: "acctRef_address", label: "Address", inputType: "text", required: false },
  { id: "acctRef_email", label: "Email", inputType: "email", required: false },
  { id: "acctRef_telephone", label: "Telephone", inputType: "tel", required: false },
];

// ─── Legal & Compliance Base ─────────────────────────────────────

export const legalBaseFields: FieldDef[] = [
  {
    id: "convictedOfCrime",
    label: "Have you or any owner been convicted of a crime?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "convictedExplain",
    label: "Please Explain the Conviction",
    inputType: "textarea",
    required: true,
    showIf: { fieldId: "convictedOfCrime", equals: "Yes" },
  },
  {
    id: "hasBankruptcy",
    label: "Has anyone on the application filed for bankruptcy?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "bankruptcyHowLongAgo",
    label: "How Long Ago Was the Bankruptcy Filed?",
    inputType: "text",
    required: true,
    showIf: { fieldId: "hasBankruptcy", equals: "Yes" },
  },
  {
    id: "hasPendingClaims",
    label: "Are there any pending claims, judgments, or tax liens against the business or any owner?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
];

// ─── Legal & Compliance Expanded ─────────────────────────────────

export const legalExpandedFields: FieldDef[] = [
  ...legalBaseFields,
  {
    id: "hasUccFilings",
    label: "Are there any UCC filings against you?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "uccFilingsWith",
    label: "With Whom Are the UCC Filings?",
    inputType: "text",
    required: true,
    showIf: { fieldId: "hasUccFilings", equals: "Yes" },
  },
  {
    id: "hasTaxesPastDue",
    label: "Are any Federal or State Taxes Past Due?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "taxesPastDueExplain",
    label: "Please Explain the Past Due Taxes",
    inputType: "textarea",
    required: true,
    showIf: { fieldId: "hasTaxesPastDue", equals: "Yes" },
  },
];

// ─── Citizenship Block ─────────────────────────────────────────

export const citizenshipFields: FieldDef[] = [
  {
    id: "allOwnersCitizens",
    label: "Are all owners (including shareholders) and officers/directors U.S. Citizens, and have the legal right to be in the United States?",
    inputType: "select_one",
    required: true,
    options: ["Yes", "No"],
  },
  {
    id: "citizenshipExplain",
    label: "Please Explain",
    inputType: "textarea",
    required: true,
    showIf: { fieldId: "allOwnersCitizens", equals: "No" },
  },
];

// ─── Daily Contact Block ───────────────────────────────────────

export const dailyContactFields: FieldDef[] = [
  { id: "dailyContactName", label: "Daily Contact Full Name", inputType: "text", required: false },
  { id: "dailyContactTitle", label: "Daily Contact Title", inputType: "text", required: false },
  { id: "dailyContactPhone", label: "Daily Contact Phone", inputType: "tel", required: false },
  { id: "dailyContactMobile", label: "Daily Contact Mobile (if different)", inputType: "tel", required: false },
  { id: "dailyContactEmail", label: "Daily Contact Email", inputType: "email", required: false },
];

// ─── Sales & Revenue Block ─────────────────────────────────────

export const salesRevenueFields: FieldDef[] = [
  { id: "avgMonthlyCardSales", label: "Average Monthly Card Sales", inputType: "monetary", required: true },
  { id: "totalMonthlySales", label: "Total Monthly Sales", inputType: "monetary", required: true },
  { id: "annualGrossSales", label: "Annual Gross Sales", inputType: "monetary", required: true },
  { id: "additionalNotes", label: "Any Additional Notes for Our Team to Consider?", inputType: "textarea", required: false, rows: 3 },
];

// ─── MCA Block (conditional on Quick App high-interest debt) ────

export function makeMcaBlockFields(maxMcas = 10): FieldDef[] {
  const fields: FieldDef[] = [
    {
      id: "currentMcaCount",
      label: "How Many Current MCAs Do You Have?",
      inputType: "select_one",
      required: true,
      options: Array.from({ length: maxMcas }, (_, i) => String(i + 1)),
      showIf: { fieldId: "hasHighInterestDebt", equals: "Yes" },
    },
  ];

  for (let i = 1; i <= maxMcas; i++) {
    fields.push({
      id: `mca${i}_lenderName`,
      label: `MCA ${i} - Lender Name`,
      inputType: "text",
      required: true,
      showIf: { fieldId: "currentMcaCount", equals: Array.from({ length: maxMcas - i + 1 }, (_, k) => String(k + i)) },
    });
    fields.push({
      id: `mca${i}_amount`,
      label: `MCA ${i} - Amount`,
      inputType: "monetary",
      required: true,
      showIf: { fieldId: "currentMcaCount", equals: Array.from({ length: maxMcas - i + 1 }, (_, k) => String(k + i)) },
    });
  }

  return fields;
}

// ─── Credit Authorization & Signature ─────────────────────────

export const creditAuthFields: FieldDef[] = [
  {
    id: "authBusinessName",
    label: "Business Name",
    inputType: "text",
    required: true,
  },
  {
    id: "authOwnerName",
    label: "Owner/Principal Full Name",
    inputType: "text",
    required: true,
  },
  {
    id: "authOwnerTitle",
    label: "Owner/Principal Title",
    inputType: "text",
    required: true,
  },
  {
    id: "authSignature",
    label: "Owner/Principal Signature",
    inputType: "signature",
    required: true,
    encrypt: true,
  },
  {
    id: "authDate",
    label: "Date",
    inputType: "auto_date",
    required: true,
  },
];
