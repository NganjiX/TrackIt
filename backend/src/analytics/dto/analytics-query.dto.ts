import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional } from 'class-validator';

export type AnalyticsPeriod = 'month' | 'quarter' | 'year' | 'custom';

/**
 * Resolves start/end dates for an analytics period.
 */
export function resolveAnalyticsDateRange(
  period: AnalyticsPeriod = 'year',
  dateFrom?: string,
  dateTo?: string,
): { start: Date; end: Date } {
  const end = dateTo ? new Date(dateTo) : new Date();
  end.setHours(23, 59, 59, 999);

  let start: Date;

  if (period === 'custom' && dateFrom) {
    start = new Date(dateFrom);
  } else {
    start = new Date(end);
    switch (period) {
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
      default:
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
  }

  start.setHours(0, 0, 0, 0);
  return { start, end };
}

/**
 * Formats a date as YYYY-MM for chart labels.
 */
export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Builds consecutive month keys between two dates (inclusive).
 */
export function buildMonthKeys(start: Date, end: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    keys.push(toMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}

/**
 * Query parameters for analytics summary (ANLY-01..05).
 */
export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ['month', 'quarter', 'year', 'custom'], default: 'year' })
  @IsOptional()
  @IsIn(['month', 'quarter', 'year', 'custom'])
  period?: AnalyticsPeriod = 'year';

  @ApiPropertyOptional({ description: 'Required when period=custom (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Optional end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
