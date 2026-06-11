---
paths:
  - 'src/**'
  - 'nginx.conf'
  - 'vite.config.ts'
  - 'Dockerfile'
  - '.github/workflows/**'
  - '.gitleaks.toml'
---

# 보안 규칙

- **DOM XSS** — `eslint-plugin-no-unsanitized`가 `dangerouslySetInnerHTML`·`innerHTML` 등
  DOM XSS sink를 **error로 차단**한다(불가피하면 DOMPurify). `eslint-plugin-security`도 켜져 있다.
- **오픈 리다이렉트 방지** — 리다이렉트 대상은 `@/shared/lib/url`의
  `isInternalPath`/`resolveInternalRedirect`로 내부 경로만 허용한다.
- **CSP·보안 헤더** — 정본은 `nginx.conf`(로컬 dev/preview 는 CSP 없이 `vite.config.ts`의 공통
  헤더만 — 의도된 부재이니 dev에 CSP를 추가하지 말 것). 스펙 배경은
  [ADR 0007](../../docs/adr/0007-security-headers-csp.md).
- **시크릿 스캔** — pre-commit(gitleaks)과 CI(gitleaks + dist 빌드 산출물 grep)가 이중으로 돈다.
  예외 경로는 `.gitleaks.toml`에서 관리한다.
- **토큰 저장** — `authStore` persist 방식의 트레이드오프는
  [ADR 0005](../../docs/adr/0005-token-storage.md) 참고.
- **RBAC 한계** — 라우트 가드·메뉴 필터링은 프런트엔드(UX) 차원의 제어일 뿐이다.
  실제 데이터 권한은 백엔드에서 강제해야 한다.
