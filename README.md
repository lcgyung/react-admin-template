# React Admin Template

React + TypeScript + Vite 기반 관리자 템플릿. MUI, React Query, Zustand, React Hook Form으로 CMS·ERP·Back Office·대시보드를 빠르게 구축합니다.

## Stack

React · TypeScript · Vite · MUI · React Router · React Query · Axios · Zustand · React Hook Form · Zod · Dayjs · Vitest · ESLint · Prettier · Husky

## Features

- 인증 (로그인/로그아웃, 토큰 저장, 보호된 라우트)
- RBAC 기반 메뉴·라우트 접근 제어
- Axios API Layer (인터셉터로 토큰 주입 · 401 처리 · 공통 에러)
- React Query 서버 상태 관리
- Zustand 전역 상태 관리
- React Hook Form + Zod 검증
- Vitest + Testing Library
- ESLint + Prettier + Husky + Lint-Staged

## Quick Start

```bash
git clone https://github.com/<owner>/react-admin-template.git
cd react-admin-template
npm install
cp .env.example .env
npm run dev
```

## Scripts

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 미리보기
npm run lint      # 린트
npm run test      # 테스트
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000
```

`.env.development` / `.env.production`으로 모드별 분리. 값은 `.env.example` 참고.

## Structure

```text
src
├── api          # axios 인스턴스, 인터셉터, 요청 함수
├── components
├── hooks
├── layouts
├── pages
├── providers
├── routes       # 라우트 정의 + 가드
├── schemas      # zod 스키마
├── stores       # zustand
├── types
└── utils
```

## API Example

```typescript
export const getUsers = () => axiosInstance.get('/users');
```

요청·응답 인터셉터로 토큰 주입과 401 리다이렉트를 처리합니다.

## License

MIT
