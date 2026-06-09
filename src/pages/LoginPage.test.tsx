import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { LoginPage } from './LoginPage';
import { useAuthStore } from '@/stores/authStore';

const renderLoginPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('짧은 비밀번호는 검증 에러를 표시한다', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('이메일'), 'admin@example.com');
    await user.type(screen.getByLabelText('비밀번호'), '123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('올바른 자격증명으로 로그인하면 인증 상태가 저장된다', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText('이메일'), 'admin@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'password');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBeTruthy();
    });
    expect(useAuthStore.getState().user?.email).toBe('admin@example.com');
  });
});
