// 제거 금지: axios 토큰 주입·401 리다이렉트를 활성화하는 side-effect import.
// 빠지면 타입 에러 없이 인증 인터셉터가 조용히 no-op이 된다 (CLAUDE.md 인증 섹션 참고).
import '@/app/config/configureApi';

import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './providers/AppProviders';
import { router } from './router/router';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
