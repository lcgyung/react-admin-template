# 시큐어 코딩 하네스 체크리스트 — React + MUI (Admin/Web)

> 프론트엔드 보안은 "브라우저에 나간 코드는 신뢰할 수 없다"가 전제입니다.
> 진짜 보안 경계는 서버이며, 프론트는 **추가 방어선 + 클라이언트 측 취약점 제거**에 집중합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택

**구현 상태 범례:** `[x]` 구현됨 · `[ ]` 미구현/선택 · 항목 뒤 `— …` 는 구현 위치 또는 책임 주체.
이 템플릿에서 적용된 결정은 [`docs/adr/`](adr/) (특히 0005 토큰 저장, 0006 관찰가능성,
0007 보안 헤더/CSP)에 기록되어 있습니다.

---

## 0. 보안 자동화 기반

- [x] 🔴 `eslint-plugin-security` + `eslint-plugin-no-unsanitized` + `eslint-plugin-react` — `eslint.config.js`
- [x] 🔴 SAST — Semgrep / CodeQL CI 게이트 — `.github/workflows/codeql.yml` (CodeQL)
- [x] 🔴 시크릿 스캔 — gitleaks (pre-commit + CI) — `.gitleaks.toml` · `.husky/pre-commit` · `ci.yml`
- [x] 🔴 SCA — `pnpm audit`(high+ 차단, `--prod`) + osv-scanner(교차검증, 비차단) — `ci.yml` (`security` job). Socket(공급망)은 선택
- [x] 🔴 lockfile 커밋 + `--frozen-lockfile` — `pnpm-lock.yaml` · CI 전 job
- [x] 🟡 의존성 자동 업데이트 (Renovate / Dependabot) — `.github/dependabot.yml`
- [ ] 🟢 SBOM 생성 — 미도입(선택). CycloneDX 등으로 후속 추가 가능

## 1. XSS 방지 (프론트 최우선 위협)

- [x] 🔴 `dangerouslySetInnerHTML` 원칙적 금지 — 불가피하면 DOMPurify로 sanitize — 현재 사용 0건 + 린트 강제
- [x] 🔴 `eslint-plugin-no-unsanitized`로 위 패턴 자동 탐지 — `no-unsanitized/method`·`property` error
- [x] 🔴 사용자 입력을 `href`/`src`에 넣을 때 `javascript:` 스킴 차단 — 동적 href sink 없음 + 리다이렉트는 `isInternalPath` 가드(`shared/lib/url`)
- [ ] 🟡 마크다운/리치텍스트 렌더링 시 화이트리스트 sanitizer — 해당 없음(리치텍스트 렌더 없음). 도입 시 DOMPurify
- [x] 🟡 `eval` / `new Function` / 동적 `import()` 사용자 입력 금지 — `security/detect-eval-with-expression` + 현재 0건
- [x] 🟢 MUI 컴포넌트에 신뢰 불가 값을 HTML로 렌더하는 prop 전달 금지 — no-unsanitized 로 커버 + 현재 없음

## 2. 시크릿 & 환경변수

- [x] 🔴 **프론트 번들에 비밀키 금지** — API 시크릿, 서명키는 서버에만 — 소스 시크릿 0건(목만 예외)
- [x] 🔴 `VITE_` 접두 환경변수는 전부 공개됨을 팀 전체가 인지 (문서화) — `README.md` · `.env.example`
- [x] 🟡 빌드 산출물에 소스 시크릿 없는지 grep 검사 CI 추가 — `ci.yml` "Scan build output for secrets"

## 3. 인증 토큰 / 세션 처리

- [x] 🔴 토큰 저장 — `httpOnly` 쿠키 권장 (XSS 시 탈취 방지). localStorage 사용 시 리스크 문서화 — ADR 0005
- [x] 🔴 로그아웃 시 토큰/세션 완전 무효화 (서버 연동) — `useLogout`(clearAuth + queryClient.clear + redirect)
- [ ] 🟡 인증 만료/갱신 흐름 — 자동 리프레시 + 실패 시 안전한 리다이렉트 — 부분: 401→안전 리다이렉트 O, 자동 리프레시는 통합자 책임(ADR 0005)
- [x] 🟡 라우트 가드 — 보호 라우트 접근 제어 (단, 서버 인가가 진짜 경계) — `app/router` `ProtectedRoute`·`RoleRoute`

## 4. 콘텐츠 보안 정책 & 헤더 (서버/호스팅 연계)

- [x] 🔴 CSP 설정 — `script-src` 제한, inline script 최소화 — `nginx.conf`·`vercel.json`·vite preview (ADR 0007)
- [x] 🔴 `frame-ancestors` (클릭재킹 방지) — `frame-ancestors 'none'` + `X-Frame-Options: DENY`
- [ ] 🟡 서드파티 스크립트 SRI(Subresource Integrity) — 해당 없음(외부 스크립트 없음). 추가 시 `integrity`
- [x] 🟡 `Referrer-Policy`, `Permissions-Policy` — `no-referrer` · `camera=(), microphone=(), geolocation=()`
- [ ] 🟢 Trusted Types (지원 브라우저) — 후속 과제(ADR 0007 결과)

## 5. 안전한 데이터 흐름 / 라우팅

- [x] 🔴 오픈 리다이렉트 방지 — 리다이렉트 대상 URL 화이트리스트 — `paths` 상수 + `isInternalPath`/`resolveInternalRedirect`
- [x] 🔴 폼 검증은 클라이언트 + **서버 양쪽** (클라 검증은 UX용일 뿐) — 클라: zod(`loginSchema`·`userFormSchema`) / 서버: 백엔드 몫
- [x] 🟡 API 타입 자동 생성(orval) — 응답 신뢰 경계 명확화, 수동 타이핑 금지 — `orval.config.ts` · `shared/api/generated`
- [x] 🟡 에러 메시지에 내부 정보/스택 노출 금지 — `ErrorFallback` 일반 메시지(스택 비노출)
- [x] 🟢 민감 데이터 클라 캐싱/로깅 최소화 (콘솔 로그 prod 제거) — `vite.config.ts` `esbuild.drop=['console','debugger']`

## 6. 의존성 / 공급망

- [x] 🔴 SCA 게이트 통과 못 하면 머지 차단 — `pnpm audit --audit-level=high` (CI)
- [ ] 🟡 새 의존성 추가 시 Socket 등으로 공급망 리스크 점검 — 선택(외부 계정 필요)
- [x] 🟡 MUI 등 핵심 라이브러리 버전 고정 + 정기 업데이트 — lockfile + Dependabot

## 7. CI/CD 보안 게이트

- [x] 🔴 PR 게이트 — lint(security) · SAST · 시크릿 · SCA — `ci.yml` + `codeql.yml`
- [ ] 🔴 브랜치 보호 + 필수 리뷰 — `.github/CODEOWNERS` 제공 + 권장설정 문서화. GitHub 브랜치 보호 토글은 저장소 관리자 설정(아래 참고)
- [x] 🟡 빌드 산출물 시크릿 스캔 — `ci.yml` "Scan build output for secrets"
- [ ] 🟡 에러 트래킹 (Sentry) — source map 비공개 업로드, PII 스크러빙 — 부분: PII 스크러빙 O(`sentry.ts`), 소스맵 업로드는 통합자(SENTRY_AUTH_TOKEN)
- [ ] 🟢 서명 커밋 — 선택(개발자 환경 설정)

> **브랜치 보호 권장 설정** (GitHub → Settings → Branches, `main`·`dev`): 필수 status checks =
> `build` · `security` · `e2e` · `CodeQL` / Require PR review (+ Code Owners) / 직접 푸시 금지.

---

## 권장 셋업 순서

1. 보안 자동화 기반 (security ESLint·SAST·시크릿·SCA) → CI 게이트화
2. XSS 방어 (no-unsanitized + DOMPurify 정책)
3. 시크릿/환경변수 노출 점검 + 토큰 저장 전략
4. CSP·보안 헤더 (호스팅/서버 연계)
5. 오픈 리다이렉트·서버 측 검증 의존 확립
6. 에러 트래킹(PII 스크러빙) + 빌드 산출물 스캔
