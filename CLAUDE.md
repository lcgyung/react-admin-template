# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

**React Admin Template** — React + TypeScript + Vite 기반 관리자 템플릿. 기능 목록·기술 스택·
빠른 시작·데모 계정 등 개요는 [`README.md`](README.md)를 참고하세요. 이 문서는 코드만 봐서는
알기 어려운 작업 규칙에 집중합니다.

## 패키지 매니저

이 프로젝트는 **pnpm**(`pnpm-workspace.yaml`, `pnpm-lock.yaml` 추적)을 사용합니다. npm/yarn 대신
pnpm 명령을 사용하세요.

> 참고: pnpm 10+ 는 보안상 의존성의 빌드 스크립트를 기본 차단합니다. `esbuild`/`msw` 의 빌드를
> 허용하는 설정이 `pnpm-workspace.yaml`(`allowBuilds` / `onlyBuiltDependencies`)에 들어 있습니다.

명령어는 `package.json` 의 `scripts` 를 참고하세요. 비자명한 점: `pnpm build` 는 `tsc -b`
타입체크를 포함하고, `pnpm dev` 는 5173, `pnpm storybook` 은 6006 포트를 씁니다.

## 프로젝트 구조

경로 별칭: `@/*` → `src/*` (`tsconfig`, `vite.config.ts` 양쪽에 설정).

```text
src
├── api          # axios 인스턴스(인터셉터) + 도메인별 요청 함수 (auth, users)
├── components   # 재사용 UI (common: Loading, PageHeader, StatCard …)
├── hooks        # React Query 훅 (useAuth, useUsers)
├── layouts      # MainLayout(사이드바+헤더), AuthLayout, components/{Sidebar,Header}
├── mocks        # MSW 핸들러/데이터 (handlers, data, browser, server)
├── pages        # 라우트 단위 페이지 (Login, Dashboard, Users, 403, 404)
├── providers    # AppProviders, QueryProvider, ThemeProvider
├── routes       # createBrowserRouter 정의 + ProtectedRoute/RoleRoute 가드 + paths 상수
├── schemas      # Zod 검증 스키마 (auth, user)
├── stores       # Zustand 스토어 (authStore, themeStore)
├── types        # 공용 타입 (auth, user, common)
└── utils        # 유틸 (format)
```

## 아키텍처 / 상태 관리 규칙

- **서버 상태** → React Query. 컴포넌트에서 직접 `axios`를 호출하지 말고 `src/hooks`의
  React Query 훅을 거칩니다.
- **API 호출** → `src/api`의 Axios 레이어 함수로 정의. `axiosInstance`가 요청 인터셉터로
  토큰을 주입하고, 응답 인터셉터로 401 시 인증 상태를 초기화하고 `/login`으로 보냅니다.

  ```typescript
  export const getUsers = async () => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  };
  ```

- **전역 클라이언트 상태** → Zustand(`src/stores`). `authStore`(token/user, persist),
  `themeStore`(light/dark, persist). React 외부(인터셉터)에서는 `getAuthToken()` /
  `clearAuthState()` 헬퍼로 접근합니다.
- **폼 / 검증** → React Hook Form + Zod. 스키마는 `src/schemas`에 정의하고
  `zodResolver`로 연결합니다.

## 인증 & RBAC

- 로그인 성공 시 `authStore`에 `token`/`user`를 저장(persist)합니다.
- 라우트 가드는 `src/routes`에 있습니다.
  - `ProtectedRoute` — 미인증 시 `/login` 리다이렉트.
  - `RoleRoute` — `allowedRoles` 미충족 시 `/403` 리다이렉트.
- 사이드바 메뉴는 `Sidebar.tsx`의 `menuItems[].allowedRoles`로 역할 필터링됩니다.
- 역할: `'admin' | 'manager' | 'user'`. `/users`는 `admin`/`manager`만 접근 가능합니다.
- RBAC는 프런트엔드(메뉴·라우트) 차원의 제어입니다. 실제 데이터 권한은 백엔드에서 강제해야 합니다.

## 목 API (MSW)

- `VITE_ENABLE_MOCK=true` 일 때 `src/main.tsx`가 MSW 워커를 기동합니다.
- 핸들러는 `src/mocks/handlers.ts`(로그인/로그아웃/me/users), 시드 데이터는 `src/mocks/data.ts`.
- 테스트에서는 `src/mocks/server.ts`(setupServer)를 `vitest.setup.ts`가 기동합니다.
- 데모 계정과 환경 변수(`VITE_ENABLE_MOCK` / `VITE_API_BASE_URL`)는 `README.md` 와 `.env.example` 참고.

## 코드 컨벤션

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양합니다.
  `tsconfig`에 `strict`, `noUnusedLocals/Parameters`가 켜져 있습니다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성합니다.
- **ESLint + Prettier** — 모든 코드는 린트/포매팅 규칙을 통과해야 합니다 (`pnpm lint`, `pnpm format`).
- **Husky + Lint-Staged** — 커밋 시 변경 파일에 자동으로 `eslint --fix` + `prettier`가 적용됩니다.
