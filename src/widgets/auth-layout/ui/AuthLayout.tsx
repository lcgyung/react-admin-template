import { Box } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';

import { paths } from '@/shared/config/paths';
import { useAuthStore } from '@/entities/session';

export const AuthLayout = () => {
  const token = useAuthStore((s) => s.token);

  // 이미 로그인한 사용자는 대시보드로.
  if (token) {
    return <Navigate to={paths.dashboard} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Outlet />
    </Box>
  );
};
