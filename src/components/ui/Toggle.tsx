import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleOption {
  value: string;
  label: string;
  description?: string;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function Toggle({ options, value, onChange, name }: ToggleProps) {
  return (
    <div className="flex gap-3 w-full">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300',
              'border-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
              'backdrop-blur-sm',
              isSelected
                ? 'bg-primary border-primary text-white focus:ring-primary'
                : 'bg-white bg-opacity-40 border-border border-opacity-40 text-foreground hover:bg-opacity-50 hover:border-opacity-60 focus:ring-primary'
            )}
            type="button"
            name={name}
            aria-pressed={isSelected}
          >
            <div className="text-left">
              <p className="text-sm font-semibold">{option.label}</p>
              {option.description && (
                <p className={cn(
                  'text-xs mt-1',
                  isSelected ? 'text-white text-opacity-90' : 'text-muted'
                )}>
                  {option.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
