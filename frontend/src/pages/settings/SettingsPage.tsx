import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { businessApi, type BusinessType } from '@/features/business/api/business.api';
import { settingsApi } from '@/features/settings/api/settings.api';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

const BUSINESS_TYPES: BusinessType[] = [
  'retail_shop', 'farm', 'service', 'manufacturer', 'cooperative', 'other',
];

/**
 * Business settings with profile edit and health score (SET-02, SET-03).
 */
export function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: business, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['business', 'me'],
    queryFn: businessApi.getMe,
  });

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['settings', 'health'],
    queryFn: settingsApi.getHealth,
  });

  const [form, setForm] = useState<Record<string, string | number>>({});

  const formValues = business
    ? {
        name: (form.name as string) ?? business.name,
        type: (form.type as string) ?? business.type,
        industry: (form.industry as string) ?? business.industry,
        location: (form.location as string) ?? business.location,
        numEmployees: (form.numEmployees as number) ?? business.numEmployees,
      }
    : null;

  const updateMutation = useMutation({
    mutationFn: businessApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'health'] });
      toast({ title: t('settings.saved') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  if (isLoading) return <LoadingSkeleton rows={8} />;
  if (isError) {
    return (
      <ErrorState
        onRetry={() => refetch()}
        errorCode={(error as unknown as ApiError)?.errorCode}
        message={(error as unknown as ApiError)?.message}
      />
    );
  }

  return (
    <div>
      <PageHeader title={t('pages.settings')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base">{t('settings.businessProfile')}</CardTitle>
          </CardHeader>
          <CardContent>
            {formValues && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    name: formValues.name,
                    type: formValues.type as BusinessType,
                    industry: formValues.industry,
                    location: formValues.location,
                    numEmployees: Number(formValues.numEmployees),
                  });
                }}
              >
                <div className="space-y-2">
                  <Label>{t('onboarding.businessName')}</Label>
                  <Input
                    value={formValues.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('onboarding.businessType')}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formValues.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{t(`onboarding.types.${type}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('onboarding.industry')}</Label>
                  <Input
                    value={formValues.industry}
                    onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('onboarding.location')}</Label>
                  <Input
                    value={formValues.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('onboarding.numEmployees')}</Label>
                  <Input
                    type="number"
                    value={formValues.numEmployees}
                    onChange={(e) => setForm((f) => ({ ...f, numEmployees: Number(e.target.value) }))}
                  />
                </div>
                <Button type="submit" variant="gold" disabled={updateMutation.isPending}>
                  {t('common.save')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <HealthScoreWidget
          breakdown={
            health
              ? {
                  overall: health.healthScore,
                  records: health.breakdown.records,
                  consistency: health.breakdown.consistency,
                  debtManagement: health.breakdown.debtManagement,
                }
              : undefined
          }
          isLoading={healthLoading}
        />
      </div>
    </div>
  );
}
