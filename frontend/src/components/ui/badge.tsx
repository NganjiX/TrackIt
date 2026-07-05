import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-on-primary',
        secondary: 'border-transparent bg-surface-container text-primary',
        destructive: 'border-transparent bg-error-container text-on-error-container',
        outline: 'border-outline-variant text-primary',
        gold: 'border-transparent bg-secondary-fixed/30 text-on-secondary-fixed-variant',
        success: 'border-transparent bg-green-50 text-green-700',
        warning: 'border-transparent bg-secondary-fixed/20 text-on-secondary-container',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
