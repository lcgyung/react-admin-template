import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

import { createAppTheme } from '../model/createAppTheme';
import { useThemeStore } from '../model/themeStore';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useThemeStore((s) => s.mode);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
