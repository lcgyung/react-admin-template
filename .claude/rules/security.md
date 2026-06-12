---
paths:
  - 'src/**'
  - 'nginx.conf'
  - 'vite.config.ts'
  - 'Dockerfile'
  - '.github/workflows/**'
  - '.github/dependabot.yml'
  - 'pnpm-workspace.yaml'
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
- **공급망 — 의존성 유휴기간(minimumReleaseAge)** — `pnpm-workspace.yaml`의 `minimumReleaseAge`(1440분=1일)는
  갓 게시된(잠재 탈취) 버전 설치를 지연한다. 이 gate 는 dependabot 전용이 아니라 **모든 install(수동 범프·CI 포함)**에
  적용된다.
  - **dependabot** — `.github/dependabot.yml`의 cooldown(최저 patch 2일) ≥ gate(1일) 불변식으로 자동 안전.
    peer-coupled 패밀리(@mui·react·storybook 등)의 메이저는 그룹으로 묶여 한 PR 로 올라간다(#23 류 peer 불일치 차단).
  - **수동 범프 규약** — 사람이 직접 24h 미만 버전을 올리면 CI install 이
    `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`으로 실패한다(#28). ① 버전이 24h 지날 때까지 기다린 뒤 CI 를
    재실행하거나, ② 신뢰·긴급 시 해당 패키지를 `pnpm-workspace.yaml`의 `minimumReleaseAgeExclude`로 한시 예외.
    **gate 를 무시한 admin-merge 는 금지**(머지 후 dev install 이 24h 간 깨진다).
