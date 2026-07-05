import { cn } from '@/lib/utils';

interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Google Material Symbols icon (Stitch design system). */
export function MaterialIcon({ name, className, filled }: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'material-symbols-filled', className)}
      aria-hidden
    >
      {name}
    </span>
  );
}
