# 0008. 데모/실배포 전환 메커니즘 — 추적 prod=데모, local/CI 오버라이드

- 상태: Superseded by [0011](0011-backend-first-workflow.md)
- 날짜: 2026-06-18

> **대체됨([0011](0011-backend-first-workflow.md)):** 백엔드-우선 워크플로 채택으로 "추적 prod=데모"
> (전략 B)는 폐기됐다. 기본 빌드(`pnpm build`)는 **실 백엔드 전제(MSW OFF)**가 되고, 데모는 `--mode demo`
> (`.env.demo`, `pnpm build:demo`)로 명시 옵트인한다(아래에서 기각했던 **전략 A** 를 채택). e2e·lighthouse 가
> 데모 모드를 사용한다. 아래 본문은 이력으로 보존한다.

## 맥락

이 템플릿의 정체성은 "MSW 목으로 백엔드 없이 즉시 동작하는 한국어 보일러플레이트"였다. 실제 백엔드는
아직 없고, 데모 → 실서비스 전환 절차도 코드/문서에 흩어져 있었다. 전환을 준비하되 다음 제약을 지켜야 한다.

- dev/단위테스트는 MSW 목을 **유지**한다(백엔드 없이 개발·테스트 가능해야 함). MSW 제거 금지.
- 토큰 저장 전환([ADR 0005](0005-token-storage.md))은 범위 밖.

추적되는 `.env.production`은 기본 `pnpm build` 가 로드하는 파일이고, 이 기본 빌드를
[playwright.config.ts](../../playwright.config.ts)(`build && preview` 후 데모 계정 로그인 검증),
[ci.yml](../../.github/workflows/ci.yml)(`build`·`lighthouse`·`e2e` 잡), [Dockerfile](../../Dockerfile)이
모두 **데모(MSW ON)** 로 전제했다. 즉 "전환"을 추적 파일에 박으면 이 결합 지점이 한꺼번에 깨진다.

## 결정

**전략 B — 추적되는 `.env.production`은 데모 기본값으로 유지하고, 실 배포는 오버라이드한다.**

- 로컬/수동 빌드: gitignore된 `.env.production.local`(`VITE_ENABLE_MOCK=false` + 실 `VITE_API_BASE_URL`).
  Vite 모드 우선순위상 `.env.production.local` > `.env.production` 으로 자동 적용된다.
- CI/CD: 빌드 잡에서 환경변수/시크릿/`--build-arg` 주입(빌드타임 정적 치환).
- 추적되는 `.env.production.local.example` 을 오버라이드 템플릿으로 제공한다(전환 배경은
  [0011](0011-backend-first-workflow.md)).

### 고려한 대안 — 전략 A (기각 → 0011에서 채택)

`.env.production`을 `VITE_ENABLE_MOCK=false`로 바꾸고 데모를 별도 모드(`vite build --mode demo` +
`.env.demo`)로 분리하는 방식. 당시 기각 이유:

- playwright·CI·Dockerfile 4곳의 빌드 커맨드를 동시에 데모 모드로 바꿔야 해 변경 폭이 크고 데모 회귀 위험이 있다.
- 실 주소가 없는 시점에 `.env.production`을 `MOCK=false`로 바꾸면 `baseURL=localhost`라 **어디에도 못 붙는
  죽은 설정**이 커밋된다 — "전환 준비"가 아니라 "반쯤 깨진 상태"가 된다.

## 트레이드오프

- 단점: "기본 `pnpm build` = 데모 빌드"라는 사실을 모르면 실 주소 없이 배포하는 실수를 할 수 있다.
- B는 A로 가는 길을 막지 않는다. 백엔드가 안정화되어 "기본 빌드가 실서비스여야 한다"가 되면 전략 A로 이전한다.

## 결과

- (당시) playwright/CI/Docker 등 결합 지점을 하나도 건드리지 않아 데모 동작·CI 그린이 그대로 유지됐다.
- 이후 백엔드-우선 워크플로([0011](0011-backend-first-workflow.md))를 채택하며 **전략 A로 전환**했다 — 기본 빌드는
  실 백엔드 전제, 데모는 `--mode demo`(e2e·lighthouse). 본 ADR은 그 의사결정 이력으로 보존한다.
