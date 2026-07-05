import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, FileText, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Passport } from '@/features/passport/api/passport.api';

interface ActivitySummaryProps {
  summary: Passport['activitySummary'];
}

/**
 * Activity summary section on the passport (PASS-03).
 */
export function ActivitySummary({ summary }: ActivitySummaryProps) {
  const { t } = useTranslation();

  const items = [
    { key: 'transactions', value: summary.transactionsRecorded, icon: ArrowLeftRight },
    { key: 'documents', value: summary.documentsUploaded, icon: FileText },
    { key: 'customers', value: summary.customersRegistered, icon: Users },
    { key: 'debts', value: summary.debtsResolved, icon: Wallet },
  ] as const;

  return (
    <Card className="glass-card border-0">
      <CardHeader>
        <CardTitle className="text-base">{t('passport.activitySummary')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, value, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="rounded-lg bg-navy/10 dark:bg-gold/10 p-2">
                <Icon className="h-5 w-5 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{t(`passport.activity.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
