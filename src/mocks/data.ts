import type { User } from '@/types/user';

export interface MockAccount extends User {
  password: string;
}

export const mockAccounts: MockAccount[] = [
  {
    id: 1,
    name: '관리자',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
    createdAt: '2026-01-02T09:00:00.000Z',
  },
  {
    id: 2,
    name: '매니저',
    email: 'manager@example.com',
    password: 'password',
    role: 'manager',
    createdAt: '2026-02-11T09:00:00.000Z',
  },
  {
    id: 3,
    name: '일반 사용자',
    email: 'user@example.com',
    password: 'password',
    role: 'user',
    createdAt: '2026-03-20T09:00:00.000Z',
  },
];

// 목 전용: 계정 → 토큰 매핑(실제 서명/검증은 백엔드 책임).
export const tokenFor = (account: MockAccount) => `mock-token-${account.id}`;

export const toUser = (account: MockAccount): User => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  createdAt: account.createdAt,
});
