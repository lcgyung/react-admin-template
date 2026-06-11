# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

**React Admin Template** — React + TypeScript + Vite 기반 관리자 템플릿. 기능 목록·기술 스택·
빠른 시작·데모 계정 등 개요는 [`README.md`](README.md)를 참고하세요. 이 문서는 모든 세션에
필요한 코어(명령어·구조·gotcha)만 담고, 주제별 상세 규칙은 `.claude/rules/`가 맡습니다(아래 인덱스).

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

pnpm gen:slice                   # FSD 슬라이스 골격 생성 (plop)
pnpm storybook                   # Storybook (6006)
```

> 전체 스크립트·데모 계정·환경 변수는 [`README.md`](README.md) 참고.

## 프로젝트 구조 (FSD 6레이어)

경로 별칭: `@/*` → `src/*` (`tsconfig`, `vite.config.ts` 양쪽에 설정).

```text
src
├── app          # 전역 설정 — providers(App/Query), router(라우터+가드), mocks(MSW), config(configureApi)
├── pages        # 라우트 화면 슬라이스 — login(+test) / dashboard / users / forbidden / not-found
├── widgets      # 합성 UI 블록 — main-layout(MainLayout+Sidebar+Header 통합 셸), auth-layout
├── features     # 사용자 기능 — auth / users / theme
├── entities     # 도메인 모델 — user(User/Role 타입 + @x/session), session(authStore)
└── shared       # 도메인 무관 인프라 — api(axiosInstance), ui, lib, config
```

FSD 핵심 3줄: 레이어는 **단방향**(`app > pages > widgets > features > entities > shared`),
슬라이스 간 import는 **Public API 배럴 경유**(같은 레이어 간 금지, `@x` 예외),
위반은 `pnpm lint:fsd`(steiger)가 CI·Stop 게이트에서 **error로 차단** — 상세는
[rules/fsd-architecture.md](.claude/rules/fsd-architecture.md).

## ⚠️ axios 인증 브리지 (gotcha)

`shared/api/axiosInstance.ts`는 도메인 의존이 0이며, 인증 콜백(getToken/onUnauthorized)은
`app/config/configureApi.ts`가 주입한다. `app/App.tsx`와 `vitest.setup.ts` 최상단의
side-effect import(`@/app/config/configureApi`)를 **제거하면 타입 에러 없이 토큰 주입·401
리다이렉트가 조용히 무력화**된다 — 제거 금지.

## 규칙 인덱스 (`.claude/rules/`)

주제별 상세 규칙은 path-scoped rules로 분리되어, 매칭 파일 작업 시 자동 로드됩니다.
paths에 안 걸리는 작업에서 해당 주제를 다루면 직접 Read 하세요.

| 파일                                                     | 내용                                               | 자동 로드 조건                            |
| -------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| [fsd-architecture.md](.claude/rules/fsd-architecture.md) | FSD 의존성·상태관리(React Query/Zustand)·인증/RBAC | `src/**`                                  |
| [slice-blueprint.md](.claude/rules/slice-blueprint.md)   | 슬라이스 구현 골격·`gen:slice` 체크리스트          | `src/{features,entities,shared}/**`, plop |
| [code-style.md](.claude/rules/code-style.md)             | 컨벤션 해설(정본은 `eslint.config.js`)             | `src/**/*.ts(x)`, `.storybook/**`         |
| [security.md](.claude/rules/security.md)                 | XSS·리다이렉트·CSP 정본 위치·시크릿 스캔           | `src/**`, `nginx.conf`, CI 워크플로 등    |
| [testing.md](.claude/rules/testing.md)                   | MSW·커버리지 ratchet·테스트 실행법                 | 테스트·mocks·vitest/playwright 설정       |

## Claude Code 자동화 (`.claude/`)

`.claude/settings.json` 이 훅을 등록한다. 코드를 만질 때 아래 동작을 전제로 한다.

- **SessionStart** → `session-context.sh`: 현재 브랜치를 컨텍스트로 주입.
- **PreToolUse(Bash)** → `guard-bash.sh`: 파괴적 명령(`rm -rf /`, force push, `reset --hard` 등)을 차단.
- **PostToolUse(Edit/Write)** → `format-changed-file.sh`: 변경된 `*.ts(x)` 에 `eslint --fix` + `prettier` 자동 적용.
- **Stop** → `gate.sh`: 세션 종료 전 `tsc -b --noEmit` + `eslint .` + `prettier --check .` + `steiger ./src`(FSD) + `vitest run` 게이트. 실패하면 `exit 2` 로 계속 수정을 유도한다. `stop_hook_active` 무한루프 가드 포함.
- `.claude/agents/code-reviewer.md`(리뷰 실행 서브에이전트), `.claude/skills/code-review/`(리뷰 기준)가 함께 제공된다.
- 커밋 시 Husky가 gitleaks+lint-staged(pre-commit)·commitlint(commit-msg, 설정은 `package.json`
  `commitlint` 키)를 강제한다. subject는 대문자/sentence-case 시작 금지(`subject-case`).

## 문서 지도

- 설계 결정(왜): [`docs/adr/`](docs/adr/README.md) — 상태관리·FSD·orval·토큰 저장·관찰가능성·CSP.
