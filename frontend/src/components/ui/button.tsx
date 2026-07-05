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
        secondary: 'bg-white border border-outline-variant text-primary hover:bg-surface-container-low',
        ghost: 'hover:bg-surface-container-low text-primary',
        link: 'text-secondary underline-offset-4 hover:underline font-semibold',
        gold: 'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed shadow-lg shadow-secondary/20',
        pill: 'bg-primary text-on-primary rounded-full shadow-md hover:bg-primary-container',
        'pill-outline': 'border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-on-primary',
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
