/**
 * 생성물 — 직접 수정하지 마세요. `pnpm gen:api` 로 재생성합니다.
 */
import * as axios from 'axios';
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from 'axios';

import type {
  CreateUserInput,
  LoginRequest,
  LoginResponse,
  User
} from './schemas';




  export const getAdminAPI = (axiosInstance: AxiosInstance = axios.default) => {
/**
 * @summary 로그인
 */
const login = (
    loginRequest: LoginRequest, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<LoginResponse>> => {
    return axiosInstance.post(
      `/auth/login`,
      loginRequest,options
    );
  }

/**
 * @summary 로그아웃
 */
const logout = (
     options?: AxiosRequestConfig
 ): Promise<AxiosResponse<void>> => {
    return axiosInstance.post(
      `/auth/logout`,
      undefined,options
    );
  }

/**
 * @summary 현재 사용자 조회
 */
const getMe = (
     options?: AxiosRequestConfig
 ): Promise<AxiosResponse<User>> => {
    return axiosInstance.get(
      `/auth/me`,options
    );
  }

/**
 * @summary 사용자 목록
 */
const getUsers = (
     options?: AxiosRequestConfig
 ): Promise<AxiosResponse<User[]>> => {
    return axiosInstance.get(
      `/users`,options
    );
  }

/**
 * @summary 사용자 생성
 */
const createUser = (
    createUserInput: CreateUserInput, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<User>> => {
    return axiosInstance.post(
      `/users`,
      createUserInput,options
    );
  }

/**
 * @summary 단일 사용자 조회
 */
const getUser = (
    id: number, options?: AxiosRequestConfig
 ): Promise<AxiosResponse<User>> => {
    return axiosInstance.get(
      `/users/${id}`,options
    );
  }

return {login,logout,getMe,getUsers,createUser,getUser}};
export type LoginResult = AxiosResponse<LoginResponse>
export type LogoutResult = AxiosResponse<void>
export type GetMeResult = AxiosResponse<User>
export type GetUsersResult = AxiosResponse<User[]>
export type CreateUserResult = AxiosResponse<User>
export type GetUserResult = AxiosResponse<User>
