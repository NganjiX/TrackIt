import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Users, Building2, ArrowLeftRight, FileText } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { Pagination } from '@/components/data-display/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/features/admin/api/admin.api';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * Admin panel for platform management (UC-14).
 */
export function AdminPanelPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [userPage, setUserPage] = useState(1);
  const [bizPage, setBizPage] = useState(1);
  const [tab, setTab] = useState<'users' | 'businesses'>('users');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin', 'users', userPage],
    queryFn: () => adminApi.listUsers(userPage),
    enabled: tab === 'users',
  });

  const { data: businesses, isLoading: bizLoading } = useQuery({
    queryKey: ['admin', 'businesses', bizPage],
    queryFn: () => adminApi.listBusinesses(bizPage),
    enabled: tab === 'businesses',
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'admin' | 'user' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: t('admin.roleUpdated') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const statCards = stats
    ? [
        { key: 'users', value: stats.userCount, icon: Users, label: t('admin.stats.users') },
        { key: 'businesses', value: stats.businessCount, icon: Building2, label: t('admin.stats.businesses') },
        { key: 'transactions', value: stats.transactionCount, icon: ArrowLeftRight, label: t('admin.stats.transactions') },
        { key: 'documents', value: stats.documentCount, icon: FileText, label: t('admin.stats.documents') },
      ]
    : [];

  return (
    <div>
      <PageHeader title={t('pages.admin')} />

      {statsLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {statCards.map(({ key, value, icon: Icon, label }) => (
            <Card key={key} className="glass-card border-0">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="rounded-lg bg-navy/10 dark:bg-gold/10 p-2">
                  <Icon className="h-5 w-5 text-navy dark:text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          variant={tab === 'users' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('users')}
        >
          {t('admin.usersTab')}
        </Button>
        <Button
          variant={tab === 'businesses' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTab('businesses')}
        >
          {t('admin.businessesTab')}
        </Button>
      </div>

      {tab === 'users' && (
        <>
          {usersLoading && <LoadingSkeleton rows={6} />}
          {users?.data.length ? (
            <Card className="glass-card border-0">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">{t('auth.fullName')}</th>
                      <th className="text-left p-4 font-medium">{t('auth.email')}</th>
                      <th className="text-left p-4 font-medium">{t('settings.role')}</th>
                      <th className="text-left p-4 font-medium">{t('admin.business')}</th>
                      <th className="p-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.data.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-medium">{user.fullName}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4 capitalize">
                          <Badge variant={user.role === 'admin' ? 'gold' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.businessName ?? '—'}</td>
                        <td className="p-4">
                          {user.role === 'user' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => roleMutation.mutate({ id: user.id, role: 'admin' })}
                            >
                              {t('admin.makeAdmin')}
                            </Button>
                          ) : user.email !== 'admin@smartledger.rw' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => roleMutation.mutate({ id: user.id, role: 'user' })}
                            >
                              {t('admin.makeUser')}
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.meta && (
                  <div className="px-4 pb-4">
                    <Pagination page={users.meta.page} totalPages={users.meta.totalPages} onPageChange={setUserPage} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}

      {tab === 'businesses' && (
        <>
          {bizLoading && <LoadingSkeleton rows={6} />}
          {businesses?.data.length ? (
            <Card className="glass-card border-0">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">{t('onboarding.businessName')}</th>
                      <th className="text-left p-4 font-medium">{t('passport.title')}</th>
                      <th className="text-left p-4 font-medium">{t('admin.owner')}</th>
                      <th className="text-right p-4 font-medium">{t('dashboard.healthScore')}</th>
                      <th className="text-left p-4 font-medium">{t('dashboard.creditReadiness')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.data.map((biz) => (
                      <tr key={biz.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-medium">{biz.name}</td>
                        <td className="p-4 font-mono text-xs">{biz.passportId}</td>
                        <td className="p-4">{biz.owner.fullName}</td>
                        <td className="p-4 text-right font-medium">{biz.healthScore}</td>
                        <td className="p-4">
                          <Badge variant="secondary">{biz.creditReadinessLabel}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {businesses.meta && (
                  <div className="px-4 pb-4">
                    <Pagination page={businesses.meta.page} totalPages={businesses.meta.totalPages} onPageChange={setBizPage} />
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
