export const ROLES = ['admin', 'manager', 'user'] as const;

export type Role = (typeof ROLES)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
}
