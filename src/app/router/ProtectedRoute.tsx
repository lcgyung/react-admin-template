import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/entities/session';
import { paths } from '@/shared/config';

export const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};
