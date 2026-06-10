# FSD 아키텍처 마이그레이션 — 설계 + 실행 계획 (react-admin-template)

> 상태: **설계·실행 계획 문서** (실제 폴더 이전은 미수행). 본 문서는 설계 방안·영향도 분석에 더해,
> 코드베이스 검증을 거친 **실행 가능한 단계·명령·순서**까지 단일 출처로 통합한다.
> 자매 프로젝트 `react-pwa-template`도 동일 설계를 동시 적용한다(별도 리포지토리 → 후속 작업).
> 차이점은 **MUI**(Tailwind/Shadcn 아님)와 **PWA 레이어 없음**이다.
>
> 또한 **FSD 강제(7단계)** 와 **게이트/자동화 후속(FSD 독립)** 을 본 문서의 단일 로드맵으로
> 포함한다(구 `claude-hooks-roadmap.md` 흡수·삭제).

## 1. 배경 / 목표

현재 `src`는 **타입 기반(type-first)** 구조다(`api/`, `components/`, `hooks/`, `pages/`, `stores/`, `schemas/`, `types/` …). 한 도메인(예: auth)의 코드가 7~8개 폴더에 흩어져 있어 "기능 단위로 모아보기"가 어렵고, 레이어 간 의존 방향을 강제하는 장치가 없다.

[Feature-Sliced Design(FSD) 2.x](https://feature-sliced.design/docs) ([KR](https://fsd.how/kr))를 도입해:

- 도메인(auth / users / theme) 응집도를 높이고,
- "위 레이어 → 아래 레이어" 단방향 의존 규칙을 **Steiger** 린터로 강제하고,
- 슬라이스 Public API(`index.ts`)로 내부 구현을 캡슐화한다.

### 코드베이스 검증 결과

- `src` **42개 파일 전부 매핑표(4절)와 1:1 대응** 확인. 배럴 `index.ts`는 아직 없음.
- `axiosInstance.ts`가 `getAuthToken`/`clearAuthState`(authStore) + `paths`를 import → **shared→entities 상향 의존(FSD 위반)** 확정(→ 5절 Option B로 해소).
- `authStore.ts`가 `User` 타입을 import(`import type { User } from '@/types/user'`) → 마이그레이션 후 **entities/session→entities/user 같은-레이어 의존**, `@x` 크로스임포트로 해소(보정 1).
- `Header.tsx`가 `Sidebar.tsx`의 `DRAWER_WIDTH`를 import하고 `MainLayout`이 둘을 렌더 → 레이아웃 셸을 **단일 `widgets/main-layout` 슬라이스로 통합**(보정 2).
- 도구 체인은 FSD 호환: `@/*` alias 유지(`tsconfig.app.json`·`vite.config.ts`), Storybook 글롭(`../src/**/*.stories.*`) 자동 매칭, `gate.sh` = `tsc -b --noEmit` + `eslint .`.
- **정정**: `.github/workflows/ci.yml`은 **이미 존재**(lint→test→build). "신규"가 아니라 스텝 추가. 진짜 신규는 `steiger`·`lint:fsd`·`steiger.config.ts`뿐. `CLAUDE.md`가 참조하는 `src/routes/guards.test.tsx`는 **현재 미존재**(stale) — pwa와 달리 admin엔 가드 테스트가 없음.

### 확정 결정사항

| 항목                 | 결정                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| FSD 깊이             | **정석 6레이어** (`app / pages / widgets / features / entities / shared`, entities 포함)          |
| 규칙 강제            | **Steiger** (`@feature-sliced/steiger-plugin`). 기존 ESLint는 유지하고 별도 추가                  |
| Steiger 강제 강도    | **즉시 error (CI/게이트 하드 차단)**. 보정 2건 + Option B로 위반 0 달성 가능하므로 하드 차단 채택 |
| axios 상향 의존 해소 | **Option B — 의존성 주입(정석)**. app 부트스트랩에서 콜백 주입, `shared/api` 의존성 0 유지 (5절)  |
| 진행                 | `react-admin-template` · `react-pwa-template` **동시·동일 적용**                                  |
| 경로 alias           | 기존 `@/* → ./src/*` **유지** (레이어별 alias 추가 안 함)                                         |
| 작업 범위            | **전체** — 폴더 이전(1~6단계) + Steiger·CI/게이트 연동·문서 갱신(7단계)                           |

### 설계 보정 2건 (하드 에러 0 위반 달성에 필수)

Steiger 하드 강제(error)를 택했으므로, 같은-레이어 cross-import 2건을 정석대로 보정한다(매핑표·실행 단계에 반영).

1. **`entities/session → entities/user`** — `authStore.ts`가 `User` 타입을 import한다(확인됨). 마이그레이션 후 이는 entity→entity(같은 레이어) import이라 FSD 금지. → FSD 공식 **`@x` 크로스임포트 API**로 해결: `entities/user/@x/session.ts`가 `User`를 재노출하고, session은 `@/entities/user/@x/session`에서 import한다. Steiger `recommended`가 `@x`를 인식한다.
2. **`widgets/main-layout → widgets/app-nav`** — `MainLayout`이 `<Sidebar/>`·`<Header/>`를 렌더하고 `Header`가 `Sidebar`의 `DRAWER_WIDTH`를 import한다(확인됨). 별도 `app-nav` 슬라이스로 분리하면 `main-layout → app-nav`가 widget→widget(같은 레이어) 위반이 된다. → **`app-nav` 분리안을 폐기**하고 레이아웃 셸(`MainLayout`+`Sidebar`+`Header`)을 **단일 `widgets/main-layout` 슬라이스**로 통합한다(슬라이스 내부 import는 합법). 이 한 수로 Header↔Sidebar 결합도 동시 해소. `auth-layout`(네비 미사용)은 별도 위젯 유지.

> 의존 방향 검증: `widgets→features→entities→shared`, `app→전부`는 모두 합법. 위 2건만이 같은-레이어 위반이며, 보정 + Option B(axios) 후 **예상 Steiger 위반 0**.

---

## 2. FSD 6레이어 개요 + 의존성 규칙

레이어 (위 → 아래):

| 레이어       | 역할                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| **app**      | 앱 전역 설정 — providers, router/guards, 전역 스타일(MUI 테마 주입), MSW 부트스트랩, axios 인터셉터 주입 |
| **pages**    | 라우트 화면. 슬라이스 = 페이지                                                                           |
| **widgets**  | 페이지에 독립적인 합성 UI 블록 (레이아웃 셸)                                                             |
| **features** | 사용자 액션·기능 (로그인 폼·액션, 유저 조회 훅, 테마 토글)                                               |
| **entities** | 비즈니스 도메인 모델 (User/Role, 인증 세션)                                                              |
| **shared**   | 도메인 무관 인프라 (axios 인스턴스, UI 프리미티브, 유틸, 경로 상수)                                      |

> `processes`는 deprecated이므로 사용하지 않는다.

**의존성 규칙(핵심)**: 한 레이어의 모듈은 **자기보다 엄격히 아래 레이어만** import할 수 있다. 같은 레이어의 다른 슬라이스끼리는 import 금지(예외: `@x` 크로스임포트 API). `app`/`shared`만 "레이어이자 슬라이스"로 동작(슬라이스 없이 세그먼트만 두며 누구나 import 가능).

**세그먼트**: 슬라이스 내부는 "왜"로 분류 — `ui / api / model / lib / config`. `components`/`hooks`처럼 "무엇" 이름은 금지.

**Public API**: 슬라이스마다 `index.ts` 배럴 하나. 슬라이스 간 import는 반드시 배럴 경유. `shared`는 깊은 경로로 직접 import(`@/shared/ui/PageHeader`).

---

## 3. 타깃 폴더 구조

```
src/
  app/
    providers/        # AppProviders, QueryProvider
    router/           # router.tsx + ProtectedRoute + RoleRoute
    mocks/            # MSW handlers/data/browser/server
    config/           # configureApi.ts (axios 인터셉터에 인증 콜백 주입)
    App.tsx
  pages/
    login/      ui/ index.ts      # LoginPage (+ test)
    dashboard/  ui/ index.ts
    users/      ui/ index.ts
    forbidden/  ui/ index.ts
    not-found/  ui/ index.ts
  widgets/
    main-layout/ ui/ index.ts     # MainLayout + Sidebar + Header 통합 (cross-import 제거)
    auth-layout/ ui/ index.ts
  features/
    auth/   api/ model/ index.ts  # useAuth, authApi, loginSchema, Login DTO
    users/  api/ model/ index.ts  # useUsers, usersApi, userFormSchema
    theme/  model/ ui/ index.ts   # themeStore + ThemeProvider(MUI)
  entities/
    user/    model/ @x/ index.ts  # User/Role 타입 (+ @x/session.ts 크로스임포트 API)
    session/ model/ index.ts      # authStore(token/user, getAuthToken/clearAuthState)
  shared/
    api/     axiosInstance.ts, types.ts     # (배럴 없음, 깊은 경로 import) — axiosInstance 의존성 0
    ui/      Loading/, PageHeader/, StatCard/
    lib/     format.ts (+test)
    config/  paths.ts
  main.tsx          # 루트 유지 (index.html 진입점). @/app/App import
  vite-env.d.ts     # 루트 유지 (ambient 타입)
```

**루트 유지(이동 금지)**: `vite.config.ts`, `index.html`, `.storybook/`, `tsconfig.*`, `eslint.config.js`, `public/`.

---

## 4. 파일별 매핑표 (현재 → FSD)

현재 `src` 42개 파일 전체를 매핑한다.

### shared

| 현재                                       | FSD 목적지                                    |
| ------------------------------------------ | --------------------------------------------- |
| `api/axiosInstance.ts`                     | `shared/api/axiosInstance.ts` (의존성 0)      |
| `types/common.ts`                          | `shared/api/types.ts`                         |
| `routes/paths.ts`                          | `shared/config/paths.ts`                      |
| `utils/format.ts`                          | `shared/lib/format.ts`                        |
| `utils/format.test.ts`                     | `shared/lib/format.test.ts`                   |
| `components/common/Loading.tsx`            | `shared/ui/Loading/Loading.tsx`               |
| `components/common/PageHeader.tsx`         | `shared/ui/PageHeader/PageHeader.tsx`         |
| `components/common/PageHeader.stories.tsx` | `shared/ui/PageHeader/PageHeader.stories.tsx` |
| `components/common/StatCard.tsx`           | `shared/ui/StatCard/StatCard.tsx`             |

### entities

| 현재                                                            | FSD 목적지                                                          |
| --------------------------------------------------------------- | ------------------------------------------------------------------- |
| `types/user.ts` (User/Role/CreateUserInput)                     | `entities/user/model/types.ts` + `entities/user/index.ts`           |
| — (신규)                                                        | `entities/user/@x/session.ts` (`User` 재노출 — 크로스임포트 API)    |
| `stores/authStore.ts` (token/user, getAuthToken/clearAuthState) | `entities/session/model/authStore.ts` + `entities/session/index.ts` |

> `authStore`의 `User` import는 `@/entities/user/@x/session`으로 변경(보정 1).

### features

| 현재                          | FSD 목적지                               |
| ----------------------------- | ---------------------------------------- |
| `hooks/useAuth.ts`            | `features/auth/model/useAuth.ts`         |
| `api/auth.ts`                 | `features/auth/api/authApi.ts`           |
| `schemas/auth.ts`             | `features/auth/model/loginSchema.ts`     |
| `types/auth.ts` (Login DTO)   | `features/auth/model/types.ts`           |
| —                             | `features/auth/index.ts` (배럴)          |
| `hooks/useUsers.ts`           | `features/users/model/useUsers.ts`       |
| `api/users.ts`                | `features/users/api/usersApi.ts`         |
| `schemas/user.ts`             | `features/users/model/userFormSchema.ts` |
| —                             | `features/users/index.ts` (배럴)         |
| `stores/themeStore.ts`        | `features/theme/model/themeStore.ts`     |
| `providers/ThemeProvider.tsx` | `features/theme/ui/ThemeProvider.tsx`    |
| —                             | `features/theme/index.ts` (배럴)         |

> `features/auth`는 `entities/session`(set/clear)과 `entities/user`(User 타입)를 import한다.

### widgets (⚠️ 보정 2 적용 — 단일 `main-layout` 슬라이스 통합)

| 현재                             | FSD 목적지                              |
| -------------------------------- | --------------------------------------- |
| `layouts/MainLayout.tsx`         | `widgets/main-layout/ui/MainLayout.tsx` |
| `layouts/components/Sidebar.tsx` | `widgets/main-layout/ui/Sidebar.tsx`    |
| `layouts/components/Header.tsx`  | `widgets/main-layout/ui/Header.tsx`     |
| `layouts/AuthLayout.tsx`         | `widgets/auth-layout/ui/AuthLayout.tsx` |

> **통합 이유**: `MainLayout`이 `Sidebar`·`Header`를, `Header`가 `Sidebar`의 `DRAWER_WIDTH`를 import한다. 별도 `app-nav` 슬라이스로 쪼개면 `main-layout → app-nav`가 widget→widget(같은 레이어) 위반이 된다. 셸 전체를 단일 `widgets/main-layout` 슬라이스로 합쳐 **내부 상대경로 import**로 처리한다(Header↔Sidebar 결합도 동시 해소). `auth-layout`(네비 미사용)은 별도 위젯 유지.

### pages (각 슬라이스 `ui/` + `index.ts`)

| 현재                       | FSD 목적지                             |
| -------------------------- | -------------------------------------- |
| `pages/LoginPage.tsx`      | `pages/login/ui/LoginPage.tsx`         |
| `pages/LoginPage.test.tsx` | `pages/login/ui/LoginPage.test.tsx`    |
| `pages/DashboardPage.tsx`  | `pages/dashboard/ui/DashboardPage.tsx` |
| `pages/UsersPage.tsx`      | `pages/users/ui/UsersPage.tsx`         |
| `pages/ForbiddenPage.tsx`  | `pages/forbidden/ui/ForbiddenPage.tsx` |
| `pages/NotFoundPage.tsx`   | `pages/not-found/ui/NotFoundPage.tsx`  |

### app

| 현재                          | FSD 목적지                                               |
| ----------------------------- | -------------------------------------------------------- |
| `App.tsx`                     | `app/App.tsx`                                            |
| `providers/AppProviders.tsx`  | `app/providers/AppProviders.tsx`                         |
| `providers/QueryProvider.tsx` | `app/providers/QueryProvider.tsx`                        |
| `routes/index.tsx`            | `app/router/router.tsx`                                  |
| `routes/ProtectedRoute.tsx`   | `app/router/ProtectedRoute.tsx`                          |
| `routes/RoleRoute.tsx`        | `app/router/RoleRoute.tsx`                               |
| `mocks/browser.ts`            | `app/mocks/browser.ts`                                   |
| `mocks/server.ts`             | `app/mocks/server.ts`                                    |
| `mocks/handlers.ts`           | `app/mocks/handlers.ts`                                  |
| `mocks/data.ts`               | `app/mocks/data.ts`                                      |
| — (신규)                      | `app/config/configureApi.ts` (axios 인증 콜백 주입, 5절) |

### 루트 유지 (이동만 안 하고 import 경로만 갱신)

| 파일            | 비고                                                                  |
| --------------- | --------------------------------------------------------------------- |
| `main.tsx`      | `index.html` 진입점. `@/app/App`, `@/app/mocks/browser` import로 갱신 |
| `vite-env.d.ts` | ambient 타입, 레이어 아님                                             |

---

## 5. 핵심 변경: axios 의존성 역전 (Option B)

`shared/api/axiosInstance.ts`는 인터셉터에서 `getAuthToken`/`clearAuthState`(→ `entities/session`)와 `paths`(→ `shared/config`)를 사용한다. `paths`는 `shared`로 이동하므로 문제없지만, `entities/session` 참조는 **shared → entities 상향 import(규칙 위반)**다. **Option B(의존성 주입)** 로 해소한다 — `shared/api`를 도메인 의존 0으로 유지하고 **app 레이어가 인증 콜백을 주입**한다. 동작(401 시 인증 초기화 + `/login` 리다이렉트)은 현재와 동일하게 보존한다.

**`shared/api/axiosInstance.ts`** (entities/paths import 제거):

```ts
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// app 레이어가 주입하는 인증 콜백 (기본 no-op).
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureAuthInterceptors(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) onUnauthorized();
    return Promise.reject(error);
  },
);
```

**`app/config/configureApi.ts`** (최종 위치, 6단계에서 확정). app은 최상위 레이어라 shared+entities 모두 import 가능:

```ts
import { configureAuthInterceptors } from '@/shared/api/axiosInstance';
import { paths } from '@/shared/config/paths';
import { clearAuthState, getAuthToken } from '@/entities/session';

configureAuthInterceptors({
  getToken: getAuthToken,
  onUnauthorized: () => {
    clearAuthState();
    if (window.location.pathname !== paths.login) {
      window.location.href = paths.login;
    }
  },
});
```

`app/App.tsx` 최상단에서 side-effect import(`import '@/app/config/configureApi';`)로 렌더 전 1회 설정.

> ⚠️ 런타임 함정: 미연결 시 토큰 주입·401 리다이렉트가 **타입 에러 없이 조용히 무력화**(기본 no-op)된다. `app/App.tsx`의 이 import에 "제거 금지" 주석을 달고 `CLAUDE.md` 인증 섹션에 기록한다.

**중간 단계 보존책**: `app/`은 6단계까지 없으므로, 1~5단계 동안에는 위 주입 로직을 `main.tsx`(런타임)와 `vitest.setup.ts`(테스트)에 임시 인라인 배치하고 getter/clearer는 그 시점의 현재 위치에서 import한다(1단계엔 `@/stores/authStore`, 2단계 후 `@/entities/session`). 6단계에서 `app/config/configureApi.ts`로 일원화하고 두 파일을 슬림화. 이렇게 해야 각 단계 vitest 게이트가 토큰 주입 동작을 그대로 유지한다.

---

## 6. 영향도 분석

### 6.1 코드

- `src` 42개 파일 대부분의 **import 경로 재작성**. alias `@/*`는 유지하므로 경로 접두만 변경(`@/stores/authStore` → `@/entities/session`, `@/hooks/useAuth` → `@/features/auth` 등, 8절 표).
- 같은-레이어 결합 3종을 구조적 해소: axios 상향 의존(Option B), session→user(`@x`), widget cross-import(`main-layout` 단일 슬라이스 통합).
- 테스트: `pages/login/ui/LoginPage.test.tsx`(`useAuthStore`+`useAuth` 통합 검증), `shared/lib/format.test.ts` — 내부 import만 갱신. vitest는 `**/*.test.tsx` 자동 탐색이라 폴더 이동에 영향받지 않음.

### 6.2 설정

| 파일                       | 변경                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `tsconfig.app.json`        | **변경 거의 없음** — `@/*` paths 유지, `include: ["src", ...]` 유지                                   |
| `vite.config.ts`           | **변경 없음** — `@` alias 유지                                                                        |
| `eslint.config.js`         | **변경 없음** (admin은 MUI이라 `components/ui` override가 없음 — pwa와 차이)                          |
| `.storybook/main.ts`       | 글롭 `../src/**/*.stories.*` 가 새 위치도 매칭 → **변경 없음**                                        |
| `package.json`             | **신규** `"lint:fsd": "steiger ./src"` 스크립트, devDeps `steiger` · `@feature-sliced/steiger-plugin` |
| `steiger.config.ts`        | **신규** — `fsd.configs.recommended`                                                                  |
| `.github/workflows/ci.yml` | **기존 파일**(lint→test→build) — `pnpm lint:fsd` 스텝 추가(하드 실패)                                 |

### 6.3 문서

| 파일                    | 변경                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`             | "프로젝트 구조" 트리 전면 교체. 아키텍처 규칙의 경로 참조 갱신: `src/hooks`→`features/*/model`, `src/api`→`shared/api`+`features/*/api`, `src/stores`→`entities/session`+`features/theme/model`, `src/schemas`→`features/*/model`, `src/routes`→`app/router`+`shared/config/paths`, `src/mocks`→`app/mocks`. **FSD 의존성 규칙 · Public API 규칙 섹션 신설** + axios 브리지 gotcha 명시. stale `src/routes/guards.test.tsx` 참조 정리 |
| `README.md`             | "## Structure" 트리 교체                                                                                                                                                                                                                                                                                                                                                                                                              |
| `docs/fsd-migration.md` | 본 문서                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 6.4 스킬 (`.claude/skills/code-review/SKILL.md`)

- 폴더 경로 참조 없음(MUI/접근성/성능 기준만) → **영향 없음**. (pwa는 `components/ui`→`shared/ui` 문구 갱신 필요하나 admin은 해당 참조 없음.)

### 6.5 서브에이전트 (`.claude/agents/code-reviewer.md`)

- React+MUI 리뷰 기준만 기술, 폴더 구조 참조 없음 → **영향 없음**.
- **7단계 확정**: `code-review` 스킬 + 본 에이전트에 "FSD 레이어 경계 / 같은-레이어 cross-import / Public API 우회(배럴 미경유)" 점검 항목 추가.

### 6.6 훅 (`.claude/hooks/*`, `.claude/settings.json`)

| 훅                                     | 영향                                                                                                                                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session-context.sh` (SessionStart)    | MUI 규칙만 주입 → 영향 없음. **7단계 확정**: FSD 규칙 주입(레이어 단방향 + Public API 경유)                                                                                                                             |
| `guard-bash.sh` (PreToolUse)           | 파괴적 명령 차단, 경로 무관 → 영향 없음                                                                                                                                                                                 |
| `format-changed-file.sh` (PostToolUse) | 확장자 글롭 기반, `file_path` 절대경로 → 영향 없음                                                                                                                                                                      |
| `gate.sh` (Stop)                       | `tsc -b --noEmit` + `eslint .` 전역 → 동작 무관. 이미 `cd "$CLAUDE_PROJECT_DIR"`로 repo 루트 보정됨(하위 디렉터리 실행 시 거짓실패 방지). 7단계에서 vitest 블록 활성화 + `steiger ./src` 추가(**즉시 error 하드 차단**) |
| `settings.json`                        | 훅 등록은 파일명 기반 → **변경 불필요**                                                                                                                                                                                 |

**요약**: `.claude/` 자산(훅·스킬·서브에이전트·settings)은 폴더 구조 비의존적이라 **마이그레이션 자체엔 기능 영향이 없다.** 단 **FSD 일관성 코딩 강제**를 위해 7단계에서 게이트(steiger/vitest)·컨텍스트(FSD 규칙)·리뷰(경계 점검)를 **확정 적용**한다.

---

## 7. 실행 순서 (하향식, 각 단계 후 게이트)

각 단계 종료 시 게이트: `pnpm exec tsc -b --noEmit && pnpm exec eslint . && pnpm exec vitest run`

> 게이트는 **repo 루트에서 실행**한다(`tsc -b`/`eslint .`/`vitest`/`steiger`가 cwd=루트를 전제). 하위 디렉터리(예: `docs/`)에서 돌리면 `TS5083`·eslint all-ignored 거짓 실패가 난다. Stop 훅 `gate.sh`는 `cd "$CLAUDE_PROJECT_DIR"`로 자동 보정된다.

- 파일 이동은 **`git mv`로 이력 보존**.
- PostToolUse 포맷 훅이 `*.ts(x)`에 `eslint --fix`+`prettier`를 자동 적용하므로 충돌 주의.
- import 재작성은 alias `@/*` 유지 → **접두만 변경**(8절 매핑표). 변경 후 `tsc -b`(strict + `noUnusedLocals`)가 누락/끊긴 import를 즉시 검출.
- Steiger는 **7단계에서 도입**하므로 1~6단계 게이트엔 영향 없음.

### 1단계 — shared (+ axios DI 전환)

- `git mv`: `api/axiosInstance.ts → shared/api/axiosInstance.ts`, `types/common.ts → shared/api/types.ts`, `routes/paths.ts → shared/config/paths.ts`, `utils/format.ts(+test) → shared/lib/`, `components/common/{Loading,PageHeader(+stories),StatCard} → shared/ui/<Name>/`.
- `shared/ui/<Name>/index.ts` 각 1줄 re-export 추가(`@/shared/ui/PageHeader` 깊은 import용). shared는 슬라이스 배럴 규칙 비대상 — 단순 편의 re-export.
- `axiosInstance.ts`를 **Option B 형태로 리팩터링**(entities/paths import 제거, 5절).
- 인터셉터 주입 로직을 `main.tsx`·`vitest.setup.ts`에 임시 인라인(getter/clearer는 `@/stores/authStore`에서, paths는 `@/shared/config/paths`에서).
- 전역 import 갱신: `@/api/axiosInstance→@/shared/api/axiosInstance`, `@/types/common→@/shared/api/types`, `@/routes/paths→@/shared/config/paths`, `@/utils/format→@/shared/lib/format`, `@/components/common/X→@/shared/ui/X`. → 게이트.

### 2단계 — entities

- `git mv`: `types/user.ts → entities/user/model/types.ts`, `stores/authStore.ts → entities/session/model/authStore.ts`.
- 배럴: `entities/user/index.ts`(→ `export * from './model/types'`), `entities/session/index.ts`(→ `export { useAuthStore, getAuthToken, clearAuthState } from './model/authStore'`). `getAuthToken/clearAuthState` export 유지(주입 콜백이 사용).
- **`@x` 크로스임포트(보정 1)**: `entities/user/@x/session.ts` → `export type { User } from '../model/types'`. `authStore`의 `User` import를 `@/entities/user/@x/session`으로 변경(entity→entity 위반 회피).
- import 갱신: `@/types/user→@/entities/user`, `@/stores/authStore→@/entities/session`. 임시 주입 로직의 getter/clearer import도 `@/entities/session`로 전환. → 게이트.

### 3단계 — features

- `git mv`:
  - auth — `hooks/useAuth.ts→features/auth/model/useAuth.ts`, `api/auth.ts→features/auth/api/authApi.ts`, `schemas/auth.ts→features/auth/model/loginSchema.ts`, `types/auth.ts→features/auth/model/types.ts`.
  - users — `hooks/useUsers.ts→features/users/model/useUsers.ts`, `api/users.ts→features/users/api/usersApi.ts`, `schemas/user.ts→features/users/model/userFormSchema.ts`.
  - theme — `stores/themeStore.ts→features/theme/model/themeStore.ts`, `providers/ThemeProvider.tsx→features/theme/ui/ThemeProvider.tsx`.
- 배럴 3개(Public API만 노출):
  - `features/auth/index.ts` → `useAuth` 훅들 + `loginSchema` + Login DTO 타입. (`authApi`는 내부용, 미노출)
  - `features/users/index.ts` → `useUsers` 훅들 + `userFormSchema`. (`usersApi` 내부용)
  - `features/theme/index.ts` → `useThemeStore` + `ThemeProvider`.
- `features/auth`는 `entities/session`(set/clear)·`entities/user`(User)를 import(features→entities 허용).
- import 갱신: `@/hooks/useAuth|@/api/auth|@/schemas/auth|@/types/auth→@/features/auth`, users 동형 `→@/features/users`, `@/stores/themeStore|@/providers/ThemeProvider→@/features/theme`. → 게이트(`LoginPage.test` 통과 확인).

### 4단계 — widgets (⚠️ 보정 2 적용)

- **`widgets/main-layout` 단일 슬라이스로 통합**: `git mv`로 `layouts/MainLayout.tsx`·`layouts/components/{Sidebar,Header}.tsx`를 `widgets/main-layout/ui/`로 이동. `MainLayout↔Sidebar↔Header` 상호 참조(`DRAWER_WIDTH` 포함)는 **상대경로 내부 import**로 처리(배럴 경유 금지). 배럴 `widgets/main-layout/index.ts` → `MainLayout` export.
- `layouts/AuthLayout.tsx → widgets/auth-layout/ui/` + 배럴.
- 위젯은 하위 의존만 사용: `@/features/*`, `@/entities/session`, `@/shared/ui|lib|config`.
- import 갱신: `@/layouts/MainLayout→@/widgets/main-layout`, `@/layouts/AuthLayout→@/widgets/auth-layout`(`@/layouts/components/*` 직접 참조는 main-layout 내부로 흡수). → 게이트.

### 5단계 — pages

- `git mv`: 각 페이지를 `pages/<slug>/ui/`로. `LoginPage(+test)→pages/login/ui/`, `DashboardPage→dashboard`, `UsersPage→users`, `ForbiddenPage→forbidden`, `NotFoundPage→not-found`. 각 슬라이스 `index.ts` 배럴(페이지 컴포넌트 export).
- import 갱신: `@/pages/LoginPage→@/pages/login` 등. → 게이트.

### 6단계 — app (+ 주입 일원화)

- `git mv`: `App.tsx→app/App.tsx`, `providers/{AppProviders,QueryProvider}→app/providers/`, `routes/index.tsx→app/router/router.tsx`, `routes/{ProtectedRoute,RoleRoute}→app/router/`, `mocks/{browser,server,handlers,data}→app/mocks/`.
- **주입 일원화**: `app/config/configureApi.ts` 생성(5절 코드), `app/App.tsx` 최상단에서 side-effect import. `main.tsx`·`vitest.setup.ts`의 임시 인라인 주입 제거.
- 루트 파일 import 갱신: `main.tsx`(`@/App→@/app/App`, `@/mocks/browser→@/app/mocks/browser`), `vitest.setup.ts`(`@/mocks/server→@/app/mocks/server`). `vite-env.d.ts`는 루트 유지.
- 그 외 `@/providers/*`, `@/routes`, `@/mocks/*` 잔여 import 정리. → 게이트.

### 7단계 — FSD 일관성 강제(Steiger + 컨텍스트 + 리뷰) + CI/게이트 + 문서

> **FSD 벗어나지 않는 코딩**을 강제하는 3종 가드(선제+반응+리뷰). **1~6단계(폴더 이전) 완료가 선행 필수.**

- **(반응/게이트)** devDeps 추가: `steiger`, `@feature-sliced/steiger-plugin`(pnpm). `steiger.config.ts`(루트) → `fsd.configs.recommended`.
- `package.json` 스크립트: `"lint:fsd": "steiger ./src"`.
- **위반 0 확인**: Option B(axios) + `@x`(session→user) + 단일슬라이스(widget) 보정으로 **3개 같은-레이어/상향 엣지 모두 구조적 해소** → `pnpm lint:fsd` 위반 0.
- `.github/workflows/ci.yml`(**기존 파일**): Lint 스텝 뒤에 `pnpm lint:fsd` 추가(**위반 시 실패**).
- **(반응/게이트)** `.claude/hooks/gate.sh`: 주석 처리된 vitest 블록 임시 활성화 + `steiger ./src` 추가(**즉시 error 하드 차단**. cwd 보정 `cd`는 이미 적용됨).
- **(선제/가이드)** `.claude/hooks/session-context.sh`: FSD 규칙 한 단락 주입 — 레이어 단방향 의존(`app>pages>widgets>features>entities>shared`) + 슬라이스 간 import는 `index.ts` Public API 경유.
- **(리뷰)** `.claude/skills/code-review/SKILL.md` + `.claude/agents/code-reviewer.md`: "레이어 경계 위반 / 같은-레이어 cross-import / Public API 우회(배럴 미경유)" 점검 항목 추가.
- 문서: `CLAUDE.md`·`README.md` 구조 섹션 갱신 + **FSD 의존성/Public API 규칙 섹션 신설**(6.3 참조).

---

## 8. import 경로 매핑 (alias 접두)

| 현재                                                           | FSD                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `@/api/axiosInstance`                                          | `@/shared/api/axiosInstance`                                          |
| `@/types/common`                                               | `@/shared/api/types`                                                  |
| `@/routes/paths`                                               | `@/shared/config/paths`                                               |
| `@/utils/format`                                               | `@/shared/lib/format`                                                 |
| `@/components/common/{Loading,PageHeader,StatCard}`            | `@/shared/ui/{Loading,PageHeader,StatCard}`                           |
| `@/types/user`                                                 | `@/entities/user` (authStore의 `User`만 `@/entities/user/@x/session`) |
| `@/stores/authStore`                                           | `@/entities/session`                                                  |
| `@/hooks/useAuth`·`@/api/auth`·`@/schemas/auth`·`@/types/auth` | `@/features/auth`                                                     |
| `@/hooks/useUsers`·`@/api/users`·`@/schemas/user`              | `@/features/users`                                                    |
| `@/stores/themeStore`·`@/providers/ThemeProvider`              | `@/features/theme`                                                    |
| `@/layouts/MainLayout`·`@/layouts/components/{Sidebar,Header}` | `@/widgets/main-layout` (통합 슬라이스, 내부 상대경로)                |
| `@/layouts/AuthLayout`                                         | `@/widgets/auth-layout`                                               |
| `@/pages/LoginPage` …                                          | `@/pages/login` …                                                     |
| `@/App`                                                        | `@/app/App`                                                           |
| `@/providers/{AppProviders,QueryProvider}`                     | `@/app/providers/*`                                                   |
| `@/routes`·`@/routes/{ProtectedRoute,RoleRoute}`               | `@/app/router/*`                                                      |
| `@/mocks/*`                                                    | `@/app/mocks/*`                                                       |

> 설정 파일(`tsconfig.app.json` paths, `vite.config.ts` alias, `eslint.config.js`, `.storybook/main.ts`)은 **변경 불필요** — `@/*`·글롭이 새 위치를 그대로 매칭.

---

## 9. 검증

**본 설계 검증**: 4절 매핑표가 현재 `src` 42개 파일과 1:1 대응하는지 확인(완료 — 코드 변경 없음 → 빌드 불필요).

**실제 마이그레이션 검증** (각 단계 후 + 최종, repo 루트에서 실행):

- `pnpm exec tsc -b --noEmit` — strict + `noUnusedLocals`로 누락/끊긴 import 즉시 검출.
- `pnpm exec eslint .`
- `pnpm exec vitest run` — auth/routing 동작(가장 위험한 엣지) 보증. 특히 `pages/login/ui/LoginPage.test.tsx`(`useAuthStore`+`useAuth` 통합)와 axios 토큰 주입 보존 확인.
- `pnpm lint:fsd` — Steiger 위반 0 확인(axios=Option B, session→user=`@x`, widget=`main-layout` 단일슬라이스 통합으로 3개 엣지 해소).
- `pnpm build` — `tsc -b` + vite 프로덕션 빌드.
- `pnpm storybook` 기동 → `PageHeader` 스토리(`shared/ui/PageHeader`) 로드 확인.
- CI(`.github/workflows/ci.yml`)에서 lint→**lint:fsd**→test→build 그린 확인.

---

## 10. 후속: 게이트/자동화 강화 (FSD 독립)

> 아래는 FSD 폴더 이전과 **무관**하게 독립 진행 가능(선행 의존 없음). 위 FSD 강제(7단계)와
> 별개 트랙이다. (구 `claude-hooks-roadmap.md` 에서 흡수.)

- [ ] **`/tdd` 스킬** (RED→GREEN→REFACTOR) — `.claude/skills/tdd/SKILL.md`. `code-review` 스킬과
      같은 컨벤션. 예시: `src/utils/format.test.ts`(유닛), `src/pages/LoginPage.test.tsx`(컴포넌트+MSW).
      "RED 상태로 턴 종료 금지" 명시.
- [ ] **Stop 게이트에 vitest** — `pnpm exec vitest run --silent`. **`stop_hook_active` 무한루프
      가드 동반(필수)**. (7단계의 vitest 활성화와 동일 작업.)
- [ ] **Stop 게이트에 `prettier --check`** — 현재 누락. 켜기 전 트리 클린 확인.
- [ ] **(백로그) coverage 임계값 ratchet** — "작업마다 테스트 존재"까지 기계적 강제.
      `vitest run --coverage` + thresholds(`@vitest/coverage-v8`). 테스트 쌓인 뒤 점진 상향.
- [ ] **문서 동기화** — 게이트 변경 후 `CLAUDE.md` "vitest 게이트 비활성/주석" 문구 갱신.

### 메모 / 가드레일

- **무한루프 가드(필수)** — 현 `gate.sh` 는 stdin/`stop_hook_active` 미검사 → 테스트 게이트 추가
  시 반드시 시작부에서 stdin을 읽어 `stop_hook_active == true` 면 `exit 0`.
- **전체 트리 검사 주의** — `eslint .`/`prettier --check .` 는 세션이 안 건드린 기존 이슈에도
  막힌다(켜기 전 클린 확인).
- **게이트의 한계** — "회귀 방지"지 미작성 테스트는 못 잡는다 → `/tdd`(소프트) + coverage
  ratchet(하드)으로 보완.
- **성능** — 전체 `vitest run` 유지, 느려지면(>~10s) `vitest related --run`.
- **커밋 안전망** — husky/lint-staged 유지.
