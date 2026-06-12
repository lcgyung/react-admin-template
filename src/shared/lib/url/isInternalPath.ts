/**
 * 주어진 경로가 "같은 출처의 내부 경로"인지 판정한다(오픈 리다이렉트 방지).
 *
 * 단일 `/` 로 시작하는 절대 내부 경로만 허용하고, 외부/우회 형태는 모두 거부한다:
 * `//evil.com`(프로토콜-상대), `https://…`(절대 URL), `\\`·`/\evil.com`(백슬래시 우회),
 * `javascript:`(스킴) 등. 리다이렉트 대상으로 사용자 제어 값을 쓰기 전 반드시 통과시킨다.
 */
export const isInternalPath = (path: string): boolean => {
  if (typeof path !== 'string' || path.length === 0) return false;
  if (!path.startsWith('/')) return false;
  // '//' 또는 '/\' 는 브라우저가 프로토콜-상대(외부) URL 로 해석할 수 있어 차단.
  if (path.startsWith('//') || path.startsWith('/\\')) return false;
  if (path.includes('\\')) return false;
  return true;
};

interface LocationLike {
  pathname: string;
  search?: string;
  hash?: string;
}

const isLocationLike = (value: unknown): value is LocationLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { pathname?: unknown }).pathname === 'string';

/**
 * 라우트 가드가 저장한 `from` state(Location 형태)에서 안전한 내부 복귀 경로를 추출한다.
 * 내부 경로가 아니거나 형식이 다르면 `fallback` 으로 폴백한다.
 */
export const resolveInternalRedirect = (from: unknown, fallback: string): string => {
  if (!isLocationLike(from) || !isInternalPath(from.pathname)) return fallback;
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
};
