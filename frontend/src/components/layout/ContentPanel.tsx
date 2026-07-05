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
        <div className="px-unit-md py-unit-md border-b border-[#1E1E1E] bg-[#111111] flex items-center justify-between gap-4">
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
          ? 'bg-[#BFFF00] text-black font-bold shadow-[0_10px_24px_rgba(0,0,0,0.4)]'
          : 'bg-[#111111] border border-[#1E1E1E] text-[#A0A0A0] hover:text-[#CCFF00] hover:border-[#BFFF00]/50',
      )}
    >
      {children}
    </button>
  );
}
