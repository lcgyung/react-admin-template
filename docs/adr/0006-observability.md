# 0006. 관찰가능성 — Sentry / Web Vitals (env-gated 스텁)

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

에러 트래킹·성능 모니터링은 운영에 필요하지만, 외부 계정(Sentry DSN)과 시크릿·소스맵 업로드 설정이
필요하다. 템플릿이 특정 벤더 연동을 강제하거나 더미 DSN 을 들고 다니게 하고 싶지 않다.

## 결정

연동 코드는 넣되 **환경변수로 게이트**한다. 실제 연동(계정·DSN·소스맵)은 사용자 몫이다.

- `src/shared/lib/observability/` 에 `initSentry`/`reportError`/`reportWebVitals` 를 둔다.
- `initSentry()` 는 `VITE_SENTRY_DSN` 이 설정된 경우에만 동작한다(미설정 시 no-op). `@sentry/react`·
  `web-vitals` 는 **동적 import** 라 기본 번들에 포함되지 않는다.
- `ErrorBoundary`(shared/ui)는 Sentry 에 직접 의존하지 않고, `onError` prop 으로 `reportError` 를
  주입받는다(app 레이어에서 연결). shared 가 상위 레이어에 의존하지 않게 하는 경계다.

## 대안

- 벤더 SDK 를 항상 초기화: DSN 없이도 코드가 돌지만 불필요한 번들·요청이 생긴다.
- 관찰가능성 제외: 운영 준비도가 떨어진다.

## 결과

- DSN 만 설정하면 에러 트래킹이 켜진다. 미설정 시 비용 0.
- 운영 전 권장: 소스맵 비공개 업로드, PII 스크러빙, `tracesSampleRate` 조정.
