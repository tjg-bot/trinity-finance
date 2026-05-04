/**
 * 7-year retention policy on funded loans.
 * State-by-state configuration - some states require longer.
 */
export const RETENTION_YEARS_DEFAULT = 7;

export const STATE_RETENTION_OVERRIDE: Record<string, number> = {
  CA: 10,
  NY: 10,
  TX: 7,
  FL: 7,
  // Add state-specific overrides as regulations change
};

export function getRetentionYears(stateCode: string): number {
  return STATE_RETENTION_OVERRIDE[stateCode] ?? RETENTION_YEARS_DEFAULT;
}

export function getRetentionCutoffDate(stateCode: string): Date {
  const years = getRetentionYears(stateCode);
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}
