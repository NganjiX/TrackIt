import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-on-primary hover:bg-primary-container shadow-md',
        destructive: 'bg-error text-on-error hover:bg-error/90',
        outline:
          'border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-on-primary',
        secondary: 'bg-[#111111] border border-[#1E1E1E] text-white hover:border-[#BFFF00]/50',
        ghost: 'hover:bg-[#111111] text-[#A0A0A0] hover:text-[#CCFF00]',
        link: 'text-secondary underline-offset-4 hover:underline font-semibold',
        gold: 'bg-[#BFFF00] text-black hover:bg-[#CCFF00] shadow-[0_12px_28px_rgba(0,0,0,0.4)]',
        pill: 'bg-[#BFFF00] text-black rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.4)] hover:bg-[#CCFF00]',
        'pill-outline': 'border border-[#1E1E1E] bg-[#0D0D0D] text-white rounded-full hover:border-[#BFFF00]/60',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-9 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);
Button.displayName = 'Button';

export { Button, buttonVariants };
