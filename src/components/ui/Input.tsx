import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {label}
            {props.required && <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground',
            error ? 'border-error' : 'border-border',
            className
          )}
          style={{ backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
          {...props}
        />
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
