import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { settingsApi } from '@/features/settings/api/settings.api';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface LanguageToggleProps {
  variant?: 'auth' | 'sidebar';
}

/**
 * EN / KIN language switcher — Stitch pill style (I18N-02, I18N-03).
 */
export function LanguageToggle({ variant = 'sidebar' }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const current = i18n.language === 'rw' ? 'rw' : 'en';

  const toggle = async () => {
    const next = current === 'en' ? 'rw' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('smartledger-language', next);
    if (isAuthenticated) {
      try {
        await settingsApi.updateLanguage(next);
      } catch {
        // best-effort sync
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('language.toggle')}
      className={cn(
        'inline-flex items-center gap-unit-xs px-unit-md py-unit-sm rounded-full font-label-sm transition-all',
        variant === 'auth'
          ? 'bg-white/10 border border-white/20 hover:bg-white/20 text-on-primary'
          : 'bg-primary-fixed-dim/10 border border-white/10 hover:bg-primary-fixed-dim/20 text-on-primary',
      )}
    >
      <MaterialIcon name="language" className="text-[18px]" />
      <span className={current === 'en' ? 'text-secondary-fixed font-bold' : 'text-on-primary/40'}>
        EN
      </span>
      <span className="text-white/40">/</span>
      <span className={current === 'rw' ? 'text-secondary-fixed font-bold' : 'text-on-primary/40'}>
        KIN
      </span>
    </button>
  );
}
