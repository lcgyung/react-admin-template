import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // 번들 분석 — build 시에만 dist/stats.html 생성(gitignore). dev/test 에서는 비활성.
    command === 'build' &&
      visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
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
    // 단위/컴포넌트 테스트는 src 한정. e2e/*.spec.ts(Playwright)는 vitest 대상에서 제외.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
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
        // 생성물·런타임 인프라(단위 테스트 비대상): orval 생성 타입, 관찰가능성 스텁, 테마 토큰/팩토리.
        'src/shared/api/generated/**',
        'src/shared/lib/observability/**',
        'src/features/theme/model/tokens.ts',
        'src/features/theme/model/createAppTheme.ts',
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
}));
