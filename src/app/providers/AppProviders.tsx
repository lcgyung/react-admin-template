import type { ReactNode } from 'react';

import { ThemeProvider } from '@/features/theme';

import { QueryProvider } from './QueryProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </QueryProvider>
);
