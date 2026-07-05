import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/data-display/PageHeader';
import { EmptyState } from '@/components/data-display/EmptyState';

interface ModulePageShellProps {
  pageKey: keyof typeof PAGE_KEYS;
  children?: ReactNode;
}

const PAGE_KEYS = {
  dashboard: 'pages.dashboard',
  transactions: 'pages.transactions',
  customers: 'pages.customers',
  suppliers: 'pages.suppliers',
  debts: 'pages.debts',
  documents: 'pages.documents',
  inventory: 'pages.inventory',
  analytics: 'pages.analytics',
  history: 'pages.history',
  passport: 'pages.passport',
  assistant: 'pages.assistant',
  settings: 'pages.settings',
  profile: 'pages.profile',
  admin: 'pages.admin',
  onboarding: 'pages.onboarding',
} as const;

/**
 * Shared page shell for feature modules — header + content area.
 */
export function ModulePageShell({ pageKey, children }: ModulePageShellProps) {
  const { t } = useTranslation();
  const title = t(PAGE_KEYS[pageKey]);

  return (
    <div>
      <PageHeader title={title} />
      {children ?? <EmptyState />}
    </div>
  );
}
