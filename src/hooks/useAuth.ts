import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { getMe, login, logout } from '@/api/auth';
import { paths } from '@/routes/paths';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest } from '@/types/auth';

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate(paths.dashboard, { replace: true });
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate(paths.login, { replace: true });
    },
  });
};

export const useMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    enabled: Boolean(token),
  });
};
