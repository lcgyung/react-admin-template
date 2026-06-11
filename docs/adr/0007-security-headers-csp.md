# 0007. 보안 헤더 & CSP — 실용 베이스라인

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

프론트는 정적 SPA 로 빌드되며 진짜 보안 경계는 서버다. 다만 CSP·클릭재킹 방지 헤더는 XSS·
프레이밍 공격의 **추가 방어선**이다. 문제는 MUI/emotion 이 런타임에 `<style>` 을 DOM 에 주입하므로
순수 `style-src 'self'` 로는 스타일이 깨진다는 점이다. nonce/hash 기반 엄격 CSP 는 emotion nonce
주입·SSR 등 추가 작업이 필요해 정적 SPA 에는 과하다.

## 결정

**실용 베이스라인 CSP + 공통 보안 헤더**를 호스팅 계층에서 적용한다.

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';   # emotion 런타임 스타일 대응
img-src 'self' data:; font-src 'self' data:;
connect-src 'self';                 # 통합 시 실제 API origin·Sentry ingest 추가
object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';
upgrade-insecure-requests;          # http 서브리소스를 https 로 자동 승격(혼합 콘텐츠 차단)
```

공통 헤더: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

### 적용 위치

- **정본(프로덕션)**: `nginx.conf`(Docker) · `vercel.json`(`headers`). 두 곳에 동일 세트를 둔다.
- **로컬**: `vite.config.ts` 의 `preview.headers`(빌드 산출물, CSP 포함) · `server.headers`(dev,
  HMR 의 websocket·eval 충돌 방지를 위해 **CSP 제외**, 나머지 헤더만).
- **`index.html` meta 미사용**: `frame-ancestors` 등은 meta 로 표현 불가하고, 헤더와 이중 관리가
  되므로 CSP 는 헤더로만 둔다.

## 트레이드오프

- `style-src 'unsafe-inline'` 은 인라인 스타일 주입을 허용해 CSP 강도를 낮춘다. emotion 의존을
  버리거나 nonce 를 도입하기 전까지의 현실적 절충이다.
- `connect-src 'self'` 는 데모(같은 출처·MSW) 기준이다. 실제 백엔드/Sentry 연동 시 해당 origin 을
  반드시 추가해야 요청이 막히지 않는다(주석으로 가이드).

## 결과

- 클릭재킹·MIME 스니핑·레퍼러 유출·불필요한 브라우저 기능을 기본 차단한다.
- 엄격 CSP(nonce/hash·Trusted Types)로의 상향은 후속 과제로 남긴다.
