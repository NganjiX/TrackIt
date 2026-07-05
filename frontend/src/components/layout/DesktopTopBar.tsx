import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

/**
 * Desktop top app bar aligned to Stitch reference shell.
 */
export function DesktopTopBar({ compactSidebar }: { compactSidebar: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [query, setQuery] = useState('');

  const initials = useMemo(() => {
    const name = user?.fullName?.trim();
    if (!name) return 'FT';
    const parts = name.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join('');
  }, [user?.fullName]);

  return (
    <header
      className={cn(
        'hidden md:flex h-16 items-center justify-between border-b border-[#1E1E1E]',
        'bg-[#000000]/95 backdrop-blur-xl px-gutter sticky top-0 z-30',
      )}
    >
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <MaterialIcon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] group-focus-within:text-[#CCFF00] transition-colors"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search', { defaultValue: 'Search transactions, customers, reports...' })}
            className="w-full bg-[#0D0D0D] border border-[#1E1E1E] text-white rounded-full pl-12 pr-4 py-2.5 text-sm outline-none transition-all focus:border-[#BFFF00] focus:ring-2 focus:ring-[#BFFF00]/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-unit-md ml-unit-lg">
        <button
          type="button"
          onClick={() => navigate(ROUTES.TRANSACTIONS)}
          className="bg-[#BFFF00] text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-[#CCFF00] active:scale-95 transition-all shadow-[0_12px_28px_rgba(0,0,0,0.4)] flex items-center gap-2"
        >
          <MaterialIcon name="point_of_sale" />
          <span>{t('dashboard.actions.recordSale')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(ROUTES.DOCUMENTS)}
          className="border border-[#1E1E1E] bg-[#0D0D0D] rounded-full px-5 py-2 text-sm font-bold text-white hover:border-[#BFFF00]/50 transition-colors flex items-center gap-2"
        >
          <MaterialIcon name="upload_file" />
          <span>{t('dashboard.actions.uploadReceipt')}</span>
        </button>

        <div className="h-8 w-px bg-[#1E1E1E] mx-1" />

        <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#111111] transition-colors relative">
          <MaterialIcon name="notifications" className="text-[#A0A0A0]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#BFFF00] rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-1">
          {!compactSidebar && (
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none">{user?.fullName ?? 'FinTrack User'}</p>
              <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wider">
                {user?.role === 'admin' ? 'Admin' : 'Member'}
              </p>
            </div>
          )}
          <div className="w-10 h-10 rounded-full border border-[#1E1E1E] bg-[#0D0D0D] text-[#BFFF00] text-xs font-bold flex items-center justify-center">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
