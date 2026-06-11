import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    css: false,
    passWithNoTests: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // 측정 대상에서 제외: 진입점·배럴·목 데이터·스토리·타입 선언(로직 없음).
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/index.ts',
        'src/app/mocks/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
      ],
      // ratchet floor — 실측 베이스라인(stmts/lines 23.06·branch 57.44·funcs 47.82) 바로 아래로
      // 고정해 회귀를 막고, PR마다 점진 상향한다. 미달 시 vitest 가 non-zero 로 종료 → CI 실패.
      thresholds: {
        lines: 22,
        statements: 22,
        functions: 45,
        branches: 55,
      },
    },
  },
});
