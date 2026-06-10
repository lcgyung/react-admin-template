import type { ReactNode } from 'react';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '@/features/theme';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <QueryProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </QueryProvider>
);
