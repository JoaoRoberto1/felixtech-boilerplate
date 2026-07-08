import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'info' | 'error' | 'success';

const variantClasses: Record<Variant, string> = {
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-green-50 text-green-800 border-green-200',
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Alert({ variant = 'info', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-md border px-4 py-3 text-sm', variantClasses[variant], className)}
      {...props}
    />
  );
}
