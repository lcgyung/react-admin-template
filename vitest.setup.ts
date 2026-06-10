import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '@/mocks/server';
import { configureAuthInterceptors } from '@/shared/api/axiosInstance';
import { clearAuthState, getAuthToken } from '@/stores/authStore';

// axios 인증 콜백 주입 (FSD 6단계에서 app/config/configureApi.ts 로 일원화 예정).
// 미주입 시 토큰 주입 동작이 조용히 비활성화된다 — 제거 금지. (jsdom 테스트라 리다이렉트는 생략)
configureAuthInterceptors({
  getToken: getAuthToken,
  onUnauthorized: clearAuthState,
});

// MSW: 테스트 전반에 걸쳐 목 서버를 기동/리셋/종료한다.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
