import { describe, expect, it } from 'vitest';

import { isInternalPath, resolveInternalRedirect } from './isInternalPath';

describe('isInternalPath', () => {
  it('단일 슬래시로 시작하는 내부 경로는 허용한다', () => {
    expect(isInternalPath('/users')).toBe(true);
    expect(isInternalPath('/')).toBe(true);
    expect(isInternalPath('/dashboard?tab=1#top')).toBe(true);
  });

  it('외부/우회 형태는 거부한다', () => {
    expect(isInternalPath('//evil.com')).toBe(false); // 프로토콜-상대
    expect(isInternalPath('https://evil.com')).toBe(false); // 절대 URL
    expect(isInternalPath('javascript:alert(1)')).toBe(false); // 스킴
    expect(isInternalPath('/\\evil.com')).toBe(false); // 백슬래시 우회
    expect(isInternalPath('/path\\to')).toBe(false); // 백슬래시 포함
    expect(isInternalPath('users')).toBe(false); // 상대경로
    expect(isInternalPath('')).toBe(false); // 빈 문자열
  });
});

describe('resolveInternalRedirect', () => {
  const fallback = '/';

  it('내부 Location 의 pathname+search+hash 를 복원한다', () => {
    expect(
      resolveInternalRedirect({ pathname: '/users', search: '?q=1', hash: '#x' }, fallback),
    ).toBe('/users?q=1#x');
    expect(resolveInternalRedirect({ pathname: '/users' }, fallback)).toBe('/users');
  });

  it('외부 경로·비정상 state 는 fallback 으로 폴백한다', () => {
    expect(resolveInternalRedirect({ pathname: '//evil.com' }, fallback)).toBe(fallback);
    expect(resolveInternalRedirect(undefined, fallback)).toBe(fallback);
    expect(resolveInternalRedirect('/users', fallback)).toBe(fallback); // 문자열(Location 아님)
    expect(resolveInternalRedirect({ foo: 'bar' }, fallback)).toBe(fallback);
  });
});
