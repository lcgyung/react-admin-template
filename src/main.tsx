import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';

// VITE_ENABLE_MOCK=true 일 때만 MSW 목 서버를 기동한다.
async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import('@/mocks/browser');
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
});
