import { X, Menu, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS, ROUTES } from '@/lib/constants';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { LanguageToggle } from './LanguageToggle';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';

/**
 * Mobile-only top bar.
 */
export function MobileHeader() {
  const { t } = useTranslation();
  const { setMobileNavOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md px-4 md:hidden">
      <button
        type="button"
        className="p-2 rounded-lg hover:bg-surface-container-low text-primary"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
          <MaterialIcon name="account_balance_wallet" className="text-on-secondary-container text-lg" />
        </div>
        <span className="font-display font-bold text-primary">{t('app.name')}</span>
      </div>
    </header>
  );
}

/**
 * Hamburger overlay sidebar for mobile (NAV-02).
 */
export function MobileNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // proceed
    }
    logout();
    toast({ title: t('auth.logoutSuccess') });
    navigate(ROUTES.LOGIN);
  };

  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-primary/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-primary text-on-primary md:hidden flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-unit-md border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                  <MaterialIcon name="account_balance_wallet" className="text-on-secondary-container" />
                </div>
                <span className="font-display font-bold text-secondary-fixed">{t('app.name')}</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-unit-md space-y-1 px-unit-sm custom-scrollbar">
              {NAV_ITEMS.map(({ key, path, materialIcon }) => (
                <NavLink
                  key={key}
                  to={path}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg font-label-sm transition-all',
                      isActive ? 'nav-item-active' : 'nav-item-idle',
                    )
                  }
                >
                  <MaterialIcon name={materialIcon} />
                  <span>{t(`nav.${key}`)}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-unit-md border-t border-white/10 space-y-unit-sm">
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate(ROUTES.TRANSACTIONS);
                }}
                className="w-full py-3 bg-secondary-fixed text-on-secondary-fixed font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <MaterialIcon name="add_circle" />
                {t('dashboard.actions.recordSale')}
              </button>
              <div className="flex items-center justify-between">
                <LanguageToggle variant="auth" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 text-on-primary/70 hover:text-error"
                  aria-label={t('nav.logout')}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/** @deprecated Use MobileHeader — kept for backwards compatibility */
export const Header = MobileHeader;
