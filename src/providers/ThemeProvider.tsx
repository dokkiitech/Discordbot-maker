'use client';

import { ReactNode } from 'react';

/**
 * Light mode only theme provider
 * All colors are defined in CSS variables in globals.css
 * No dynamic theme switching - always uses light mode with Apple HIG colors
 */

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Theme provider is kept for compatibility but no longer does anything
  // All styling is now purely CSS variable based with light mode only
  return <>{children}</>;
}
