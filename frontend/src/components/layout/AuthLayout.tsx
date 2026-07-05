import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Stitch auth layout — deep navy mesh background with glassmorphism card.
 */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-[#000000] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(191,255,0,0.12),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(191,255,0,0.08),transparent_45%)] pointer-events-none" />

      {/* Language toggle */}
      <div className="fixed top-unit-md right-unit-md z-50">
        <LanguageToggle variant="auth" />
      </div>

      <main className="flex-grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-unit-lg relative z-10">
        <div className="w-full max-w-[480px]">
          {/* Brand */}
          <div className="text-center mb-unit-lg">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-unit-xs tracking-tight">
              {t('app.name')}
            </h1>
            <p className="font-body-md text-[#A0A0A0] opacity-80">{t('app.tagline')}</p>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#0D0D0D] p-unit-lg shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
            <div className="text-center space-y-2 mb-unit-md">
              <h2 className="font-headline-md text-headline-md text-white">{title}</h2>
              {subtitle && <p className="text-sm text-[#A0A0A0]">{subtitle}</p>}
            </div>
            {children}
          </div>

          {/* Trust badges */}
          <div className="mt-unit-lg grid grid-cols-3 gap-unit-md opacity-70">
            {[
              { icon: 'security', label: 'AES-256 SECURE' },
              { icon: 'verified_user', label: 'ISO CERTIFIED' },
              { icon: 'cloud_done', label: '99.9% UPTIME' },
            ].map(({ icon, label }) => (
              <div key={icon} className="flex flex-col items-center text-center">
                <MaterialIcon name={icon} className="text-[20px] mb-unit-xs text-[#BFFF00]" />
                <span className="text-[10px] font-label-sm text-[#A0A0A0]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-unit-md text-center relative z-10">
        <p className="font-label-sm text-[#A0A0A0]/40 tracking-[0.2em] uppercase">
          {t('app.footerTrust')}
        </p>
      </footer>
    </div>
  );
}
