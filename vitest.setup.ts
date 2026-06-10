import '@testing-library/jest-dom/vitest';
// 제거 금지: axios 토큰 주입을 활성화하는 side-effect import (미주입 시 조용히 no-op).
import '@/app/config/configureApi';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '@/app/mocks/server';

// MSW: 테스트 전반에 걸쳐 목 서버를 기동/리셋/종료한다.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
