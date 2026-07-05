import {
  LineChart,
  Line,
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

interface YearlyTrendChartProps {
  data: Array<{ year: number; revenue: number; profit: number }>;
  currency?: string;
}

/**
 * Five-year revenue and profit line chart (HIST-02).
 */
export function YearlyTrendChart({ data, currency = 'RWF' }: YearlyTrendChartProps) {
  const { t } = useTranslation();

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">{t('history.yearlyTrend')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(value: number) => formatRWF(value, currency)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name={t('analytics.revenue')}
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              name={t('analytics.profit')}
              stroke="#D4A017"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
