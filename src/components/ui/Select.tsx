import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
            {label}
            {props.required && <span className="ml-1" style={{ color: 'var(--error)' }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 text-foreground',
            error ? 'border-error' : 'border-border',
            className
          )}
          style={{ backgroundColor: 'var(--card-background)', color: 'var(--foreground)' }}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
