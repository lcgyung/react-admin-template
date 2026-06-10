import { axiosInstance } from '@/shared/api/axiosInstance';
import type { LoginRequest, LoginResponse } from '../model/types';
import type { User } from '@/entities/user';

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
