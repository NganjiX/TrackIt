import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { PassportCard } from '@/components/passport/PassportCard';
import { ActivitySummary } from '@/components/passport/ActivitySummary';
import { ImprovementChecklist } from '@/components/passport/ImprovementChecklist';
import { passportApi } from '@/features/passport/api/passport.api';

/**
 * Public read-only passport view for external lenders (PASS-05).
 */
export function PublicPassportPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['passport', 'public', token],
    queryFn: () => passportApi.getPublic(token!),
    enabled: !!token,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gold flex items-center justify-center">
              <BadgeCheck className="h-6 w-6 text-navy" />
            </div>
            <span className="font-display text-xl font-bold text-white">FinTrack</span>
          </div>
          <LanguageToggle variant="auth" />
        </div>

        {isLoading && <LoadingSkeleton rows={10} />}
        {isError && (
          <div className="glass-card p-8 text-center">
            <BadgeCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-xl font-bold mb-2">{t('passport.linkInvalid')}</h1>
            <p className="text-muted-foreground text-sm">{t('passport.linkInvalidDesc')}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <PassportCard passport={data} readonly />
            <ActivitySummary summary={data.activitySummary} />
            <ImprovementChecklist items={data.improvementChecklist} />
            <p className="text-center text-xs text-navy-200">
              {t('passport.publicDisclaimer')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
