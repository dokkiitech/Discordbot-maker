import React from 'react';
import { cn } from '@/lib/utils';

interface BooleanToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  labels?: {
    on: string;
    off: string;
  };
  disabled?: boolean;
  name?: string;
}

/**
 * Apple HIG準拠のスイッチ型トグルコンポーネント
 * シンプルなboolean値のON/OFF切り替えに最適
 */
export function BooleanToggle({
  enabled,
  onChange,
  labels = { on: 'ON', off: 'OFF' },
  disabled = false,
  name,
}: BooleanToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${labels.on}/${labels.off}`}
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        name={name}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full',
          'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer flex-shrink-0',
          enabled
            ? 'bg-primary focus:ring-primary'
            : 'bg-muted focus:ring-muted'
        )}
      >
        {/* Slider circle */}
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md',
            'transition-transform duration-300',
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>

      {/* Labels */}
      <span
        className={cn(
          'text-base font-semibold transition-colors duration-300',
          enabled ? 'text-foreground' : 'text-muted'
        )}
      >
        {enabled ? labels.on : labels.off}
      </span>
    </div>
  );
}
