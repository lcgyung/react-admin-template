---
paths:
  - 'src/**/*.test.ts'
  - 'src/**/*.test.tsx'
  - 'src/**/*.spec.ts'
  - 'src/**/*.spec.tsx'
  - 'src/app/mocks/**'
  - 'e2e/**'
  - 'vitest.setup.ts'
  - 'vite.config.ts'
  - 'playwright.config.ts'
---

# 테스트 & 목 API 규칙

> 테스트를 **코드보다 먼저** 쓰는 워크플로(RED-GREEN-REFACTOR)는 `.claude/skills/test-driven-development`
> 스킬이 담당한다. 이 rule 은 그 테스트가 **무엇을 / 어떻게**(MSW 경유·entity 비대상·커버리지 래칫)
> 돌아야 하는지의 정본이다.

## 목 API (MSW) — 테스트 전용 + 데모 옵트인

MSW 는 데모 백엔드가 아니라 **테스트/데모 픽스처**다(백엔드-우선 워크플로, [ADR 0011](../../docs/adr/0011-backend-first-workflow.md)).

- **단위/컴포넌트 테스트**: `vitest.setup.ts`가 `src/app/mocks/server.ts`(setupServer)를 **항상** 기동한다 —
  테스트에서 네트워크를 직접 스텁하지 말고 MSW 핸들러를 경유한다.
- **데모 모드(옵트인)**: 기본(dev/preview/`pnpm build`)은 MSW OFF(실 백엔드 전제). 백엔드 없이 띄우려면
  `vite --mode demo`/`pnpm build:demo`(`.env.demo`의 `VITE_ENABLE_MOCK=true`) — `src/main.tsx`가 워커를 기동한다.
  e2e(Playwright)·lighthouse CI 가 이 모드를 쓴다.
- 핸들러는 `src/app/mocks/handlers.ts`(로그인/로그아웃/me/users 샘플), 시드는 `src/app/mocks/data.ts`.
- 데모 계정·환경 변수는 `README.md` 와 `.env.demo`/`.env.example` 참고.

## 실행

```bash
pnpm test                        # vitest run (jsdom) — e2e/ 는 제외
pnpm exec vitest run src/pages/login/ui/LoginPage.test.tsx   # 단일 파일
pnpm exec vitest run -t "짧은 비밀번호"                       # 테스트명(-t)으로 단일 케이스
pnpm test:e2e                    # Playwright (preview:4173 기준)
```

## 커버리지 ratchet

- `pnpm test:coverage`(v8)가 `vite.config.ts`의 임계값을 강제하고 CI 의 test 스텝·`pnpm verify` 가 이를 사용한다.
- 로컬 게이트(Stop `gate.sh`·pre-commit)는 `vitest related`(변경 파일 관련 테스트만, 커버리지 미포함)로
  빠르게 검증한다 — **전체 커버리지 ratchet 은 `pnpm verify`·CI 가 강제**한다.
- 임계값은 현재 베이스라인 아래로 고정돼 있고, 테스트를 추가하며 PR마다 **점진 상향**한다. **하향 금지.**
