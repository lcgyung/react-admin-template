// Pretendard 폰트 로드(테마 fontFamily 1순위). @fontsource/pretendard 는 latin-only 라 한글이 빠지므로,
// 공식 pretendard 패키지의 variable dynamic-subset 을 쓴다(로컬 번들 → CSP 안전, 한글 unicode-range 지연 로드).
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

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
