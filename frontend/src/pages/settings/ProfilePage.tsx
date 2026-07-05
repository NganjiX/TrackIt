import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Bell, User } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { settingsApi } from '@/features/settings/api/settings.api';
import { notificationsApi } from '@/features/notifications/api/notifications.api';
import { useAuthStore } from '@/store/auth.store';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * User profile and notification preferences (SET-01, I18N-03).
 */
export function ProfilePage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const authUser = useAuthStore((s) => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: settingsApi.getProfile,
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  });

  const [fullName, setFullName] = useState('');

  const profileMutation = useMutation({
    mutationFn: (name: string) => settingsApi.updateProfile(name),
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] });
      toast({ title: t('settings.profileSaved') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const languageMutation = useMutation({
    mutationFn: (language: 'en' | 'rw') => settingsApi.updateLanguage(language),
    onSuccess: (user) => {
      setUser(user);
      i18n.changeLanguage(user.language);
      localStorage.setItem('smartledger-language', user.language);
      toast({ title: t('settings.languageSaved') });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const displayName = fullName || profile?.fullName || authUser?.fullName || '';

  if (isLoading) return <LoadingSkeleton rows={6} />;

  return (
    <div>
      <PageHeader title={t('pages.profile')} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('settings.accountInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input value={profile?.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t('auth.fullName')}</Label>
              <Input
                value={displayName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('settings.role')}</Label>
              <Input value={profile?.role ?? ''} disabled className="capitalize" />
            </div>
            <Button
              variant="gold"
              onClick={() => profileMutation.mutate(displayName)}
              disabled={profileMutation.isPending}
            >
              {t('common.save')}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-base">{t('language.toggle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
            <div className="flex gap-2">
              {(['en', 'rw'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={(profile?.language ?? i18n.language) === lang ? 'default' : 'outline'}
                  onClick={() => languageMutation.mutate(lang)}
                  disabled={languageMutation.isPending}
                >
                  {t(`language.${lang}`)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('settings.notifications')}
              {(notifications?.unreadCount ?? 0) > 0 && (
                <Badge variant="warning">{notifications?.unreadCount}</Badge>
              )}
            </CardTitle>
            {(notifications?.unreadCount ?? 0) > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
              >
                {t('settings.markAllRead')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!notifications?.data.length ? (
              <p className="text-sm text-muted-foreground">{t('settings.noNotifications')}</p>
            ) : (
              <ul className="space-y-3">
                {notifications.data.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-lg p-4 text-sm ${n.read ? 'bg-muted/20' : 'bg-gold/5 border border-gold/20'}`}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="text-muted-foreground mt-1">{n.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
