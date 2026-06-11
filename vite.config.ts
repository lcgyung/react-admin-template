import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

// 보안 헤더(문서 응답). 호스팅 정본은 nginx.conf·vercel.json 이며, 여기 값은 로컬 dev/preview 용이다.
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
// 실용 베이스라인 CSP — style-src 'unsafe-inline' 은 emotion 런타임 스타일 대응(ADR 0007).
// connect-src 는 통합 시 실제 API origin 으로 확장한다.
const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // 번들 분석 — `pnpm build:analyze`(ANALYZE=true) 일 때만 dist/stats.html 생성(gitignore).
    // 일반 build/dev/test 에서는 비활성(매 빌드 산출물 오염 방지).
    process.env.ANALYZE === 'true' &&
      visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
  // dev 서버: CSP 는 HMR(websocket·eval)과 충돌하므로 제외하고 나머지 보안 헤더만 적용.
  server: { headers: SECURITY_HEADERS },
  // preview(빌드 산출물): 프로덕션과 동일하게 CSP 포함 전체 헤더 적용.
  preview: { headers: { ...SECURITY_HEADERS, 'Content-Security-Policy': CONTENT_SECURITY_POLICY } },
  // 프로덕션 번들에서 console/debugger 제거 — 정보 노출·디버그 흔적 차단(dev/test 는 유지).
  esbuild: { drop: command === 'build' ? ['console', 'debugger'] : [] },
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
