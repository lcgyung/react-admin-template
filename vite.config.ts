import react from '@vitejs/plugin-react-swc';
import path from 'node:path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vitest/config';

// 보안 헤더(문서 응답). 호스팅 정본은 nginx.conf 이며, 여기 값은 로컬 dev/preview 용이다.
// CSP 는 여기서 적용하지 않는다 — 로컬 목 데모는 교차출처 http(VITE_API_BASE_URL=localhost:3000)·무TLS 라
// 프로덕션 전용 CSP(connect-src 'self'·upgrade-insecure-requests)와 충돌한다(ADR 0007). CSP 정본은
// nginx.conf(프로덕션)에만 둔다.
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 번들 분석 — `pnpm build:analyze`(ANALYZE=true) 일 때만 dist/stats.html 생성(gitignore).
    // 일반 build/dev/test 에서는 비활성(매 빌드 산출물 오염 방지).
    process.env.ANALYZE === 'true' &&
      visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
  // dev/preview 서버: CSP 없이 공통 보안 헤더만 적용(CSP 정본은 nginx.conf).
  server: { headers: SECURITY_HEADERS },
  preview: { headers: SECURITY_HEADERS },
  // 프로덕션 번들에서 console/debugger 제거 — 정보 노출·디버그 흔적 차단.
  // vite8 기본 트랜스포머(oxc)는 esbuild 의 `drop` 을 지원하지 않으므로, build 시 terser 미니파이어로
  // drop_console/drop_debugger 를 적용한다. minify 는 build 에서만 동작하므로 dev/test 는 console 유지.
  build: {
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
  },
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
    // MUI 9 의 ESM 산출물(@mui/material/internal/Transition.mjs)이 확장자 없는 서브패스
    // `react-transition-group/TransitionGroupContext` 를 import 하는데, vitest 의 node ESM 리졸버는
    // 이를 디렉터리 import 로 보고 실패한다. 두 패키지를 inline 해 vite 리졸버로 변환·해석한다.
    server: { deps: { inline: ['@mui/material', 'react-transition-group'] } },
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
      // ratchet floor — vitest4 의 coverage-v8 는 AST-aware 카운팅으로 측정 방식이 바뀌어 베이스라인이
      // 재보정됨(stmts 36.03·lines 37.83·branch 40.5·funcs 25.77). 같은 테스트·파일셋이지만 stmts/lines 는
      // 상향, funcs/branches 는 더 엄격해져 하락(품질 저하 아닌 측정 변경). 실측 바로 아래로 고정해 회귀를 막고 PR마다 상향.
      thresholds: {
        lines: 36,
        statements: 35,
        functions: 24,
        branches: 39,
      },
    },
  },
});
