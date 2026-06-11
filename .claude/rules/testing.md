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

## 목 API (MSW)

- `VITE_ENABLE_MOCK=true` 일 때 `src/main.tsx`가 MSW 워커를 기동한다.
- 핸들러는 `src/app/mocks/handlers.ts`(로그인/로그아웃/me/users), 시드 데이터는 `src/app/mocks/data.ts`.
- 테스트에서는 `src/app/mocks/server.ts`(setupServer)를 `vitest.setup.ts`가 기동한다 —
  테스트에서 네트워크를 직접 스텁하지 말고 MSW 핸들러를 경유한다.
- 데모 계정과 환경 변수(`VITE_ENABLE_MOCK` / `VITE_API_BASE_URL`)는 `README.md` 와 `.env.example` 참고.

## 실행

```bash
pnpm test                        # vitest run (jsdom) — e2e/ 는 제외
pnpm exec vitest run src/pages/login/ui/LoginPage.test.tsx   # 단일 파일
pnpm exec vitest run -t "짧은 비밀번호"                       # 테스트명(-t)으로 단일 케이스
pnpm test:e2e                    # Playwright (preview:4173 기준)
```

## 커버리지 ratchet

- `pnpm test:coverage`(v8)가 `vite.config.ts`의 임계값을 강제하고 CI의 test 스텝이 이를 사용한다.
- 임계값은 현재 베이스라인 아래로 고정돼 있고, 테스트를 추가하며 PR마다 **점진 상향**한다.
  **하향 금지.** (Stop 게이트의 `vitest run`은 속도를 위해 coverage 미포함.)
