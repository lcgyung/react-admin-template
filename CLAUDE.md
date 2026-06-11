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

## 자주 쓰는 명령어

```bash
pnpm dev                         # 개발 서버 (5173)
pnpm build                       # tsc -b 타입체크 + vite build
pnpm preview                     # 빌드 산출물 로컬 미리보기
pnpm lint                        # eslint .
pnpm lint:fsd                    # steiger ./src — FSD 레이어/Public API 규칙 (CI·Stop 게이트가 사용)
pnpm format                      # prettier --write .

pnpm test                        # 단위/컴포넌트 테스트 (vitest run, jsdom)
pnpm test:watch                  # watch 모드
pnpm exec vitest run src/pages/login/ui/LoginPage.test.tsx   # 단일 파일
pnpm exec vitest run -t "짧은 비밀번호"                       # 테스트명(-t)으로 단일 케이스

pnpm exec tsc -b --noEmit        # 타입체크 단독 (project references; Stop 게이트가 사용)

pnpm storybook                   # Storybook (6006)
pnpm build-storybook             # 정적 Storybook 빌드
```

> 전체 스크립트·데모 계정·환경 변수는 [`README.md`](README.md) 참고.

## 프로젝트 구조 (FSD 6레이어)

경로 별칭: `@/*` → `src/*` (`tsconfig`, `vite.config.ts` 양쪽에 설정).
[Feature-Sliced Design 2.x](https://feature-sliced.design) 구조이며 `pnpm lint:fsd`(Steiger,
`steiger.config.ts` = recommended)가 규칙을 하드 강제합니다.

```text
src
├── app          # 전역 설정 — providers(App/Query), router(라우터+가드), mocks(MSW), config(configureApi)
├── pages        # 라우트 화면 슬라이스 — login(+test) / dashboard / users / forbidden / not-found
├── widgets      # 합성 UI 블록 — main-layout(MainLayout+Sidebar+Header 통합 셸), auth-layout
├── features     # 사용자 기능 — auth(useAuth·authApi·loginSchema), users(useUsers·usersApi·userFormSchema), theme(themeStore+ThemeProvider)
├── entities     # 도메인 모델 — user(User/Role 타입 + @x/session), session(authStore)
└── shared       # 도메인 무관 인프라 — api(axiosInstance), ui(Loading/PageHeader/StatCard), lib(format), config(paths)
```

(`main.tsx`·`vite-env.d.ts`는 루트 유지 — 진입점/ambient 타입.)

### FSD 의존성 규칙

- **레이어 단방향**: `app > pages > widgets > features > entities > shared`. 모듈은 자기보다
  **엄격히 아래** 레이어만 import할 수 있다.
- **같은 레이어 슬라이스 간 import 금지**. 유일한 예외는 `@x` 크로스임포트 API —
  `entities/session`은 `@/entities/user/@x/session`에서 `User`를 가져온다.
- **Public API**: 슬라이스 간 import는 반드시 `index.ts` 배럴 경유(`@/features/auth`,
  `@/widgets/main-layout` 등 — 내부 깊은 경로 우회 금지). `shared`는 세그먼트 배럴 경유
  (`@/shared/api`, `@/shared/config`; `@/shared/ui/<Name>`, `@/shared/lib/<name>`은 그대로).
- **세그먼트 이름은 "왜"로**: `ui / api / model / lib / config`. `components`/`hooks` 같은
  "무엇" 이름 금지.
- 위반은 `pnpm lint:fsd`가 CI·Stop 게이트에서 error로 차단한다.

## 아키텍처 / 상태 관리 규칙

- **서버 상태** → React Query. 컴포넌트에서 직접 `axios`를 호출하지 말고 `features/*`의
  React Query 훅(`useAuth`, `useUsers`)을 거칩니다.
- **API 호출** → `features/*/api`의 Axios 레이어 함수로 정의(슬라이스 내부용, 배럴 미노출).
  `shared/api`의 `axiosInstance`가 요청 인터셉터로 토큰을 주입하고, 응답 인터셉터로 401 시
  인증 상태를 초기화하고 `/login`으로 보냅니다.

  ```typescript
  export const getUsers = async () => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  };
  ```

- ⚠️ **axios 인증 브리지(gotcha)** — `shared/api/axiosInstance.ts`는 도메인 의존이 0이며,
  인증 콜백(getToken/onUnauthorized)은 `app/config/configureApi.ts`가 주입한다.
  `app/App.tsx`와 `vitest.setup.ts` 최상단의 side-effect import(`@/app/config/configureApi`)를
  **제거하면 타입 에러 없이 토큰 주입·401 리다이렉트가 조용히 무력화**된다 — 제거 금지.
- **전역 클라이언트 상태** → Zustand. `entities/session`(authStore: token/user, persist),
  `features/theme`(themeStore: light/dark, persist). React 외부(주입 콜백)에서는
  `getAuthToken()` / `clearAuthState()` 헬퍼로 접근합니다.
- **폼 / 검증** → React Hook Form + Zod. 스키마는 해당 feature의 `model` 세그먼트에 정의하고
  (`features/auth/model/loginSchema.ts`, `features/users/model/userFormSchema.ts`)
  `zodResolver`로 연결합니다.

## 인증 & RBAC

- 로그인 성공 시 `authStore`(`entities/session`)에 `token`/`user`를 저장(persist)합니다.
- 라우트 가드는 `src/app/router`에 있습니다.
  - `ProtectedRoute` — 미인증 시 `/login` 리다이렉트.
  - `RoleRoute` — `allowedRoles` 미충족 시 `/403` 리다이렉트.
- 사이드바 메뉴는 `widgets/main-layout/ui/Sidebar.tsx`의 `menuItems[].allowedRoles`로 역할 필터링됩니다.
- 역할: `'admin' | 'manager' | 'user'`. `/users`는 `admin`/`manager`만 접근 가능합니다.
- RBAC는 프런트엔드(메뉴·라우트) 차원의 제어입니다. 실제 데이터 권한은 백엔드에서 강제해야 합니다.

## 목 API (MSW)

- `VITE_ENABLE_MOCK=true` 일 때 `src/main.tsx`가 MSW 워커를 기동합니다.
- 핸들러는 `src/app/mocks/handlers.ts`(로그인/로그아웃/me/users), 시드 데이터는 `src/app/mocks/data.ts`.
- 테스트에서는 `src/app/mocks/server.ts`(setupServer)를 `vitest.setup.ts`가 기동합니다.
- 데모 계정과 환경 변수(`VITE_ENABLE_MOCK` / `VITE_API_BASE_URL`)는 `README.md` 와 `.env.example` 참고.

## 코드 컨벤션

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양합니다.
  `tsconfig`에 `strict`, `noUnusedLocals/Parameters`가 켜져 있습니다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성합니다.
- **컴포넌트 선언은 화살표 함수** — `react/function-component-definition`이 `const X = () => …`를
  강제합니다(autofix). `default export`는 쓰지 않고 named export로 통일합니다. props는
  `interface NameProps`(PascalCase)로 정의합니다.
- **네이밍** — 컴포넌트/타입 `PascalCase`, 훅 `use*`, 함수/변수 `camelCase`, 모듈 상수 `UPPER_CASE`,
  상수 객체(queryKeys 등) `camelCase`. `@typescript-eslint/naming-convention`이 `warn`으로 노출합니다.
- **import 정렬(자동)** — `simple-import-sort`가 `side-effect → 외부 → @/ 레이어(app→shared) → 상대경로`
  순으로 자동 정렬합니다. 수동으로 맞추지 말고 `--fix`에 맡깁니다. 단, side-effect import
  (`import '@/app/config/configureApi'`)는 정렬 장벽으로 위치가 보존됩니다.
- **queryKey는 객체 패턴** — React Query 키는 `userKeys`/`authKeys` 같은 상수 객체로 관리하고,
  배열 리터럴을 하드코딩하지 않습니다.
- **enum 단일 출처** — `Role` 등 도메인 값은 `entities`의 `ROLES`(`entities/user`)를 단일 출처로
  재사용합니다(`z.enum(ROLES)`). 문자열 배열 중복 정의 금지.
- **MUI 스타일** — 색·간격·타이포는 theme 토큰(`sx`/`styled`, `theme.spacing()`)을 사용하고
  하드코딩 `#hex`/`px`를 지양합니다. 인라인 `style` 대신 `sx`를 쓰고, `sx`에 매 렌더 새 객체를
  남발하지 않습니다(불필요한 리렌더 방지).
- **접근성(a11y)** — `eslint-plugin-jsx-a11y` recommended를 강제합니다. 인터랙티브 요소의
  label/aria/role·키보드 접근 위반은 린트에서 막힙니다.
- **ESLint + Prettier** — 모든 코드는 린트/포매팅 규칙을 통과해야 합니다 (`pnpm lint`, `pnpm format`).
- **테스트 커버리지(ratchet)** — `pnpm test:coverage`(v8)가 `vite.config.ts`의 임계값을 강제하고
  CI의 test 스텝이 이를 사용합니다. 현재 베이스라인 아래로 고정돼 있고, 테스트를 추가하며 PR마다
  임계값을 점진 상향합니다. (Stop 게이트의 `vitest run`은 속도를 위해 coverage 미포함.)
- **JSDoc 범위** — JSDoc/주석은 공개 API(배럴로 노출되는 함수·훅)와 비자명한 로직·함정(gotcha)에
  한정합니다(예: `shared/api/axiosInstance.ts`의 인증 브리지 주석). 자명한 컴포넌트엔 생략합니다.
- **Husky + Lint-Staged** — 커밋 시 변경 파일에 자동으로 `eslint --fix` + `prettier`가 적용되고,
  `commit-msg` 훅의 commitlint가 Conventional Commits 형식을 강제합니다. `.editorconfig`로 에디터
  기본값(lf·2 space)을 통일합니다.

## Claude Code 자동화 (`.claude/`)

`.claude/settings.json` 이 훅을 등록한다. 코드를 만질 때 아래 동작을 전제로 한다.

- **SessionStart** → `session-context.sh`: 브랜치 등 컨텍스트를 주입.
- **PreToolUse(Bash)** → `guard-bash.sh`: 파괴적 명령(`rm -rf /`, force push, `reset --hard` 등)을 차단.
- **PostToolUse(Edit/Write)** → `format-changed-file.sh`: 변경된 `*.ts(x)` 에 `eslint --fix` + `prettier` 자동 적용.
- **Stop** → `gate.sh`: 세션 종료 전 `tsc -b --noEmit` + `eslint .` + `prettier --check .` + `steiger ./src`(FSD) + `vitest run` 게이트. 실패하면 `exit 2` 로 계속 수정을 유도한다. `stop_hook_active` 무한루프 가드 포함.
- `.claude/agents/code-reviewer.md`, `.claude/skills/code-review/` 가 함께 제공된다.
