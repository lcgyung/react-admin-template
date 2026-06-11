/**
 * 생성물 — 직접 수정하지 마세요. `pnpm gen:api` 로 재생성합니다.
 */
import type { Role } from './role';

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
}
