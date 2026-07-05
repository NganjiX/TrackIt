import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRWF } from '@/lib/utils';

interface RevenueExpenseChartProps {
  data: Array<{ month: string; revenue: number; expenses: number }>;
  currency?: string;
}

/**
 * Revenue vs Expenses area chart (ANLY-02).
 */
export function RevenueExpenseChart({ data, currency = 'RWF' }: RevenueExpenseChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5) + '/' + d.month.slice(2, 4),
  }));

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">{t('analytics.revenueVsExpenses')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatRWF(value, currency)} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              name={t('analytics.revenue')}
              stroke="#059669"
              fill="#059669"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name={t('analytics.expenses')}
              stroke="#dc2626"
              fill="#dc2626"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
