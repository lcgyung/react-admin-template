# 하네스 엔지니어링 체크리스트 — React + MUI (Admin/Web)

> 프론트엔드(관리자/웹) 프로젝트 단독 셋업 기준. 공통 기반 + MUI 특화 항목을 모두 포함합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택

---

## 1. 컨텍스트 레이어

- [ ] 🔴 `CLAUDE.md` (또는 `AGENTS.md`) — 빌드·테스트·실행 명령, 컴포넌트 컨벤션, "하지 말 것"
- [ ] 🔴 `README` + 화면/라우팅 구조 개요
- [ ] 🟡 `docs/adr/` — 상태관리·라우팅 등 주요 결정 기록
- [ ] 🟡 컴포넌트 디렉터리 규칙 (feature 단위 / atomic 등 명시)

## 2. 빌드 & 피드백 루프

- [ ] 🔴 Vite (+ SWC)
- [ ] 🔴 ESLint + Prettier
- [ ] 🔴 `tsconfig` `strict: true`
- [ ] 🔴 단일 명령으로 `lint` / `typecheck` / `test` / `build`
- [ ] 🔴 Vitest + React Testing Library
- [ ] 🔴 MSW — API 모킹 (백엔드 없이 개발·테스트)
- [ ] 🟡 E2E (Playwright)
- [ ] 🟡 watch 모드 (HMR + test watch)
- [ ] 🟢 번들 분석 (rollup-plugin-visualizer)

## 3. 디자인 시스템 (MUI)

- [ ] 🔴 MUI 테마 토큰 중앙화 (`theme.ts`) — 색상/스페이싱/타이포 단일 소스
- [ ] 🔴 색상·치수 하드코딩 금지 (lint rule 또는 리뷰 규칙)
- [ ] 🟡 Storybook — MUI 테마 적용된 컴포넌트 카탈로그
- [ ] 🟡 다크모드 / 테마 스위칭 전략
- [ ] 🟢 디자인 토큰을 백엔드/디자인 도구와 동기화

## 4. 코드 품질 / 데이터 흐름

- [ ] 🔴 API 타입/클라이언트 자동 생성 소비 (orval) — 수동 fetch 타이핑 금지
- [ ] 🔴 폼: react-hook-form + zod
- [ ] 🔴 서버 상태 관리 (TanStack Query 등) — 캐싱·로딩·에러 표준화
- [ ] 🟡 라우팅 + 코드 스플리팅 (lazy import)
- [ ] 🟡 에러 바운더리 + 폴백 UI

## 5. 접근성

- [ ] 🟡 `eslint-plugin-jsx-a11y`
- [ ] 🟡 Storybook a11y addon
- [ ] 🟢 키보드 내비게이션 / 포커스 관리 점검

## 6. 환경 / 보안

- [ ] 🔴 `.env.example` + 빌드타임 환경변수 검증
- [ ] 🔴 `.nvmrc` / Volta — Node 버전 고정 + lockfile 커밋
- [ ] 🔴 시크릿 스캔 (gitleaks) — 프론트는 노출 시크릿 특히 주의
- [ ] 🟡 의존성 취약점 스캔 + 업데이트 봇 (Renovate / Dependabot)

## 7. CI/CD 게이트

- [ ] 🔴 husky + lint-staged
- [ ] 🔴 PR 검증 워크플로 — lint · typecheck · test · build
- [ ] 🟡 commitlint + Conventional Commits
- [ ] 🟢 프리뷰 배포 (PR별 미리보기)

## 8. 관찰가능성

- [ ] 🟡 에러 트래킹 (Sentry) — source map 업로드 포함
- [ ] 🟢 웹 바이탈 / 성능 모니터링

---

## 권장 셋업 순서

1. 컨텍스트(CLAUDE.md) + Vite + lint/tsconfig + 단일 명령
2. MUI 테마 토큰 중앙화
3. API 타입 자동 생성(orval) + TanStack Query + react-hook-form
4. Vitest/RTL + MSW
5. CI 게이트 + 보안 스캔
6. Storybook·접근성 + 에러 트래킹
