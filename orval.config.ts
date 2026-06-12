import { defineConfig } from 'orval';

/**
 * orval — OpenAPI 스펙(openapi/admin-api.yaml)에서 타입을 생성한다.
 *
 * 생성물은 src/shared/api/generated 에 떨어지며 커밋한다(오프라인·리뷰 가능, CI codegen 불필요).
 * 기존 수동 React Query 훅·MSW 핸들러와 충돌하지 않도록 클라이언트 훅·목은 쓰지 않고 모델 타입만
 * 소비한다. 도메인 단일 출처는 entities/user 가 유지한다(ADR 0004 참고).
 */
export default defineConfig({
  adminApi: {
    input: { target: './openapi/admin-api.yaml' },
    output: {
      // 모델 타입 + 우리 axiosInstance 를 받는 타입 클라이언트를 생성한다(react-query 훅·MSW 목은 미생성).
      // 데이터 레이어는 기존 수동 훅을 유지하고, 생성물에서는 DTO 타입을 소비한다(ADR 0004).
      mode: 'split',
      target: './src/shared/api/generated/endpoints.ts',
      // 'model' 은 FSD 예약 세그먼트명이라 'schemas' 로 둔다(steiger no-reserved-folder-names).
      schemas: './src/shared/api/generated/schemas',
      client: 'axios',
      clean: true,
      prettier: false,
      override: {
        header: () => ['생성물 — 직접 수정하지 마세요. `pnpm gen:api` 로 재생성합니다.'],
      },
    },
  },
});
