# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식과 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [0.1.0] - 2026-06-12

### Added

- React + TypeScript + Vite 기반 관리자 템플릿 최초 구성
- 인증(로그인/로그아웃·토큰 저장·보호 라우트)과 RBAC 메뉴·라우트 접근 제어 (`admin` / `manager` / `user`)
- Axios API Layer(인터셉터로 토큰 주입·401 처리) + React Query 서버 상태 관리
- Zustand 전역 상태 관리(persist), React Hook Form + Zod 폼 검증
- MUI 테마 다크 모드(persist), MSW 목 API(백엔드 없이 즉시 동작)
- Feature-Sliced Design 6레이어 구조 + Steiger(`pnpm lint:fsd`) 아키텍처 강제
- Vitest + Testing Library, ESLint / Prettier / Husky / Lint-Staged
- Storybook, Docker(nginx), GitHub Actions CI
- Claude Code 자동화 훅(session / guard / format / gate) + code-review 스킬
- orval 기반 API 타입 자동 생성(openapi 스펙 → `shared/api/generated`)
- 관찰가능성: Sentry(DSN 시 동적 로드)·Web Vitals env-gated 스텁 + 루트 ErrorBoundary
- E2E(Playwright) + Lighthouse CI(접근성·SEO·모범사례 0.9 게이트)
- FSD 구현 컨벤션 하네스: 구조 ESLint 룰 + 슬라이스 제너레이터(plop) + 골격 문서
- path-scoped `.claude/rules/` 5종, ADR 0001~0007

### Changed

- Node 런타임 24로 통일(engines·`.nvmrc`·Dockerfile·CI)
- 문서 정비: CLAUDE.md 코어화 + 규칙 인덱스, README 최신화
- ESLint 10 업그레이드 — react 버전 탐지 고정으로 major 업그레이드 차단 해소 (#38)
- Storybook 8 → 10 마이그레이션 — 유령 addon 제거·renderer import 교체 (#39)
- `@hookform/resolvers`(react-hook-form major 그룹) 업데이트 (#35)
- `@types/node` 22 → 25 업데이트 (#36)
- GitHub Actions 그룹 의존성 업데이트 (#32)

### Security

- 보안 하네스 보강: CSP/보안 헤더(`nginx.conf` 정본), gitleaks, SCA(pnpm audit + osv), 빌드 산출물 시크릿 스캔

### Removed

- Vercel 배포 타깃 제거(CSP 정본을 `nginx.conf`로 단일화)
- 완료된 하네스 체크리스트 문서 제거

### Notes

- 초기 버전으로 구조/API가 변경될 수 있음
