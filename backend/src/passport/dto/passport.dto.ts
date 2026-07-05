import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateShareLinkDto {
  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number = 7;
}

export interface ImprovementChecklistItem {
  id: string;
  completed: boolean;
}

export interface PassportPayload {
  passportId: string;
  business: {
    name: string;
    type: string;
    industry: string;
    location: string;
    yearsOperating: number;
    numEmployees: number;
  };
  healthScore: number;
  healthScoreBreakdown: {
    records: number;
    consistency: number;
    debtManagement: number;
  };
  creditReadiness: {
    level: string;
    label: string;
  };
  activitySummary: {
    transactionsRecorded: number;
    documentsUploaded: number;
    customersRegistered: number;
    debtsResolved: number;
  };
  improvementChecklist: ImprovementChecklistItem[];
  generatedAt: string;
}

/**
 * Builds the server-side improvement checklist (PASS-04).
 */
export function buildImprovementChecklist(counts: {
  transactionCount: number;
  documentCount: number;
  customerCount: number;
  resolvedDebtRatio: number;
}): ImprovementChecklistItem[] {
  return [
    { id: 'transactions_10', completed: counts.transactionCount >= 10 },
    { id: 'documents_3', completed: counts.documentCount >= 3 },
    { id: 'customers_3', completed: counts.customerCount >= 3 },
    { id: 'debts_50pct', completed: counts.resolvedDebtRatio >= 0.5 },
    { id: 'transactions_20', completed: counts.transactionCount >= 20 },
  ];
}
