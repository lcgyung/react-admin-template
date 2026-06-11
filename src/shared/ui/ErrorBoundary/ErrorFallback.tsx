import { Box, Button, Stack, Typography } from '@mui/material';

interface ErrorFallbackProps {
  onReset?: () => void;
}

export const ErrorFallback = ({ onReset }: ErrorFallbackProps) => (
  <Box
    role="alert"
    sx={{
      display: 'flex',
      minHeight: '60vh',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
    }}
  >
    <Stack spacing={2} alignItems="center" textAlign="center">
      <Typography variant="h2">문제가 발생했습니다</Typography>
      <Typography color="text.secondary">
        화면을 표시하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
      </Typography>
      <Button variant="contained" onClick={onReset}>
        다시 시도
      </Button>
    </Stack>
  </Box>
);
