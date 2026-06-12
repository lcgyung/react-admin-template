import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';
import { env } from '@/shared/config';
import { initSentry, reportWebVitals } from '@/shared/lib/observability';

// 에러 트래킹 초기화 — VITE_SENTRY_DSN 설정 시에만 동작(미설정 시 no-op).
void initSentry();

// VITE_ENABLE_MOCK=true 일 때만 MSW 목 서버를 기동한다.
async function enableMocking() {
  if (!env.VITE_ENABLE_MOCK) {
    return;
  }
  const { worker } = await import('@/app/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element(#root)를 찾을 수 없습니다.');

  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  void reportWebVitals();
});
