import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { paths } from './paths';
import { useAuthStore } from '@/stores/authStore';

export const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
