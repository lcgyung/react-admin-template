# 0007. 보안 헤더 & CSP — 실용 베이스라인

- 상태: Accepted
- 날짜: 2026-06-11
- 갱신: 2026-06-11 — Vercel 배포 타깃 제거(미사용)로 `vercel.json` 삭제, 정본을 `nginx.conf` 단일로 변경

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

- **정본(프로덕션)**: `nginx.conf`(Docker), `upgrade-insecure-requests` 포함. 다른 호스팅으로
  배포할 땐 이 세트를 해당 호스팅의 헤더 설정으로 옮긴다.
- **로컬(dev·preview)**: `vite.config.ts` 의 `server.headers`·`preview.headers` 는 **CSP 를 적용하지
  않고** 공통 보안 헤더만 둔다. 로컬 목 데모는 교차출처 http(`VITE_API_BASE_URL=localhost:3000`)·무TLS
  라, 프로덕션 전용 CSP(`connect-src 'self'`·`upgrade-insecure-requests`)를 그대로 적용하면 목 API
  호출이 차단되고 e2e(preview) 가 깨진다. 따라서 CSP 는 프로덕션 정본에서만 검증한다.
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
