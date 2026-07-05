import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'h-11 rounded-lg border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-white placeholder:text-[#A0A0A0] focus-visible:outline-none focus-visible:border-[#BFFF00] focus-visible:ring-2 focus-visible:ring-[#BFFF00]/20',
        auth: 'h-12 rounded-xl border border-[#1E1E1E] bg-[#111111] px-10 py-unit-md text-white placeholder:text-[#A0A0A0]/60 focus-visible:outline-none focus-visible:border-[#BFFF00] focus-visible:ring-2 focus-visible:ring-[#BFFF00]/20',
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
