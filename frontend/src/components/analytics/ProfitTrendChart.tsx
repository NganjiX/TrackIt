import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRWF } from '@/lib/utils';

interface ProfitTrendChartProps {
  data: Array<{ month: string; profit: number }>;
  currency?: string;
}

/**
 * Monthly profit trend bar chart (ANLY-04).
 */
export function ProfitTrendChart({ data, currency = 'RWF' }: ProfitTrendChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5) + '/' + d.month.slice(2, 4),
  }));

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">{t('analytics.profitTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => formatRWF(value, currency)} />
            <Bar dataKey="profit" name={t('analytics.profit')} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.profit >= 0 ? '#D4A017' : '#dc2626'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
