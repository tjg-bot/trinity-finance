/**
 * Trinity Finance - Declarative Conditional Logic Engine
 * Evaluates showIf conditions against current form state.
 * Fields hidden by showIf are never persisted on submit.
 */
import { z } from "zod";

export type InputType =
  | "text"
  | "email"
  | "tel"
  | "dropdown"
  | "select_one"
  | "monetary"
  | "number"
  | "multi_text"
  | "multi_text_monetary"
  | "signature"
  | "auto_date"
  | "textarea"
  | "checkbox"
  | "url";

export interface ShowIfCondition {
  fieldId: string;
  equals?: string | string[];
  notEquals?: string | string[];
  truthy?: boolean;
}

export interface FieldDef {
  id: string;
  label: string;
  inputType: InputType;
  options?: string[];
  required: boolean;
  showIf?: ShowIfCondition;
  validation?: z.ZodTypeAny;
  encrypt?: boolean; // PII flag - field value will be encrypted at rest
  placeholder?: string;
  helpText?: string;
  maxLength?: number;
  rows?: number; // for textarea
  min?: number;
  max?: number;
  count?: number; // for multi_text / multi_text_monetary - how many slots
}

export interface SectionDef {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

/**
 * Evaluate whether a field should be visible given current form values.
 */
export function isFieldVisible(
  field: FieldDef,
  formValues: Record<string, unknown>
): boolean {
  if (!field.showIf) return true;

  const { fieldId, equals, notEquals, truthy } = field.showIf;
  const value = formValues[fieldId];

  if (truthy !== undefined) {
    return truthy ? Boolean(value) : !value;
  }

  if (equals !== undefined) {
    if (Array.isArray(equals)) {
      return equals.includes(String(value ?? ""));
    }
    return String(value ?? "") === equals;
  }

  if (notEquals !== undefined) {
    if (Array.isArray(notEquals)) {
      return !notEquals.includes(String(value ?? ""));
    }
    return String(value ?? "") !== notEquals;
  }

  return true;
}

/**
 * Filter form values to only include visible fields (for submit).
 * Fields hidden by showIf are stripped from the payload.
 */
export function filterVisibleValues(
  fields: FieldDef[],
  formValues: Record<string, unknown>
): Record<string, unknown> {
  const visible: Record<string, unknown> = {};
  for (const field of fields) {
    if (isFieldVisible(field, formValues)) {
      visible[field.id] = formValues[field.id];
    }
  }
  return visible;
}

/**
 * Build a Zod schema from visible fields for runtime validation.
 */
export function buildDynamicSchema(
  fields: FieldDef[],
  formValues: Record<string, unknown>
): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};

  for (const field of fields) {
    if (!isFieldVisible(field, formValues)) continue;

    let schema: z.ZodTypeAny;

    if (field.validation) {
      schema = field.validation;
    } else if (field.inputType === "email") {
      schema = z.string().email("Invalid email address");
    } else if (field.inputType === "tel") {
      schema = z.string().regex(/^\+?[\d\s\-().]{7,}$/, "Invalid phone number");
    } else if (field.inputType === "monetary" || field.inputType === "number") {
      schema = z.string().regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number");
    } else if (field.inputType === "url") {
      schema = z.string().url("Invalid URL").or(z.literal(""));
    } else {
      schema = z.string();
    }

    if (!field.required) {
      schema = schema.optional().or(z.literal("")).optional();
    } else {
      if (field.inputType !== "signature" && field.inputType !== "auto_date") {
        schema = (schema as z.ZodString).min(1, `${field.label} is required`);
      }
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}

/**
 * Determine which loan section to route to based on Quick App answers.
 */
export function resolveRouting(quickAppValues: Record<string, unknown>): string {
  const selection = quickAppValues["loanTypeSelection"] as string | undefined;

  const routingMap: Record<string, string> = {
    "Small Business Administration (SBA)": "/apply/sba",
    "Line of Credit": "/apply/line-of-credit",
    "Equipment Financing": "/apply/equipment",
    "Merchant Cash Advance (MCA)": "/apply/mca",
    "Invoice Financing": "/apply/invoice-financing",
    "Invoice Factoring": "/apply/factoring",
    "I'd Like Some Help Figuring Out What's Best": "/apply/unsure",
  };

  return routingMap[selection ?? ""] ?? "/apply/unsure";
}
