import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';

interface YearBucket {
  revenue: number;
  expenses: number;
  profit: number;
  transactionCount: number;
}

/**
 * Five-year business history rollup with YoY growth and milestones (HIST-01..04).
 */
@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
  ) {}

  async getFiveYearSummary(ownerId: string) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;

    const startDate = new Date(startYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        businessId: business.id,
        date: { gte: startDate, lte: endDate },
      },
      select: { type: true, amount: true, date: true },
    });

    const yearMap = new Map<number, YearBucket>();

    for (let year = startYear; year <= currentYear; year++) {
      yearMap.set(year, { revenue: 0, expenses: 0, profit: 0, transactionCount: 0 });
    }

    for (const txn of transactions) {
      const year = txn.date.getFullYear();
      if (!yearMap.has(year)) continue;

      const bucket = yearMap.get(year)!;
      const amount = Number(txn.amount);
      bucket.transactionCount += 1;

      if (txn.type === TransactionType.sale) {
        bucket.revenue += amount;
      } else if (txn.type === TransactionType.expense) {
        bucket.expenses += amount;
      }
    }

    for (const bucket of yearMap.values()) {
      bucket.profit = bucket.revenue - bucket.expenses;
    }

    const yearlyTrend = [...yearMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([year, data]) => ({
        year,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
      }));

    const annualBreakdown = [...yearMap.entries()]
      .sort(([a], [b]) => b - a)
      .map(([year, data]) => ({
        year,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
        transactionCount: data.transactionCount,
      }));

    const totalRevenue = yearlyTrend.reduce((sum, y) => sum + y.revenue, 0);
    const totalExpenses = yearlyTrend.reduce((sum, y) => sum + y.expenses, 0);
    const yearsWithData = yearlyTrend.filter((y) => y.revenue > 0 || y.expenses > 0).length || 1;
    const averageAnnualProfit = Math.round(
      yearlyTrend.reduce((sum, y) => sum + y.profit, 0) / yearsWithData,
    );

    const latestYear = yearlyTrend[yearlyTrend.length - 1];
    const previousYear = yearlyTrend[yearlyTrend.length - 2];

    const yearOverYearGrowth = {
      revenue: this.percentChange(previousYear?.revenue ?? 0, latestYear?.revenue ?? 0),
      profit: this.percentChange(previousYear?.profit ?? 0, latestYear?.profit ?? 0),
    };

    const bestPerformingYear = yearlyTrend.reduce(
      (best, y) => (y.profit > best.profit ? y : best),
      yearlyTrend[0] ?? { year: currentYear, profit: 0, revenue: 0, expenses: 0 },
    );

    const foundingYear = currentYear - business.yearsOperating;
    const totalTransactionVolume = transactions.length;

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        averageAnnualProfit,
        transactionCount: totalTransactionVolume,
        currency: business.currency,
      },
      yearlyTrend,
      yearOverYearGrowth,
      annualBreakdown,
      milestones: {
        foundingYear,
        bestPerformingYear: bestPerformingYear.year,
        totalTransactionVolume,
        yearsOperating: business.yearsOperating,
      },
    };
  }

  private percentChange(previous: number, current: number): number {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  }
}
