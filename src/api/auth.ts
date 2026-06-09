import { axiosInstance } from './axiosInstance';
import type { LoginRequest, LoginResponse } from '@/types/auth';
import type { User } from '@/types/user';

export const login = async (payload: LoginRequest) => {
  const { data } = await axiosInstance.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const getMe = async () => {
  const { data } = await axiosInstance.get<User>('/auth/me');
  return data;
};

export const logout = async () => {
  await axiosInstance.post('/auth/logout');
};
