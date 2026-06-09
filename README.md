# React Admin Template

React + TypeScript + Vite 기반 관리자 템플릿. MUI, React Query, Zustand, React Hook Form으로 CMS·ERP·Back Office·대시보드를 빠르게 구축합니다.

## Stack

React · TypeScript · Vite · MUI · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · MSW · Vitest · ESLint · Prettier · Husky · Storybook

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
pnpm preview          # 빌드 미리보기
pnpm lint             # 린트
pnpm test             # 테스트
pnpm storybook        # Storybook (port 6006)
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK=true   # MSW 목 API. 실제 백엔드 연동 시 false
```

`.env.development` / `.env.production`으로 모드별 분리. 값은 `.env.example` 참고.

## Structure

```text
src
├── api          # axios 인스턴스, 인터셉터, 요청 함수
├── components   # 재사용 UI
├── hooks        # React Query 훅
├── layouts      # MainLayout(사이드바+헤더), AuthLayout
├── mocks        # MSW 핸들러 · 시드 데이터
├── pages        # 라우트 단위 페이지
├── providers    # Query / Theme Provider
├── routes       # 라우트 정의 + 가드 (Protected / Role)
├── schemas      # zod 스키마
├── stores       # zustand (auth / theme)
├── types
└── utils
```

## API Example

```typescript
export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
};
```

요청·응답 인터셉터로 토큰 주입과 401 리다이렉트를 처리합니다. 컴포넌트는 axios를 직접
호출하지 않고 `src/hooks`의 React Query 훅을 거칩니다.

## License

MIT
