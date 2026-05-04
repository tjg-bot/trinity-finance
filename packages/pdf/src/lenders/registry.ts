/**
 * Lender PDF template registry.
 * Each entry maps Trinity field paths to lender-specific PDF form field names.
 * Templates stored at: packages/pdf/templates/lenders/{lenderId}/template-v1.pdf
 */
import type { LenderFieldMapping } from "../generator";

export interface LenderRegistry {
  [lenderId: string]: {
    name: string;
    templatePath?: string; // Path to the lender's PDF template
    fields: LenderFieldMapping[];
  };
}

export const LENDER_MAPPINGS: LenderRegistry = {
  "bank-first-national": {
    name: "First National Lending",
    // templatePath: path.join(__dirname, "../templates/lenders/bank-first-national/template-v1.pdf"),
    fields: [
      { trinityField: "quickApp.legalBusinessName", lenderField: "BusinessLegalName" },
      { trinityField: "quickApp.entityType", lenderField: "EntityType" },
      { trinityField: "quickApp.businessEmail", lenderField: "ApplicantEmail" },
      { trinityField: "quickApp.cellPhone", lenderField: "ApplicantPhone" },
      { trinityField: "quickApp.industry", lenderField: "IndustryType" },
      { trinityField: "quickApp.timeInBusiness", lenderField: "TimeInBusiness" },
      { trinityField: "quickApp.annualRevenue", lenderField: "AnnualRevenue" },
      { trinityField: "quickApp.ficoScore", lenderField: "FICOScore" },
      { trinityField: "quickApp.desiredFundingAmount", lenderField: "RequestedLoanAmount" },
      { trinityField: "quickApp.useOfFunds", lenderField: "LoanPurpose" },
      { trinityField: "loanApp.stateIncorporated", lenderField: "StateOfIncorporation" },
      { trinityField: "loanApp.businessAddress", lenderField: "BusinessAddress" },
      { trinityField: "loanApp.taxIdEin", lenderField: "TaxIDNumber" },
      { trinityField: "owners[0].fullName", lenderField: "PrimaryOwnerName" },
      { trinityField: "owners[0].ownershipPercent", lenderField: "PrimaryOwnershipPct" },
      { trinityField: "offer.rate", lenderField: "InterestRate", transform: (v) => `${v}%` },
      { trinityField: "offer.termMonths", lenderField: "LoanTermMonths" },
      { trinityField: "offer.amount", lenderField: "ApprovedLoanAmount" },
    ],
  },

  "bank-meridian": {
    name: "Meridian Business Finance",
    fields: [
      { trinityField: "quickApp.legalBusinessName", lenderField: "LegalEntityName" },
      { trinityField: "quickApp.businessEmail", lenderField: "ContactEmail" },
      { trinityField: "quickApp.cellPhone", lenderField: "ContactPhone" },
      { trinityField: "loanApp.stateIncorporated", lenderField: "IncorporationState" },
      { trinityField: "loanApp.businessAddress", lenderField: "PrimaryBusinessAddress" },
      { trinityField: "loanApp.taxIdEin", lenderField: "FEIN" },
      { trinityField: "loanApp.equipmentType", lenderField: "EquipmentCategory" },
      { trinityField: "loanApp.equipmentValue", lenderField: "EquipmentFMV" },
      { trinityField: "loanApp.equipmentCondition", lenderField: "EquipmentCondition" },
      { trinityField: "loanApp.supplierName", lenderField: "VendorName" },
      { trinityField: "quickApp.annualRevenue", lenderField: "GrossAnnualRevenue" },
      { trinityField: "quickApp.ficoScore", lenderField: "PersonalCreditScore" },
      { trinityField: "owners[0].fullName", lenderField: "GuarantorName" },
      { trinityField: "owners[0].ownershipPercent", lenderField: "GuarantorOwnershipPct" },
      { trinityField: "offer.amount", lenderField: "FinanceAmount" },
      { trinityField: "offer.rate", lenderField: "APR", transform: (v) => `${v}%` },
      { trinityField: "offer.termMonths", lenderField: "TermMonths" },
    ],
  },

  "bank-coastal": {
    name: "Coastal Capital Group",
    fields: [
      { trinityField: "quickApp.legalBusinessName", lenderField: "BusinessName" },
      { trinityField: "quickApp.businessEmail", lenderField: "Email" },
      { trinityField: "quickApp.cellPhone", lenderField: "Phone" },
      { trinityField: "quickApp.annualRevenue", lenderField: "AnnualGrossRevenue" },
      { trinityField: "quickApp.ficoScore", lenderField: "CreditScore" },
      { trinityField: "quickApp.desiredFundingAmount", lenderField: "RequestedAmount" },
      { trinityField: "loanApp.stateIncorporated", lenderField: "State" },
      { trinityField: "loanApp.businessAddress", lenderField: "Address" },
      { trinityField: "loanApp.taxIdEin", lenderField: "EIN" },
      { trinityField: "owners[0].fullName", lenderField: "OwnerName" },
      { trinityField: "offer.rate", lenderField: "Rate", transform: (v) => `${v}%` },
      { trinityField: "offer.termMonths", lenderField: "Term" },
      { trinityField: "offer.amount", lenderField: "ApprovedAmount" },
    ],
  },
};
