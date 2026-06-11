# React Admin Template

React + TypeScript + Vite 기반 관리자 템플릿. MUI, React Query, Zustand, React Hook Form으로 CMS·ERP·Back Office·대시보드를 빠르게 구축합니다.

## Stack

React · TypeScript · Vite (SWC) · MUI · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · MSW · orval · Vitest · Playwright · ESLint · Prettier · Husky · Storybook · Sentry/Web Vitals

## Features

- 인증 (로그인/로그아웃, 토큰 저장, 보호된 라우트)
- RBAC 기반 메뉴·라우트 접근 제어 (`admin` / `manager` / `user`)
- Axios API Layer (인터셉터로 토큰 주입 · 401 처리 · 공통 에러)
- React Query 서버 상태 관리
- Zustand 전역 상태 관리 (persist)
- React Hook Form + Zod 검증
- 다크 모드 (MUI 테마 + persist)
- MSW 목 API (백엔드 없이 즉시 동작)
- Vitest + Testing Library
- ESLint + Prettier + Husky + Lint-Staged
- Storybook · Docker (nginx) · GitHub Actions CI

## Quick Start

```bash
git clone https://github.com/<owner>/react-admin-template.git
cd react-admin-template
pnpm install
cp .env.example .env
pnpm dev
```

> 패키지 매니저는 **pnpm** 입니다.

기본값(`VITE_ENABLE_MOCK=true`)으로 MSW 목 API가 켜져 있어 백엔드 없이 바로 로그인할 수 있습니다.

**데모 계정** (비밀번호 모두 `password`)

| 이메일              | 역할    | 비고                 |
| ------------------- | ------- | -------------------- |
| admin@example.com   | admin   | 전체 메뉴            |
| manager@example.com | manager | 사용자 메뉴 접근     |
| user@example.com    | user    | `/users` 접근 시 403 |

## Scripts

```bash
pnpm dev              # 개발 서버
pnpm build            # 프로덕션 빌드 (타입체크 포함)
pnpm build:analyze    # 빌드 + 번들 분석 (ANALYZE=true → dist/stats.html)
pnpm preview          # 빌드 미리보기
pnpm typecheck        # 타입체크 단독 (tsc -b --noEmit)
pnpm lint             # 린트
pnpm lint:fsd         # FSD 아키텍처 린트 (Steiger)
pnpm format           # Prettier 포매팅
pnpm gen:api          # OpenAPI 스펙 → API 타입 생성 (orval)
pnpm test             # 단위/컴포넌트 테스트 (Vitest)
pnpm test:e2e         # E2E 테스트 (Playwright)
pnpm storybook        # Storybook (port 6006)
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK=true   # MSW 목 API. 실제 백엔드 연동 시 false
# VITE_SENTRY_DSN=      # 설정 시에만 Sentry 에러 트래킹 활성화 (미설정 시 no-op)
```

`.env.development` / `.env.production`으로 모드별 분리. 값은 `.env.example` 참고.
모든 `VITE_` 변수는 클라이언트 번들에 **그대로 노출**되므로 시크릿을 넣지 마세요. 환경변수는
부팅 시 zod 스키마(`src/shared/config/env.ts`)로 검증되어, 형식 오류 시 즉시 실패합니다.

## Structure

[Feature-Sliced Design(FSD)](https://feature-sliced.design) 6레이어 구조. 레이어는 자기보다
아래 레이어만 import할 수 있고, 슬라이스 간 import는 `index.ts`(Public API)를 경유합니다
(`pnpm lint:fsd` = Steiger로 강제).

```text
src
├── app          # providers, router(+가드), MSW mocks, config(axios 인증 주입)
├── pages        # 라우트 화면 슬라이스 (login / dashboard / users / forbidden / not-found)
├── widgets      # 합성 UI 블록 (main-layout: 사이드바+헤더 셸, auth-layout)
├── features     # 사용자 기능 (auth: 로그인 훅·스키마, users: 조회·생성, theme: 다크모드)
├── entities     # 도메인 모델 (user: User/Role 타입, session: 인증 스토어)
└── shared       # 도메인 무관 인프라 (api: axios, ui: 공용 컴포넌트, lib, config: paths)
```

## API Example

```typescript
export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
};
```

요청·응답 인터셉터로 토큰 주입과 401 리다이렉트를 처리합니다(인증 콜백은 `app/config/configureApi.ts`
에서 주입). 컴포넌트는 axios를 직접 호출하지 않고 `features/*`의 React Query 훅을 거칩니다.

## API 타입 생성 (orval)

`openapi/admin-api.yaml`(샘플 OpenAPI 스펙)에서 `pnpm gen:api`로 API 타입과 타입 클라이언트를
`src/shared/api/generated/`에 생성합니다(생성물 커밋). 실제 백엔드 연동 시 이 스펙을 백엔드가 제공하는
OpenAPI 문서로 교체하세요. 도메인 모델의 단일 출처는 `entities/user`이며 생성 타입은 전송 경계에서
소비합니다. [ADR 0004](docs/adr/0004-api-types-orval.md) 참고.

## 테스트

- **단위/컴포넌트** — `pnpm test` (Vitest + Testing Library, jsdom + MSW). 커버리지 임계값을
  `vite.config.ts`에서 강제하며 CI가 검증합니다.
- **E2E** — `pnpm test:e2e` (Playwright). 프로덕션 빌드를 preview 서버로 띄워 로그인 흐름을 검증합니다.
  최초 1회 브라우저 설치 필요: `pnpm exec playwright install --with-deps chromium`.
- **Lighthouse CI** — CI 에서 빌드 산출물(dist)을 정적 서빙해 접근성·SEO·모범사례(각 0.9)를 차단 게이트로,
  성능은 warn 으로 점검합니다(임계값 정본 `lighthouserc.json`). 로컬: `pnpm build && pnpm exec lhci autorun`.

## 관찰가능성

`src/shared/lib/observability`에 에러 트래킹(Sentry)·웹 바이탈 수집이 env-gated 스텁으로 들어 있습니다.
`VITE_SENTRY_DSN`을 설정하면 `@sentry/react`가 동적 로드되어 활성화됩니다(미설정 시 no-op). 렌더 에러는
앱 루트 `ErrorBoundary`가 잡아 폴백 UI를 보여주고 `reportError`로 보고합니다.
[ADR 0006](docs/adr/0006-observability.md) 참고.

## 보안

- **정적 분석** — `eslint-plugin-security` + `eslint-plugin-no-unsanitized`(DOM XSS sink 차단) +
  CodeQL SAST(`.github/workflows/codeql.yml`).
- **시크릿 스캔** — gitleaks (pre-commit + CI) + 빌드 산출물(dist) 시크릿 스캔. 프론트 번들 시크릿 유출에 특히 주의합니다.
- **의존성** — `pnpm audit`(CI, high 차단, `--prod`) + osv-scanner(교차검증, 비차단) + Dependabot 주간 업데이트(`.github/dependabot.yml`).
- **보안 헤더 / CSP** — `nginx.conf`·`vercel.json`(정본)과 vite preview 에 실용 베이스라인 CSP +
  `X-Frame-Options`/`Referrer-Policy`/`Permissions-Policy`/`nosniff` 적용([ADR 0007](docs/adr/0007-security-headers-csp.md)).
- **프로덕션 빌드** — `console`/`debugger` 제거(`vite.config.ts`). 오픈 리다이렉트는 `isInternalPath` 가드로 내부 경로만 허용.
- 위협 모델·의도된 트레이드오프·취약점 신고 절차는 [`SECURITY.md`](SECURITY.md), 전체 점검표는
  [`docs/secure-harness-react-mui.md`](docs/secure-harness-react-mui.md), 토큰 저장 트레이드오프는
  [ADR 0005](docs/adr/0005-token-storage.md) 참고.

## 배포 (프리뷰)

`vercel.json`이 SPA 빌드/리라이트를 설정합니다. 저장소를 Vercel에 연결하면 PR마다 프리뷰 배포가
자동 생성됩니다. 다른 호스팅(Netlify/Cloudflare Pages 등)도 `pnpm build` → `dist` 정적 서빙으로 동일하게 동작합니다.

## 아키텍처 결정 기록 (ADR)

상태 관리·FSD·API 타입·토큰 저장·관찰가능성 등 주요 결정의 배경은 [docs/adr/](docs/adr/)에 기록합니다.

## Contributing

브랜치 전략·커밋 컨벤션·버전 규칙은 [CONTRIBUTING.md](CONTRIBUTING.md)를, 변경 이력은 [CHANGELOG.md](CHANGELOG.md)를 참고하세요.

## License

MIT
