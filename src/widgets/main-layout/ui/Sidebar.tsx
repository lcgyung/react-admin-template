import { NavLink } from 'react-router-dom';
import type { SvgIconComponent } from '@mui/icons-material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';

import { useAuthStore } from '@/entities/session';
import type { Role } from '@/entities/user';
import { paths } from '@/shared/config';

export const DRAWER_WIDTH = 240;

interface MenuItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
  allowedRoles?: Role[];
}

const menuItems: MenuItem[] = [
  { label: '대시보드', path: paths.dashboard, icon: DashboardIcon },
  { label: '사용자', path: paths.users, icon: PeopleIcon, allowedRoles: ['admin', 'manager'] },
];

export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);

  // RBAC: 사용자 역할에 허용된 메뉴만 노출.
  const visibleItems = menuItems.filter(
    (item) => !item.allowedRoles || (user != null && item.allowedRoles.includes(user.role)),
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap fontWeight={700}>
          Admin
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {visibleItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.path === paths.dashboard}
              sx={{ '&.active': { bgcolor: 'action.selected' } }}
            >
              <ListItemIcon>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
