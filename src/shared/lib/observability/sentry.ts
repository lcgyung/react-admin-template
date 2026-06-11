import type { ErrorInfo } from 'react';

import { env } from '@/shared/config';

let enabled = false;

/**
 * Sentry 초기화 — `VITE_SENTRY_DSN` 이 설정된 경우에만 동작한다(미설정 시 no-op).
 *
 * 실제 SDK 는 DSN 이 있을 때만 동적 import 되어 기본 번들에 포함되지 않는다.
 * DSN 발급·소스맵 업로드·PII 스크러빙 등 실연동은 사용자 몫이다(README·ADR 0006 참고).
 */
export const initSentry = async (): Promise<void> => {
  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const Sentry = await import('@sentry/react');
  Sentry.init({ dsn, environment: import.meta.env.MODE, tracesSampleRate: 0 });
  enabled = true;
};

/**
 * 캐치된 에러를 보고한다. Sentry 활성 시 전송하고, 그렇지 않으면 dev 콘솔에 남긴다.
 *
 * ErrorBoundary 의 `onError` 로 주입해 shared 레이어가 app/관찰 도구에 직접 의존하지 않게 한다.
 */
export const reportError = (error: unknown, info?: ErrorInfo): void => {
  if (enabled) {
    void import('@sentry/react').then((Sentry) => Sentry.captureException(error));
  } else if (import.meta.env.DEV) {
    console.error('[observability] uncaught error', error, info);
  }
};
