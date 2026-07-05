import { Injectable, Logger } from '@nestjs/common';
import { DebtStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  HealthScoreBreakdown,
  scoreToCreditReadiness,
  getActiveMonthKeys,
  countMonthsBetween,
} from './health-score.types';

/**
 * Server-side health score engine — never accepts client-computed scores (NFR 6.1).
 */
@Injectable()
export class HealthScoreService {
  private readonly logger = new Logger(HealthScoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates composite health score breakdown for a business.
   */
  async calculateForBusiness(businessId: string): Promise<HealthScoreBreakdown> {
    const [txnCount, docCount, debts, transactions] = await Promise.all([
      this.prisma.transaction.count({ where: { businessId } }),
      this.prisma.document.count({ where: { businessId } }),
      this.prisma.debt.findMany({ where: { businessId }, select: { status: true } }),
      this.prisma.transaction.findMany({
        where: { businessId },
        select: { date: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const records = Math.min(100, txnCount * 3 + docCount * 5);

    let consistency = 0;
    if (transactions.length > 0) {
      const firstDate = transactions[0].date;
      const totalMonths = Math.max(1, countMonthsBetween(firstDate, new Date()));
      const activeMonths = getActiveMonthKeys(transactions.map((t) => t.date)).size;
      consistency = Math.min(100, Math.round((activeMonths / totalMonths) * 100));
    }

    let debtManagement = 50;
    if (debts.length > 0) {
      const paidCount = debts.filter((d) => d.status === DebtStatus.paid).length;
      debtManagement = Math.round((paidCount / debts.length) * 100);
    }

    const overall = Math.round(records * 0.4 + consistency * 0.35 + debtManagement * 0.25);
    const creditReadiness = scoreToCreditReadiness(overall);

    return {
      overall,
      records,
      consistency,
      debtManagement,
      creditReadiness,
    };
  }

  /**
   * Recalculates and persists health score on the business record.
   */
  async recalculateAndPersist(businessId: string): Promise<HealthScoreBreakdown> {
    const breakdown = await this.calculateForBusiness(businessId);

    await this.prisma.$transaction([
      this.prisma.business.update({
        where: { id: businessId },
        data: {
          healthScore: breakdown.overall,
          creditReadiness: breakdown.creditReadiness,
        },
      }),
      this.prisma.healthScoreLog.create({
        data: {
          businessId,
          score: breakdown.overall,
          recordsScore: breakdown.records,
          consistencyScore: breakdown.consistency,
          debtScore: breakdown.debtManagement,
          creditReadiness: breakdown.creditReadiness,
        },
      }),
    ]);

    this.logger.debug(`Health score updated for business ${businessId}: ${breakdown.overall}`);
    return breakdown;
  }

  /**
   * Returns the latest persisted breakdown, recalculating if needed.
   */
  async getBreakdown(businessId: string): Promise<HealthScoreBreakdown> {
    return this.calculateForBusiness(businessId);
  }
}
