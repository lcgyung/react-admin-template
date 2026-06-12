import { clearAuthState, getAuthToken } from '@/entities/session';
import { configureAuthInterceptors } from '@/shared/api';
import { paths } from '@/shared/config';

// axios 인터셉터에 인증 콜백을 주입한다 (shared/api의 도메인 의존 0 유지 — FSD Option B).
configureAuthInterceptors({
  getToken: getAuthToken,
  onUnauthorized: () => {
    clearAuthState();
    if (window.location.pathname !== paths.login) {
      window.location.href = paths.login;
    }
  },
});
