import { Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';

import { paths } from '@/shared/config';

export const NotFoundPage = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    }}
  >
    <Typography variant="h2" sx={{ fontWeight: 700 }}>
      404
    </Typography>
    <Typography color="text.secondary">페이지를 찾을 수 없습니다.</Typography>
    <Button component={Link} to={paths.dashboard} variant="contained">
      홈으로
    </Button>
  </Box>
);
