import { Navigate, Outlet } from 'react-router-dom';

import { paths } from '@/shared/config/paths';
import { useAuthStore } from '@/entities/session';
import type { Role } from '@/entities/user';

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
