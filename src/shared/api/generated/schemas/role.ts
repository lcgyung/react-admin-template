/**
 * 생성물 — 직접 수정하지 마세요. `pnpm gen:api` 로 재생성합니다.
 */

export type Role = typeof Role[keyof typeof Role];


export const Role = {
  admin: 'admin',
  manager: 'manager',
  user: 'user',
} as const;
