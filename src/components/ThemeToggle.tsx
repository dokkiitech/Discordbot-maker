'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showOptions, setShowOptions] = useState(false);

  const themeOptions = [
    { value: 'light' as const, label: 'ライト', icon: Sun },
    { value: 'dark' as const, label: 'ダーク', icon: Moon },
    { value: 'system' as const, label: 'システム', icon: Monitor },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
        style={{ color: 'var(--foreground)' }}
        title="テーマを選択"
        aria-label="テーマを選択"
      >
        {theme === 'light' ? (
          <Sun size={20} />
        ) : theme === 'dark' ? (
          <Moon size={20} />
        ) : (
          <Monitor size={20} />
        )}
      </button>

      {showOptions && (
        <div
          className="absolute right-0 mt-2 rounded-lg shadow-lg py-1 z-50"
          style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--border)' }}
        >
          {themeOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setShowOptions(false);
              }}
              className="p-2 rounded transition-colors hover:bg-opacity-10"
              style={{
                color: theme === value ? 'var(--primary)' : 'var(--foreground)',
                opacity: theme === value ? 1 : 0.7,
              }}
              title={value === 'light' ? 'ライト' : value === 'dark' ? 'ダーク' : 'システム'}
              aria-label={value === 'light' ? 'ライトモード' : value === 'dark' ? 'ダークモード' : 'システム設定に従う'}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
