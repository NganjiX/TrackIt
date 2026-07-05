import { Injectable } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';
import {
  AnalyticsQueryDto,
  buildMonthKeys,
  resolveAnalyticsDateRange,
  toMonthKey,
} from './dto/analytics-query.dto';

/**
 * Aggregates transaction data into analytics charts and insights (ANLY-01..05).
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
  ) {}

  async getSummary(ownerId: string, query: AnalyticsQueryDto) {
    const business = await this.businessesService.requireBusinessByOwner(ownerId);
    const period = query.period ?? 'year';
    const { start, end } = resolveAnalyticsDateRange(period, query.dateFrom, query.dateTo);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        businessId: business.id,
        date: { gte: start, lte: end },
      },
      select: { type: true, amount: true, category: true, date: true },
    });

    let totalRevenue = 0;
    let totalExpenses = 0;
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();
    const expenseByCategory = new Map<string, number>();

    for (const txn of transactions) {
      const amount = Number(txn.amount);
      const monthKey = toMonthKey(txn.date);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { revenue: 0, expenses: 0 });
      }
      const bucket = monthlyMap.get(monthKey)!;

      if (txn.type === TransactionType.sale) {
        totalRevenue += amount;
        bucket.revenue += amount;
      } else if (txn.type === TransactionType.expense) {
        totalExpenses += amount;
        bucket.expenses += amount;
        expenseByCategory.set(txn.category, (expenseByCategory.get(txn.category) ?? 0) + amount);
      }
    }

    const netProfit = totalRevenue - totalExpenses;
    const monthKeys = buildMonthKeys(start, end);

    const revenueVsExpenses = monthKeys.map((month) => {
      const data = monthlyMap.get(month) ?? { revenue: 0, expenses: 0 };
      return { month, revenue: data.revenue, expenses: data.expenses };
    });

    const profitTrend = monthKeys.map((month) => {
      const data = monthlyMap.get(month) ?? { revenue: 0, expenses: 0 };
      return { month, profit: data.revenue - data.expenses };
    });

    const expenseBreakdown = this.buildExpenseBreakdown(expenseByCategory, totalExpenses);
    const insights = await this.buildInsights(
      business.id,
      period,
      start,
      end,
      totalRevenue,
      totalExpenses,
      netProfit,
      expenseBreakdown,
    );

    return {
      period,
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        currency: business.currency,
      },
      revenueVsExpenses,
      expenseBreakdown,
      profitTrend,
      insights,
    };
  }

  private buildExpenseBreakdown(
    expenseByCategory: Map<string, number>,
    totalExpenses: number,
  ): Array<{ category: string; amount: number; percent: number }> {
    return [...expenseByCategory.entries()]
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  private async buildInsights(
    businessId: string,
    period: string,
    start: Date,
    end: Date,
    totalRevenue: number,
    totalExpenses: number,
    netProfit: number,
    expenseBreakdown: Array<{ category: string; amount: number; percent: number }>,
  ) {
    const rangeMs = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - rangeMs);

    const prevTransactions = await this.prisma.transaction.findMany({
      where: {
        businessId,
        date: { gte: prevStart, lte: prevEnd },
      },
      select: { type: true, amount: true },
    });

    let prevRevenue = 0;
    for (const txn of prevTransactions) {
      if (txn.type === TransactionType.sale) {
        prevRevenue += Number(txn.amount);
      }
    }

    let revenueTrend: string;
    if (prevRevenue === 0 && totalRevenue === 0) {
      revenueTrend = 'No revenue recorded in this period or the previous one.';
    } else if (prevRevenue === 0) {
      revenueTrend = 'Revenue is new compared to the previous period.';
    } else {
      const change = ((totalRevenue - prevRevenue) / prevRevenue) * 100;
      const direction = change >= 0 ? 'increased' : 'decreased';
      revenueTrend = `Revenue ${direction} ${Math.abs(Math.round(change * 10) / 10)}% compared to the previous ${period}.`;
    }

    const topExpense = expenseBreakdown[0];
    const topExpenseCategory = topExpense
      ? `${topExpense.category} accounts for ${topExpense.percent}% of expenses`
      : 'No expenses recorded in this period.';

    const profitMargin =
      totalRevenue > 0
        ? `Your profit margin is ${Math.round((netProfit / totalRevenue) * 1000) / 10}%`
        : 'Profit margin cannot be calculated without revenue.';

    return {
      revenueTrend,
      topExpenseCategory,
      profitMargin,
    };
  }
}
