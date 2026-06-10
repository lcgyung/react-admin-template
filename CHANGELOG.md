# Changelog

이 프로젝트의 주요 변경 사항을 기록합니다. [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식과 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [0.1.0] - 2026-06-10

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

### Notes

- 초기 버전으로 구조/API가 변경될 수 있음
