import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRWF } from '@/lib/utils';

const COLORS = ['#1A2642', '#D4A017', '#059669', '#dc2626', '#6366f1', '#f59e0b', '#8b5cf6'];

interface ExpenseBreakdownChartProps {
  data: Array<{ category: string; amount: number; percent: number }>;
  currency?: string;
}

/**
 * Expense breakdown pie chart (ANLY-03).
 */
export function ExpenseBreakdownChart({ data, currency = 'RWF' }: ExpenseBreakdownChartProps) {
  const { t } = useTranslation();

  if (!data.length) {
    return (
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="text-base">{t('analytics.expenseBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-12 text-center">{t('analytics.noExpenses')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">{t('analytics.expenseBreakdown')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ category, percent }) =>
                `${category} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatRWF(value, currency)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
