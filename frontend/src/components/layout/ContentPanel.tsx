import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentPanelProps {
  children: ReactNode;
  className?: string;
  /** Optional header slot rendered above content with divider */
  header?: ReactNode;
  noPadding?: boolean;
}

/** Premium glass content panel for module pages. */
export function ContentPanel({ children, className, header, noPadding }: ContentPanelProps) {
  return (
    <div className={cn('glass-card rounded-2xl overflow-hidden', className)}>
      {header && (
        <div className="px-unit-md py-unit-md border-b border-outline-variant bg-white/50 flex items-center justify-between gap-4">
          {header}
        </div>
      )}
      <div className={cn(!noPadding && 'p-unit-md')}>{children}</div>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

/** Pill filter chip used on list pages. */
export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full font-label-sm transition-all active:scale-[0.98]',
        active
          ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md'
          : 'bg-white border border-outline-variant text-primary hover:bg-surface-container-low',
      )}
    >
      {children}
    </button>
  );
}
