import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { AppBar, Chip, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';

import { DRAWER_WIDTH } from './Sidebar';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/entities/session';
import { useThemeStore } from '@/stores/themeStore';

export const Header = () => {
  const user = useAuthStore((s) => s.user);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const logout = useLogout();

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={1}
      sx={{ width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px` }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          React Admin Template
        </Typography>

        {user && <Chip label={`${user.name} · ${user.role}`} size="small" />}

        <Tooltip title={mode === 'light' ? '다크 모드' : '라이트 모드'}>
          <IconButton onClick={toggleTheme} color="inherit" aria-label="테마 전환">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title="로그아웃">
          <IconButton
            onClick={() => logout.mutate()}
            color="inherit"
            disabled={logout.isPending}
            aria-label="로그아웃"
          >
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};
