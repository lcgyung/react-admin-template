import axios from 'axios';

import { env } from '@/shared/config';

export const axiosInstance = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// app 레이어가 주입하는 인증 콜백 (기본 no-op).
// 미주입 시 토큰 주입·401 처리가 조용히 비활성화되므로 부트스트랩에서 반드시 호출해야 한다.
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureAuthInterceptors(opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

// 요청 인터셉터: 저장된 토큰을 Authorization 헤더에 주입.
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 이면 주입된 콜백으로 인증 초기화/리다이렉트를 위임한다.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);
