import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 2,
      mb: 3,
    }}
  >
    <Box>
      <Typography variant="h5" fontWeight={700}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
    {action}
  </Box>
);
