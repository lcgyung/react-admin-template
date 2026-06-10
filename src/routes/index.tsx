import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { paths } from '@/shared/config/paths';
import { AuthLayout } from '@/widgets/auth-layout';
import { MainLayout } from '@/widgets/main-layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UsersPage } from '@/pages/UsersPage';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: paths.login, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: paths.dashboard, element: <DashboardPage /> },
          {
            element: <RoleRoute allowedRoles={['admin', 'manager']} />,
            children: [{ path: paths.users, element: <UsersPage /> }],
          },
          { path: paths.forbidden, element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
