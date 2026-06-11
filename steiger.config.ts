import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

export default defineConfig([
  ...fsd.configs.recommended,
  // orval 생성물은 FSD 규칙 대상이 아니다.
  { ignores: ['src/shared/api/generated/**'] },
]);
