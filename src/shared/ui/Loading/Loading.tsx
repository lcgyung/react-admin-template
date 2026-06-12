import { Box, CircularProgress } from '@mui/material';

export const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
    <CircularProgress />
  </Box>
);
