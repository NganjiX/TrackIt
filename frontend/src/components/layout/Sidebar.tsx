import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Moon, Sun } from 'lucide-react';
import { NAV_ITEMS, ROUTES } from '@/lib/constants';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { LanguageToggle } from './LanguageToggle';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

/**
 * Fixed desktop sidebar — Stitch FinTrack fintech design (NAV-01).
 */
export function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sidebarCollapsed, theme, setTheme } = useUiStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed with local logout
    }
    logout();
    toast({ title: t('auth.logoutSuccess') });
    navigate(ROUTES.LOGIN);
  };

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 bg-primary shadow-xl transition-all duration-300',
        sidebarCollapsed ? 'w-[72px] px-unit-xs' : 'w-64 px-unit-sm',
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center gap-3 px-3 py-unit-md mb-4', sidebarCollapsed && 'justify-center px-0')}>
        <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
          <MaterialIcon name="account_balance_wallet" className="text-on-secondary-container text-2xl" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <h1 className="font-display text-lg text-secondary-fixed leading-tight">{t('app.name')}</h1>
            <p className="font-label-sm text-[10px] text-on-primary/60 uppercase tracking-widest">
              {t('app.taglineShort')}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ key, path, materialIcon }) => (
          <NavLink
            key={key}
            to={path}
            title={sidebarCollapsed ? t(`nav.${key}`) : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm transition-all duration-200',
                isActive
                  ? 'nav-item-active translate-x-0'
                  : 'nav-item-idle hover:translate-x-1',
                sidebarCollapsed && 'justify-center px-2',
              )
            }
          >
            <MaterialIcon name={materialIcon} className="text-xl shrink-0" />
            {!sidebarCollapsed && <span>{t(`nav.${key}`)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className={cn('mt-auto space-y-unit-sm py-unit-md', sidebarCollapsed && 'px-1')}>
        {!sidebarCollapsed && (
          <button
            type="button"
            onClick={() => navigate(ROUTES.TRANSACTIONS)}
            className="w-full py-4 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-secondary-fixed-dim"
          >
            <MaterialIcon name="add_circle" />
            <span>{t('dashboard.actions.recordSale')}</span>
          </button>
        )}

        <div className={cn('flex items-center gap-2 px-2', sidebarCollapsed && 'flex-col')}>
          <LanguageToggle variant="sidebar" />
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-on-primary/70 hover:text-secondary-fixed hover:bg-primary-fixed-dim/10 transition-colors"
            aria-label={t('theme.toggle')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-on-primary/70 hover:text-error hover:bg-error/10 transition-colors"
            aria-label={t('nav.logout')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {!sidebarCollapsed && user && (
          <p className="px-3 text-xs text-on-primary-container truncate">{user.fullName}</p>
        )}
      </div>
    </aside>
  );
}
