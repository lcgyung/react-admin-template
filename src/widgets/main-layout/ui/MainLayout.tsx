import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <Header />
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      {/* 고정 AppBar 높이만큼 여백 확보 */}
      <Toolbar />
      <Outlet />
    </Box>
  </Box>
);
