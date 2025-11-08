'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// CSS variables for each theme
const LIGHT_THEME_VARS = {
  '--background': '#ffffff',
  '--foreground': '#171717',
  '--muted': '#737373',
  '--primary': '#0066cc',
  '--secondary': '#6c757d',
  '--success': '#198754',
  '--error': '#dc3545',
  '--warning': '#ffc107',
  '--info': '#0dcaf0',
  '--border': '#e5e7eb',
  '--card-background': '#ffffff',
};

const DARK_THEME_VARS = {
  '--background': '#1F1F21',
  '--foreground': '#BFC1C4',
  '--muted': '#8B8D91',
  '--primary': '#669DF1',
  '--secondary': '#738496',
  '--success': '#B3DF72',
  '--error': '#F87168',
  '--warning': '#FBC828',
  '--info': '#579DFF',
  '--border': '#383C42',
  '--card-background': '#242528',
};

const applyThemeVariables = (isDark: boolean) => {
  const vars = isDark ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const root = document.documentElement;

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(
    'light'
  );
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = storedTheme || 'system';
    setThemeState(initialTheme);

    // Apply initial theme
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, mounted]);

  const applyTheme = (selectedTheme: Theme) => {
    const isDark =
      selectedTheme === 'dark' ||
      (selectedTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Apply theme variables
    applyThemeVariables(isDark);

    // Apply dark class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Update state
    setEffectiveTheme(isDark ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
