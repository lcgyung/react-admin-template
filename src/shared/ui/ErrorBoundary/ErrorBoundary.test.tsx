import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

const Boom = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  it('자식이 정상이면 그대로 렌더한다', () => {
    render(
      <ErrorBoundary>
        <div>정상 콘텐츠</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('정상 콘텐츠')).toBeInTheDocument();
  });

  it('자식이 throw 하면 폴백을 보여주고 onError 를 호출한다', () => {
    const onError = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it('fallback prop 이 있으면 우선 렌더한다', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<div>커스텀 폴백</div>}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText('커스텀 폴백')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('다시 시도 클릭 시 reset 을 시도한다', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    spy.mockRestore();
  });
});
