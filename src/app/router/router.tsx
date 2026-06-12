import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/widgets/auth-layout';
import { MainLayout } from '@/widgets/main-layout';
import { paths } from '@/shared/config';
import { Loading } from '@/shared/ui/Loading';

import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// 라우트 단위 코드 스플리팅 — 페이지는 named export 라 default 어댑터로 감싼다.
const DashboardPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const ForbiddenPage = lazy(() =>
  import('@/pages/forbidden').then((m) => ({ default: m.ForbiddenPage })),
);
const LoginPage = lazy(() => import('@/pages/login').then((m) => ({ default: m.LoginPage })));
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
);
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));

// 스플리팅된 페이지를 공통 Loading 폴백으로 감싼다(레이아웃·가드는 정적 유지).
const lazyPage = (element: ReactNode): ReactNode => (
  <Suspense fallback={<Loading />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: paths.login, element: lazyPage(<LoginPage />) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: paths.dashboard, element: lazyPage(<DashboardPage />) },
          {
            element: <RoleRoute allowedRoles={['admin', 'manager']} />,
            children: [{ path: paths.users, element: lazyPage(<UsersPage />) }],
          },
          { path: paths.forbidden, element: lazyPage(<ForbiddenPage />) },
        ],
      },
    ],
  },
  { path: '*', element: lazyPage(<NotFoundPage />) },
]);
