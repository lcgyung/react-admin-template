import axios from 'axios';

import { paths } from '@/routes/paths';
import { clearAuthState, getAuthToken } from '@/stores/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 저장된 토큰을 Authorization 헤더에 주입.
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 이면 인증 상태를 초기화하고 로그인 페이지로 보낸다.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthState();
      if (window.location.pathname !== paths.login) {
        window.location.href = paths.login;
      }
    }
    return Promise.reject(error);
  },
);
