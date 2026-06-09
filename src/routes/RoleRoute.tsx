import { Navigate, Outlet } from 'react-router-dom';

import { paths } from './paths';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/user';

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={paths.forbidden} replace />;
  }

  return <Outlet />;
};
