export { axiosInstance, configureAuthInterceptors } from './axiosInstance';
// orval 생성 DTO 타입(수동 타이핑 대체). 생성 클라이언트는 generated/endpoints.ts 에 함께 있다.
export type { ApiError, LoginRequest, LoginResponse } from './generated/schemas';
export type { ApiErrorResponse, Paginated } from './types';
