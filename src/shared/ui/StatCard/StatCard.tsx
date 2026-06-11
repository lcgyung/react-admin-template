import type { ReactNode } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export const StatCard = ({ label, value, hint }: StatCardProps) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </CardContent>
  </Card>
);
