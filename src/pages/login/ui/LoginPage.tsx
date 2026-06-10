import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';

import { useLogin } from '@/features/auth';
import { loginSchema } from '@/features/auth';
import type { LoginFormValues } from '@/features/auth';

export const LoginPage = () => {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  return (
    <Card sx={{ width: '100%', maxWidth: 400 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          로그인
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          React Admin Template
        </Typography>

        <Box component="form" onSubmit={onSubmit} noValidate>
          <Stack spacing={2}>
            {login.isError && (
              <Alert severity="error">이메일 또는 비밀번호가 올바르지 않습니다.</Alert>
            )}

            <TextField
              label="이메일"
              type="email"
              autoComplete="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
              {login.isPending ? '로그인 중…' : '로그인'}
            </Button>

            <Alert severity="info" variant="outlined">
              데모 계정 — admin@example.com / password (관리자), user@example.com / password (일반)
            </Alert>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
