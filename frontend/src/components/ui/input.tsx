import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-11 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-secondary-fixed/30',
        auth: 'h-12 border-0 border-b-2 border-white/20 bg-primary/40 rounded-none px-10 py-unit-md text-on-primary placeholder:text-white/30 focus-visible:outline-none focus-visible:border-secondary-fixed focus-visible:ring-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => (
    <input type={type} className={cn(inputVariants({ variant, className }))} ref={ref} {...props} />
  ),
);
Input.displayName = 'Input';

export { Input, inputVariants };
