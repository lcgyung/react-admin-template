import { z } from 'zod';

/**
 * 빌드타임/런타임 환경변수 검증.
 *
 * 모든 `VITE_` 접두 변수는 클라이언트 번들에 그대로 노출된다(시크릿 금지). 이 스키마는
 * 누락·형식 오류를 부팅 시점에 즉시 throw 해, 잘못된 설정으로 앱이 조용히 뜨는 것을 막는다.
 * 기본값(default)은 `.env` 파일이 로드되지 않는 테스트/게이트 환경과의 결합을 끊기 위한 것이다.
 */
const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  // 'true' 일 때만 MSW 목을 활성화(기존 동작 보존). 그 외/미설정은 false.
  VITE_ENABLE_MOCK: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  // 설정 시에만 Sentry 에러 트래킹을 활성화(미설정 시 no-op).
  VITE_SENTRY_DSN: z.string().url().optional(),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`환경변수 검증에 실패했습니다. .env 설정을 확인하세요:\n${detail}`);
}

export const env = parsed.data;
