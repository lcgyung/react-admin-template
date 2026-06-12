import type { ReactNode } from 'react';

import { ThemeProvider } from '@/features/theme';
import { reportError } from '@/shared/lib/observability';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import { QueryProvider } from './QueryProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary onError={reportError}>
    <QueryProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryProvider>
  </ErrorBoundary>
);
