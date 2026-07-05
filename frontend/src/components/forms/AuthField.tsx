import { ReactNode } from 'react';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';

interface AuthFieldProps {
  id: string;
  label: string;
  icon: string;
  error?: FieldError;
  children?: ReactNode;
  labelExtra?: ReactNode;
}

/** Auth form field row with Material icon — Stitch dark glass style. */
export function AuthField({ id, label, icon, error, children, labelExtra }: AuthFieldProps) {
  return (
    <div className="space-y-unit-xs">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} variant="auth">
          {label}
        </Label>
        {labelExtra}
      </div>
      <div className="relative">
        <MaterialIcon
          name={icon}
          className="absolute left-unit-sm top-1/2 -translate-y-1/2 text-on-primary-container text-xl pointer-events-none z-10"
        />
        {children ?? <Input id={id} variant="auth" className="pl-10" />}
      </div>
      {error && <p className="text-xs text-error">{error.message}</p>}
    </div>
  );
}

interface AuthFieldInputProps extends React.ComponentProps<typeof Input> {
  id: string;
  label: string;
  icon: string;
  error?: FieldError;
  labelExtra?: ReactNode;
  registration?: UseFormRegisterReturn;
}

/** Convenience wrapper when using react-hook-form register spread. */
export function AuthFieldInput({
  id,
  label,
  icon,
  error,
  labelExtra,
  className,
  registration,
  ...inputProps
}: AuthFieldInputProps) {
  return (
    <AuthField id={id} label={label} icon={icon} error={error} labelExtra={labelExtra}>
      <Input
        id={id}
        variant="auth"
        className={cn('pl-10', className)}
        {...registration}
        {...inputProps}
      />
    </AuthField>
  );
}
