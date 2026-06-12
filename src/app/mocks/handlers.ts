import { http, HttpResponse } from 'msw';

import type { LoginRequest } from '@/features/auth';

import { mockAccounts, tokenFor, toUser } from './data';

const accountFromAuthHeader = (request: Request) => {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return undefined;
  const token = auth.slice('Bearer '.length);
  return mockAccounts.find((acc) => tokenFor(acc) === token);
};

export const handlers = [
  http.post('*/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as LoginRequest;
    const account = mockAccounts.find((acc) => acc.email === email && acc.password === password);

    if (!account) {
      return HttpResponse.json(
        { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      );
    }

    return HttpResponse.json({ token: tokenFor(account), user: toUser(account) });
  }),

  http.post('*/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.get('*/auth/me', ({ request }) => {
    const account = accountFromAuthHeader(request);
    if (!account) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(toUser(account));
  }),

  http.get('*/users', ({ request }) => {
    const account = accountFromAuthHeader(request);
    if (!account) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(mockAccounts.map(toUser));
  }),
];
