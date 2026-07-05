import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

interface QuickActionsProps {
  actions?: DashboardSummary['quickActions'];
}

const ACTION_CONFIG = {
  record_sale: { icon: 'sell', route: ROUTES.TRANSACTIONS, labelKey: 'dashboard.actions.recordSale' },
  upload_receipt: { icon: 'upload_file', route: ROUTES.DOCUMENTS, labelKey: 'dashboard.actions.uploadReceipt' },
  view_passport: { icon: 'badge', route: ROUTES.PASSPORT, labelKey: 'dashboard.actions.viewPassport' },
  track_debt: { icon: 'money_off', route: ROUTES.DEBTS, labelKey: 'dashboard.actions.trackDebt' },
} as const;

/**
 * Quick action shortcuts sidebar card (DASH-05).
 */
export function QuickActions({ actions }: QuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const items = actions ?? (Object.keys(ACTION_CONFIG) as Array<keyof typeof ACTION_CONFIG>);

  return (
    <div className="glass-card p-unit-md rounded-2xl h-full">
      <h4 className="font-label-sm text-[#A0A0A0] mb-4 uppercase tracking-wider">{t('dashboard.quickActions')}</h4>
      <div className="grid grid-cols-2 gap-2">
        {items.map((action) => {
          const config = ACTION_CONFIG[action];
          if (!config) return null;
          return (
            <button
              key={action}
              type="button"
              onClick={() => navigate(config.route)}
              className="p-4 bg-[#111111] border border-[#1E1E1E] rounded-xl flex flex-col items-center gap-2 hover:border-[#BFFF00]/60 hover:text-[#BFFF00] transition-all group"
            >
              <MaterialIcon name={config.icon} className="text-[#BFFF00] group-hover:text-[#CCFF00]" />
              <span className="text-xs font-bold text-center leading-tight text-white">{t(config.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
