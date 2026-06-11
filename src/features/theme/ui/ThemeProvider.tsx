import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { createTheme, CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

import { useThemeStore } from '../model/themeStore';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode = useThemeStore((s) => s.mode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        shape: { borderRadius: 8 },
      }),
    [mode],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
