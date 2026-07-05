import { Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import { HealthScoreService } from '../health-score/health-score.service';
import { CREDIT_READINESS_LABELS } from '../health-score/health-score.types';

export type QuickAction = 'record_sale' | 'upload_receipt' | 'view_passport' | 'track_debt';

/**
 * Aggregates dashboard financial summary, health score, and recent activity (DASH-01..05).
 */
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
    private readonly healthScoreService: HealthScoreService,
  ) {}

  /**
   * Returns the full dashboard payload for the authenticated business owner.
   */
  async getSummary(ownerId: string) {
    const business = await this.businessesService.findByOwnerId(ownerId);
    if (!business) {
      throw new NotFoundException({
        message: 'Business not found',
        errorCode: 'BUSINESS_NOT_FOUND',
      });
    }

    const businessId = business.id;

    const [saleAgg, expenseAgg, debts, recentTransactions, healthBreakdown] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { businessId, type: TransactionType.sale },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { businessId, type: TransactionType.expense },
        _sum: { amount: true },
      }),
      this.prisma.debt.findMany({
        where: { businessId, status: { not: DebtStatus.paid } },
        select: { amount: true, paidAmount: true },
      }),
      this.prisma.transaction.findMany({
        where: { businessId },
        orderBy: { date: 'desc' },
        take: 8,
        select: {
          id: true,
          type: true,
          category: true,
          amount: true,
          description: true,
          date: true,
          paymentStatus: true,
          productService: true,
        },
      }),
      this.healthScoreService.getBreakdown(businessId),
    ]);

    const totalRevenue = Number(saleAgg._sum.amount ?? 0);
    const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
    const estimatedProfit = totalRevenue - totalExpenses;
    const outstandingDebts = debts.reduce(
      (sum, d) => sum + Number(d.amount) - Number(d.paidAmount),
      0,
    );

    return {
      financials: {
        totalRevenue,
        totalExpenses,
        estimatedProfit,
        outstandingDebts,
        currency: business.currency,
      },
      creditReadiness: {
        level: healthBreakdown.creditReadiness,
        label: CREDIT_READINESS_LABELS[healthBreakdown.creditReadiness],
        healthScore: healthBreakdown.overall,
        progressPercent: healthBreakdown.overall,
      },
      healthScoreBreakdown: {
        overall: healthBreakdown.overall,
        records: healthBreakdown.records,
        consistency: healthBreakdown.consistency,
        debtManagement: healthBreakdown.debtManagement,
      },
      recentTransactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
        date: t.date.toISOString().split('T')[0],
      })),
      quickActions: [
        'record_sale',
        'upload_receipt',
        'view_passport',
        'track_debt',
      ] as QuickAction[],
    };
  }
}
