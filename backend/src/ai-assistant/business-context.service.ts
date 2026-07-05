import { Injectable } from '@nestjs/common';
import { DebtStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CREDIT_READINESS_LABELS } from '../health-score/health-score.types';
import { BusinessContextSnapshot } from './dto/chat.dto';

/**
 * Aggregates scoped business data for AI grounding (AI-02, AI-05).
 */
@Injectable()
export class BusinessContextService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  async buildContext(ownerId: string): Promise<BusinessContextSnapshot> {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);

    const [
      breakdown,
      saleAgg,
      expenseAgg,
      openDebts,
      transactionCount,
      documentCount,
      customerCount,
      debtStats,
    ] = await Promise.all([
      this.healthScoreService.getBreakdown(business.id),
      this.prisma.transaction.aggregate({
        where: { businessId: business.id, type: TransactionType.sale },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { businessId: business.id, type: TransactionType.expense },
        _sum: { amount: true },
      }),
      this.prisma.debt.findMany({
        where: { businessId: business.id, status: { not: DebtStatus.paid } },
        select: { amount: true, paidAmount: true },
      }),
      this.prisma.transaction.count({ where: { businessId: business.id } }),
      this.prisma.document.count({ where: { businessId: business.id } }),
      this.prisma.customer.count({ where: { businessId: business.id } }),
      this.prisma.debt.groupBy({
        by: ['status'],
        where: { businessId: business.id },
        _count: { _all: true },
      }),
    ]);

    const totalRevenue = Number(saleAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const outstandingDebts = openDebts.reduce(
      (sum, d) => sum + Number(d.amount) - Number(d.paidAmount),
      0,
    );

    const debtCount = debtStats.reduce((sum, s) => sum + s._count._all, 0);
    const paidDebtCount = debtStats.find((s) => s.status === DebtStatus.paid)?._count._all ?? 0;

    return {
      businessName: business.name,
      passportId: business.passportId,
      healthScore: breakdown.overall,
      creditReadiness: breakdown.creditReadiness,
      creditReadinessLabel: CREDIT_READINESS_LABELS[breakdown.creditReadiness],
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      outstandingDebts,
      transactionCount,
      documentCount,
      customerCount,
      debtCount,
      paidDebtCount,
      currency: business.currency,
    };
  }

  toSystemPrompt(context: BusinessContextSnapshot, language: 'en' | 'rw'): string {
    const langNote =
      language === 'rw'
        ? 'Respond in Kinyarwanda (Ikinyarwanda). Use clear, simple language suitable for Rwandan MSME owners.'
        : 'Respond in English. Use clear, simple language suitable for Rwandan MSME owners.';

    return `You are SmartLedger AI Assistant, a helpful financial advisor for Rwandan micro and small businesses.
${langNote}
Only use the business data below. Never invent numbers or reference other businesses.
If asked about data you do not have, say so honestly and suggest what the owner can record in SmartLedger.

Business: ${context.businessName} (${context.passportId})
Health Score: ${context.healthScore}/100 — ${context.creditReadinessLabel} (${context.creditReadiness})
Revenue: ${context.totalRevenue} ${context.currency}
Expenses: ${context.totalExpenses} ${context.currency}
Net Profit: ${context.netProfit} ${context.currency}
Outstanding Debts: ${context.outstandingDebts} ${context.currency}
Transactions Recorded: ${context.transactionCount}
Documents Uploaded: ${context.documentCount}
Customers: ${context.customerCount}
Debts: ${context.debtCount} total, ${context.paidDebtCount} fully paid

Give practical, actionable advice. Keep responses concise (2-4 short paragraphs max).`;
  }
}
