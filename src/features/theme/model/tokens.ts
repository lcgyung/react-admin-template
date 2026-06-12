import type { ThemeOptions } from '@mui/material';

import type { ThemeMode } from './themeStore';

/**
 * 디자인 토큰 단일 소스 — 색·간격·타이포·모서리.
 *
 * 앱(ThemeProvider)과 Storybook(preview)이 `createAppTheme` 팩토리를 통해 이 토큰을 공유한다.
 * 하드코딩 `#hex` 는 단일 소스인 이 파일에서만 허용한다(eslint `no-restricted-syntax` override).
 * 컴포넌트에서는 색을 직접 쓰지 말고 `theme.palette`/`sx` 토큰을 참조한다.
 */

export const shape = { borderRadius: 8 } as const;

/** MUI spacing 기본 단위(px). theme.spacing(1) === 8px. */
export const spacingUnit = 8;

export const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Pretendard',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: { fontSize: '2rem', fontWeight: 700 },
  h2: { fontSize: '1.5rem', fontWeight: 700 },
  h3: { fontSize: '1.25rem', fontWeight: 600 },
  button: { textTransform: 'none', fontWeight: 600 },
};

// 브랜드 액센트 — 라이트/다크 공통.
const brand = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  error: '#dc2626',
  warning: '#d97706',
  info: '#0891b2',
  success: '#16a34a',
} as const;

// 모드별 표면(surface) 색.
const surfaces = {
  light: { default: '#f7f8fa', paper: '#ffffff' },
  dark: { default: '#0f1115', paper: '#161a21' },
} as const;

export const palette = (mode: ThemeMode): ThemeOptions['palette'] => ({
  mode,
  primary: { main: brand.primary },
  secondary: { main: brand.secondary },
  error: { main: brand.error },
  warning: { main: brand.warning },
  info: { main: brand.info },
  success: { main: brand.success },
  background: surfaces[mode],
});
