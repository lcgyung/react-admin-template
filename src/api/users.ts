import { axiosInstance } from './axiosInstance';
import type { CreateUserInput, User } from '@/types/user';

export const getUsers = async () => {
  const { data } = await axiosInstance.get<User[]>('/users');
  return data;
};

export const getUser = async (id: number) => {
  const { data } = await axiosInstance.get<User>(`/users/${id}`);
  return data;
};

export const createUser = async (input: CreateUserInput) => {
  const { data } = await axiosInstance.post<User>('/users', input);
  return data;
};
