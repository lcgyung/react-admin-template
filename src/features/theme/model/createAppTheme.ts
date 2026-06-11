import { createTheme, type Theme } from '@mui/material';

import type { ThemeMode } from './themeStore';
import { palette, shape, spacingUnit, typography } from './tokens';

/**
 * 디자인 토큰으로 MUI 테마를 생성하는 단일 팩토리.
 *
 * 앱(ThemeProvider)과 Storybook(preview)이 동일 토큰 소스를 공유하도록 진입점을 하나로 둔다.
 */
export const createAppTheme = (mode: ThemeMode): Theme =>
  createTheme({
    palette: palette(mode),
    typography,
    shape,
    spacing: spacingUnit,
  });
