# 하네스 엔지니어링 체크리스트 — React + MUI (Admin/Web)

> 프론트엔드(관리자/웹) 프로젝트 단독 셋업 기준. 공통 기반 + MUI 특화 항목을 모두 포함합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택

**구현 상태 범례:** `[x]` 구현됨 · `[ ]` 미구현/선택 · 항목 뒤 `— …` 는 구현 위치 또는 책임 주체.
적용된 주요 결정은 [`docs/adr/`](adr/)에, 보안 점검표는
[`secure-harness-react-mui.md`](secure-harness-react-mui.md)에 기록되어 있습니다.

---

## 1. 컨텍스트 레이어

- [x] 🔴 `CLAUDE.md` (또는 `AGENTS.md`) — 빌드·테스트·실행 명령, 컴포넌트 컨벤션, "하지 말 것" — `CLAUDE.md`(코어) + `.claude/rules/`(path-scoped 주제별 규칙 — 매칭 파일 작업 시 자동 로드, 구버전 Claude Code 는 수동 참조) + `.claude/` 훅·에이전트·스킬
- [x] 🔴 `README` + 화면/라우팅 구조 개요 — `README.md`
- [x] 🟡 `docs/adr/` — 상태관리·라우팅 등 주요 결정 기록 — ADR 0001~0007 (상태관리·FSD·orval·토큰 저장·관찰가능성·CSP)
- [x] 🟡 컴포넌트 디렉터리 규칙 (feature 단위 / atomic 등 명시) — FSD 6레이어, `steiger.config.ts` + `pnpm lint:fsd` 하드 강제

## 2. 빌드 & 피드백 루프

- [x] 🔴 Vite (+ SWC) — `vite.config.ts` (`@vitejs/plugin-react-swc`)
- [x] 🔴 ESLint + Prettier — `eslint.config.js` · `pnpm lint` / `pnpm format`
- [x] 🔴 `tsconfig` `strict: true` — `strict` + `noUnusedLocals/Parameters`
- [x] 🔴 단일 명령으로 `lint` / `typecheck` / `test` / `build` — `package.json` scripts
- [x] 🔴 Vitest + React Testing Library — `vite.config.ts` test 블록(jsdom·coverage ratchet) · `vitest.setup.ts`
- [x] 🔴 MSW — API 모킹 (백엔드 없이 개발·테스트) — `src/app/mocks/` (handlers·server·browser·data)
- [x] 🟡 E2E (Playwright) — `playwright.config.ts` · `e2e/` · `ci.yml` `e2e` job
- [x] 🟡 Lighthouse CI — 접근성·SEO·모범사례 점수 임계값 게이트 (a11y/best-practices/seo 0.9, performance warn) — `lighthouserc.json` · `ci.yml` `lighthouse` job
- [x] 🟡 watch 모드 (HMR + test watch) — `pnpm dev` · `pnpm test:watch`
- [x] 🟢 번들 분석 (rollup-plugin-visualizer, `pnpm build:analyze`) — `vite.config.ts` (`ANALYZE=true` 시 `dist/stats.html`)

## 3. 디자인 시스템 (MUI)

- [x] 🔴 MUI 테마 토큰 중앙화 (`theme.ts`) — 색상/스페이싱/타이포 단일 소스 — `src/features/theme/model/tokens.ts` + `createAppTheme`
- [x] 🔴 색상·치수 하드코딩 금지 (lint rule 또는 리뷰 규칙) — `eslint.config.js` `no-restricted-syntax` #hex error (tokens.ts·스토리 예외)
- [x] 🟡 Storybook — MUI 테마 적용된 컴포넌트 카탈로그 — `.storybook/` (preview ThemeProvider 데코레이터)
- [x] 🟡 다크모드 / 테마 스위칭 전략 — `features/theme` themeStore(persist) + ThemeProvider
- [ ] 🟢 디자인 토큰을 백엔드/디자인 도구와 동기화 — 미도입(선택). 템플릿 단독 셋업에선 해당 없음, 디자인 도구 연동 시 후속

## 4. 코드 품질 / 데이터 흐름

- [x] 🔴 API 타입/클라이언트 자동 생성 소비 (orval) — 수동 fetch 타이핑 금지 — `orval.config.ts` · `pnpm gen:api` · `shared/api/generated` (ADR 0004)
- [x] 🔴 폼: react-hook-form + zod — `features/auth/model/loginSchema.ts` · `features/users/model/userFormSchema.ts`
- [x] 🔴 서버 상태 관리 (TanStack Query 등) — 캐싱·로딩·에러 표준화 — `useAuth`/`useUsers` + queryKey 상수 객체(lint 강제)
- [x] 🟡 라우팅 + 코드 스플리팅 (lazy import) — `src/app/router/router.tsx` `lazy()`
- [x] 🟡 에러 바운더리 + 폴백 UI — `shared/ui/ErrorBoundary` + AppProviders

## 5. 접근성

- [x] 🟡 `eslint-plugin-jsx-a11y` — `eslint.config.js` recommended error
- [x] 🟡 Storybook a11y addon — `@storybook/addon-a11y`
- [ ] 🟢 키보드 내비게이션 / 포커스 관리 점검 — 부분: jsx-a11y 정적 검사 + Lighthouse a11y 0.9 게이트로 커버, 수동/E2E 키보드 시나리오 점검은 후속

## 6. 환경 / 보안

- [x] 🔴 `.env.example` + 빌드타임 환경변수 검증 — `.env.example` · `src/shared/config/env.ts` (zod, 부팅 시 throw)
- [x] 🔴 `.nvmrc` / Volta — Node 버전 고정 + lockfile 커밋 — `.nvmrc`(24) · `engines` · `pnpm-lock.yaml`
- [x] 🔴 시크릿 스캔 (gitleaks) — 프론트는 노출 시크릿 특히 주의 — `.husky/pre-commit` + `ci.yml` (+ 빌드 산출물 grep)
- [x] 🟡 의존성 취약점 스캔 + 업데이트 봇 (Renovate / Dependabot) — `pnpm audit`(high 차단) + osv-scanner · `.github/dependabot.yml`

## 7. CI/CD 게이트

- [x] 🔴 husky + lint-staged — `.husky/` · `package.json` lint-staged
- [x] 🔴 PR 검증 워크플로 — lint · typecheck · test · build — `ci.yml` `build` job (+ lint:fsd·산출물 시크릿 스캔)
- [x] 🟡 commitlint + Conventional Commits — `package.json` `commitlint` 키 · `.husky/commit-msg`
- [ ] 🟢 프리뷰 배포 (PR별 미리보기) — 미적용(Vercel 타깃 제거, 2026-06-11). 필요 시 호스팅 연결 후 SPA rewrite + 보안 헤더(`nginx.conf` 참고)를 해당 호스팅 설정에 구성

## 8. 관찰가능성

- [ ] 🟡 에러 트래킹 (Sentry) — source map 업로드 포함 — 부분: `shared/lib/observability/sentry.ts`(DSN 시 동적 로드·PII 스크러빙) O, 소스맵 업로드는 통합자 몫(SENTRY_AUTH_TOKEN)
- [x] 🟢 웹 바이탈 / 성능 모니터링 — `shared/lib/observability/web-vitals.ts` (ADR 0006)

---

## 권장 셋업 순서

1. 컨텍스트(CLAUDE.md) + Vite + lint/tsconfig + 단일 명령
2. MUI 테마 토큰 중앙화
3. API 타입 자동 생성(orval) + TanStack Query + react-hook-form
4. Vitest/RTL + MSW
5. CI 게이트 + 보안 스캔
6. Storybook·접근성 + 에러 트래킹
