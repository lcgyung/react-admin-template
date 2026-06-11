import type { Metric } from 'web-vitals';

/**
 * Core Web Vitals 수집.
 *
 * dev 에서는 콘솔에 출력하고, 운영에서는 측정값을 분석/모니터링 백엔드로 전송하도록 확장한다.
 * web-vitals 는 동적 import 라 기본 번들에 포함되지 않는다.
 */
export const reportWebVitals = async (): Promise<void> => {
  const { onCLS, onFCP, onINP, onLCP, onTTFB } = await import('web-vitals');

  const report = (metric: Metric): void => {
    if (import.meta.env.DEV) {
      console.info(`[web-vitals] ${metric.name}: ${Math.round(metric.value)}`);
    }
    // 운영: 분석/모니터링 백엔드로 전송하도록 확장(외부 연동은 사용자 몫).
  };

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);
};
