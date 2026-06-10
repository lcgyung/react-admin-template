import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { paths } from '@/shared/config';

export const ForbiddenPage = () => (
  <Box sx={{ textAlign: 'center', py: 8 }}>
    <Typography variant="h2" fontWeight={700}>
      403
    </Typography>
    <Typography color="text.secondary" mb={3}>
      이 페이지에 접근할 권한이 없습니다.
    </Typography>
    <Button component={Link} to={paths.dashboard} variant="contained">
      대시보드로 돌아가기
    </Button>
  </Box>
);
