import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

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
