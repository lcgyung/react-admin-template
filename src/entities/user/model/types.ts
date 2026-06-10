export type Role = 'admin' | 'manager' | 'user';

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
