import { CreditReadiness } from '@prisma/client';

export interface HealthScoreBreakdown {
  overall: number;
  records: number;
  consistency: number;
  debtManagement: number;
  creditReadiness: CreditReadiness;
}

export const CREDIT_READINESS_LABELS: Record<CreditReadiness, string> = {
  low: 'Building Foundation',
  medium: 'Near Ready',
  high: 'Credit Ready',
};

/**
 * Maps a numeric health score to a credit readiness level per SRS Section 9.
 */
export function scoreToCreditReadiness(score: number): CreditReadiness {
  if (score <= 34) return CreditReadiness.low;
  if (score <= 69) return CreditReadiness.medium;
  return CreditReadiness.high;
}

/**
 * Generates a unique Passport ID in format SL-XXXXXXXX.
 */
export function generatePassportId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SL-${suffix}`;
}

/**
 * Returns distinct year-month keys (YYYY-MM) from transaction dates.
 */
export function getActiveMonthKeys(dates: Date[]): Set<string> {
  const keys = new Set<string>();
  for (const d of dates) {
    const date = new Date(d);
    keys.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/**
 * Counts calendar months between two dates (inclusive of start month).
 */
export function countMonthsBetween(start: Date, end: Date): number {
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
}
