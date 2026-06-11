# 0002. 상태 관리 — React Query + Zustand

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

관리자 앱은 (1) 서버에서 온 비동기 데이터(사용자 목록 등)와 (2) 클라이언트 전역 상태(인증 세션,
테마)를 모두 다룬다. 둘을 하나의 전역 스토어로 관리하면 캐싱·로딩·무효화 로직을 직접 구현해야 한다.

## 결정

- **서버 상태 → TanStack Query(React Query)**: 캐싱·로딩·에러·무효화를 표준화한다. 컴포넌트는
  axios 를 직접 호출하지 않고 `features/*` 의 훅(`useAuth`, `useUsers`)을 거친다. queryKey 는
  `authKeys`/`userKeys` 상수 객체로 관리한다.
- **클라이언트 전역 상태 → Zustand(persist)**: `entities/session`(authStore), `features/theme`
  (themeStore). React 외부(axios 인터셉터)에서는 `getAuthToken()`/`clearAuthState()` 헬퍼로 접근한다.

## 대안

- 단일 Redux 스토어: 서버 캐싱을 직접 구현해야 하고 보일러플레이트가 많다.
- Context 만 사용: 캐싱·리페치·무효화가 빈약하다.

## 결과

- 서버/클라 상태 책임이 명확히 분리된다.
- 두 라이브러리를 함께 쓰는 학습 비용이 있으나, 각자의 역할이 좁아 혼선은 적다.
