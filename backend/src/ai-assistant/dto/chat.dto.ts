import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ChatDto {
  @ApiProperty({ example: 'Am I ready for a loan?' })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiPropertyOptional({ description: 'Existing session ID or null for new session' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ enum: ['en', 'rw'], default: 'en' })
  @IsOptional()
  @IsIn(['en', 'rw'])
  language?: 'en' | 'rw' = 'en';
}

export interface BusinessContextSnapshot {
  businessName: string;
  passportId: string;
  healthScore: number;
  creditReadiness: string;
  creditReadinessLabel: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingDebts: number;
  transactionCount: number;
  documentCount: number;
  customerCount: number;
  debtCount: number;
  paidDebtCount: number;
  currency: string;
}

export const STARTER_SUGGESTIONS: Record<'en' | 'rw', string[]> = {
  en: [
    'Am I ready for a loan?',
    'How can I improve my health score?',
    'What is my biggest financial risk?',
    'Summarize my business performance',
    'How do I reach credit-ready status?',
  ],
  rw: [
    'Ese nditeguye gufata inguzanyo?',
    "Nshobora gute kunoza amanota yanjye y'ubuzima bw'ubucuruzi?",
    "Ni irihe riski nini mu by'imari yanjye?",
    "Sohora incamake y'imikorere y'ubucuruzi bwanjye",
    "Nigute nagera ku rwego rw'itegura kwigira?",
  ],
};
