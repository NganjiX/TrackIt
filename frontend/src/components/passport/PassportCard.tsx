import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Passport } from '@/features/passport/api/passport.api';

interface PassportCardProps {
  passport: Passport;
  readonly?: boolean;
}

const LEVEL_VARIANT: Record<string, 'warning' | 'gold' | 'success'> = {
  low: 'warning',
  medium: 'gold',
  high: 'success',
};

/**
 * Passport identity card with business info and health score (PASS-01, PASS-02).
 */
export function PassportCard({ passport, readonly }: PassportCardProps) {
  const { t } = useTranslation();
  const score = passport.healthScore;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="glass-card border-0 overflow-hidden">
      <div className="bg-gradient-to-br from-navy to-navy-700 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gold flex items-center justify-center">
              <BadgeCheck className="h-7 w-7 text-navy" />
            </div>
            <div>
              <p className="text-xs text-navy-100 uppercase tracking-wider">FinTrack</p>
              <h2 className="font-display text-lg font-bold">{t('passport.title')}</h2>
            </div>
          </div>
          {readonly && (
            <Badge variant="secondary" className="bg-white/10 text-white border-0">
              {t('passport.readOnly')}
            </Badge>
          )}
        </div>

        <p className="font-mono text-sm text-gold mb-1">{passport.passportId}</p>
        <h3 className="text-2xl font-bold mb-1">{passport.business.name}</h3>
        <p className="text-sm text-navy-100">
          {t(`onboarding.types.${passport.business.type}`, passport.business.type)}
          {' · '}
          {passport.business.location}
        </p>
      </div>

      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-3">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-gold transition-all duration-700"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <Badge variant={LEVEL_VARIANT[passport.creditReadiness.level] ?? 'secondary'}>
              {passport.creditReadiness.label}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('passport.industry')}</span>
              <span className="font-medium">{passport.business.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('passport.yearsOperating')}</span>
              <span className="font-medium">{passport.business.yearsOperating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('passport.employees')}</span>
              <span className="font-medium">{passport.business.numEmployees}</span>
            </div>
            {['records', 'consistency', 'debtManagement'].map((key) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">
                    {t(`dashboard.metrics.${key === 'debtManagement' ? 'debtManagement' : key}`)}
                  </span>
                  <span className="font-medium">
                    {passport.healthScoreBreakdown[key as keyof typeof passport.healthScoreBreakdown]}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-navy dark:bg-gold')}
                    style={{
                      width: `${passport.healthScoreBreakdown[key as keyof typeof passport.healthScoreBreakdown]}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
