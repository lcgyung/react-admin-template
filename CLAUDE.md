# CLAUDE.md

이 문서는 Claude Code(claude.ai/code)가 이 리포지토리에서 작업할 때 참고하는 가이드입니다.

**React Admin Template** — React + TypeScript + Vite 기반 관리자 템플릿. 기능 목록·기술 스택·
빠른 시작·데모 계정 등 개요는 [`README.md`](README.md)를 참고하세요. 이 문서는 모든 세션에
필요한 코어(명령어·구조·gotcha)만 담고, 주제별 상세 규칙은 `.claude/rules/`가 맡습니다(아래 인덱스).

## 언어 규칙

이 리포는 한국어 보일러플레이트다. Claude Code는 **모든 응답·코드 주석·문서·커밋/PR 설명을
한글로 통일**한다(한영 혼용 금지). 단, 다음은 영문을 유지한다:

- 커밋/PR 제목의 Conventional Commits 접두어 `type(scope):` — `feat`/`fix`/`chore` 등은
  `package.json` `commitlint` `type-enum`이 영문으로 강제하므로 그대로 둔다. **subject·body·PR
  본문만 한글**로 작성한다. 예: `chore(hooks): permission_mode 기반 하네스 분기 정비`.
- 코드 식별자(변수·함수·타입명), 라이브러리/API/명령어 이름, 표준 기술 용어.

> commitlint `subject-case`(대문자/sentence-case 시작 금지)와 충돌하지 않는다(한글은 해당 없음).

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
pnpm knip                        # dead code/unused export 탐지 (Pattern Contamination)

pnpm test                        # 단위/컴포넌트 테스트 (vitest run, jsdom)
pnpm test:watch                  # watch 모드
pnpm exec vitest run src/pages/login/ui/LoginPage.test.tsx   # 단일 파일
pnpm exec vitest run -t "짧은 비밀번호"                       # 테스트명(-t)으로 단일 케이스

pnpm exec tsc -b --noEmit        # 타입체크 단독 (project references; Stop 게이트가 사용)

pnpm gen:slice                   # FSD 슬라이스 골격 생성 (plop)
pnpm storybook                   # Storybook (6006)
```

> 전체 스크립트·데모 계정·환경 변수는 [`README.md`](README.md) 참고. 스크립트별 용도·사용 시점은
> `package.json` 의 `scriptsComments` 가 정본이다.

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

| 파일                                                               | 내용                                                                | 자동 로드 조건                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------- |
| [fsd-architecture.md](.claude/rules/fsd-architecture.md)           | FSD 의존성·상태관리(React Query/Zustand)·인증/RBAC                  | `src/**`                                  |
| [slice-blueprint.md](.claude/rules/slice-blueprint.md)             | 슬라이스 구현 골격·`gen:slice` 체크리스트                           | `src/{features,entities,shared}/**`, plop |
| [code-style.md](.claude/rules/code-style.md)                       | 컨벤션 해설(정본은 `eslint.config.js`)                              | `src/**/*.ts(x)`, `.storybook/**`         |
| [security.md](.claude/rules/security.md)                           | XSS·리다이렉트·CSP 정본 위치·시크릿 스캔                            | `src/**`, `nginx.conf`, CI 워크플로 등    |
| [testing.md](.claude/rules/testing.md)                             | MSW·커버리지 ratchet·테스트 실행법                                  | 테스트·mocks·vitest/playwright 설정       |
| [pattern-contamination.md](.claude/rules/pattern-contamination.md) | ELEMENT 1: 경쟁 패턴 통일·dead code 제거·`chore(cleanup)` 분리 커밋 | `src/**`                                  |

## Claude Code 자동화 (`.claude/`)

`.claude/settings.json` 이 훅을 등록한다. 코드를 만질 때 아래 동작을 전제로 한다.

- **SessionStart** → `session-context.sh`(현재 브랜치 주입) + `contamination-report.sh`(knip 으로 dead code/unused export 후보를 "오염 맵"으로 주입 — 탐지·인지 전용, 옵트인 `CC_CONTAMINATION_REPORT=1`. 캐시·타임아웃·미설치 시 비차단. 정책 정본 `.claude/rules/pattern-contamination.md`) + `autocommit-baseline.sh`(세션 시작 시점의 기존 dirty 파일 내용 해시를 baseline 으로 **항상 기록** — gate.sh 가 "현재 세션이 바꾼 파일"을 가려내 **스코프 검증**과 **자동 커밋 넛지** 양쪽의 근거로 쓴다. CC_AUTOCOMMIT 토글과 무관하게 기록하되, 넛지 발동 자체는 gate.sh 의 CC_AUTOCOMMIT 가드가 통제).
- **PreToolUse(Bash)** → `guard-bash.sh`: 파괴적 명령(`rm -rf /`, force push, `reset --hard` 등)을 차단.
  acceptEdits/bypassPermissions 모드에서는 추가 규칙(`git clean -f`, `curl|sh` 파이프 실행,
  `git checkout/restore .`)을 강화 — 사용자 확인이 줄어드는 모드일수록 훅이 보상 통제.
  `permission_mode`를 못 읽으면(빈/미지 값) 강화 규칙을 적용한다 — 판단 불가 시 강하게(fail-closed).
- **PostToolUse(Edit/Write)** → `format-changed-file.sh`: 변경된 `*.ts(x)` 에 `prettier` + `eslint --fix` 자동 적용.
- **Stop** → `gate.sh`: 세션 종료 전 **스코프 검증** 게이트. 현재 세션이 바꾼 파일에만 `eslint`·`prettier --check`·`vitest related`(관련 테스트, 커버리지 미포함)를 돌리고, 전체 그래프 검사인 `tsc -b --noEmit`·`steiger ./src`(FSD)는 전체 실행·전체 차단한다(파일 단위로 못 쪼갬). 검사 명령은 package.json scripts 경유이며 5종을 병렬 실행 + 명령별 타임아웃(`CC_GATE_TIMEOUT`, 기본 180초)을 건다. 같은 브랜치의 타 작업(병렬 편집·기존 WIP)이 내 검증을 막지 않게 함이 목적 — 전체 정본(전체 커버리지 포함)은 `pnpm verify`·CI. 실패하면 `exit 2` 로 계속 수정을 유도한다. baseline 이 없으면 안전하게 전체 5종 게이트로 폴백. `stop_hook_active` 무한루프 가드 포함, plan mode(`permission_mode == "plan"`) 스킵.
  - **자동 커밋 넛지**(옵트인 `CC_AUTOCOMMIT=1`, settings.json env): 게이트가 green 이고 **현재
    세션이 바꾼 추적 파일**이 미커밋이면 `exit 2` 로 커밋을 지시한다. 훅은 직접 커밋하지 않고
    **메시지 작성·`git add -- <세션 파일>` + 커밋은 Claude 가** 수행한다 — 메시지는 위 "언어
    규칙"(접두어 영문·subject/body 한글), 오염 정리는 [pattern-contamination](.claude/rules/pattern-contamination.md)
    의 `chore(cleanup)` 단독 커밋 규칙을 따른다. **현재 세션 작업만 스코프**: SessionStart
    `autocommit-baseline.sh` 가 기록한 시작 시점 내용 해시와 비교해 세션이 새로 만들었거나 더 편집한
    파일이 대상. 그중 **세션 시작 시 clean 이던(own)** 파일만 자동 커밋 넛지하고, **세션 시작 시 이미
    dirty 였던(overlap — 병렬/기존 작업과 겹침)** 파일은 자동 커밋하지 않고 보류해, 그 작업이 끝날 때까지
    대기 후 `AskUserQuestion` 으로 방향(채택/유지/복원) 확인을 지시한다. 손대지 않은 **기존 WIP 는
    제외**(baseline 없으면 전체 변경 기준으로 폴백). 보호 브랜치
    (`CC_AUTOCOMMIT_PROTECT`, 기본 `main`/`master`)·세션 변경 없음·untracked-only 는 스킵. 끄려면
    env 키 제거. `--no-verify` 금지. 매 턴 잔소리를 막기 위해 **세션 스코프 변경 내용이 직전 넛지와
    같으면 재발동하지 않는다**.
- 훅 공용 헬퍼는 `.claude/hooks/lib.sh`(순수 bash 타임아웃 래퍼·repo 루트 이동·git-dir 해석·세션 ID·
  SessionStart 컨텍스트 출력)에 모여 있다 — 새 훅은 중복 정의 대신 이걸 `source` 한다.
- `.claude/agents/code-reviewer.md`(리뷰 실행 서브에이전트), `.claude/skills/code-review/`(리뷰 기준),
  `.claude/skills/contamination-sweep/`(전체 코드베이스 Pattern Contamination 정기 스윕 — 전용 세션)가 함께 제공된다.
- 디시플린 스킬 — 작업 종류에 맞춰 자동 노출된다:
  `.claude/skills/test-driven-development/`(테스트 우선 RED-GREEN-REFACTOR),
  `.claude/skills/systematic-debugging/`(근본원인 4단계),
  `.claude/skills/receiving-code-review/`(리뷰 받기 규율),
  `.claude/skills/writing-plans/`(plan mode 승인 계획을 `docs/plans/`에 영구 기록).
- 커밋 시 Husky가 gitleaks+lint-staged+**스코프 검증**(pre-commit)·commitlint(commit-msg, 설정은
  `package.json` `commitlint` 키)를 강제한다. pre-commit 은 staged 파일 기준: lint-staged(eslint
  --fix·prettier --write)로 포맷·린트를 스코프하고, `tsc -b`·`steiger`는 전체 차단, 테스트는 staged
  변경 관련만(`test:related`, 커버리지 미포함) — 무관한 미staged WIP 가 커밋을 막지 않는다. **전체 5종
  정본** `pnpm verify`(typecheck·lint·format:check·lint:fsd·test:coverage)는 **PR 전 로컬 풀 검증·CI
  파리티**로 남긴다. subject는 대문자/sentence-case 시작 금지(`subject-case`).

## 문서 지도

- 설계 결정(왜): [`docs/adr/`](docs/adr/README.md) — 상태관리·FSD·orval·토큰 저장·관찰가능성·CSP·디자인 시스템·데모/실배포·백엔드-우선.
- 실행 계획 아티팩트: [`docs/plans/`](docs/plans/README.md) — plan mode 승인 계획을 영구 기록(작성 규약은 `.claude/skills/writing-plans`).
