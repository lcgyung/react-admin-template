# 시큐어 코딩 하네스 체크리스트 — React + MUI (Admin/Web)

> 프론트엔드 보안은 "브라우저에 나간 코드는 신뢰할 수 없다"가 전제입니다.
> 진짜 보안 경계는 서버이며, 프론트는 **추가 방어선 + 클라이언트 측 취약점 제거**에 집중합니다.
> 우선순위: 🔴 필수 · 🟡 권장 · 🟢 선택

---

## 0. 보안 자동화 기반

- [ ] 🔴 `eslint-plugin-security` + `eslint-plugin-no-unsanitized` + `eslint-plugin-react`
- [ ] 🔴 SAST — Semgrep / CodeQL CI 게이트
- [ ] 🔴 시크릿 스캔 — gitleaks (pre-commit + CI) — **프론트 번들 시크릿 유출 특히 주의**
- [ ] 🔴 SCA — `pnpm audit` / osv-scanner / Socket(공급망)
- [ ] 🔴 lockfile 커밋 + `--frozen-lockfile`
- [ ] 🟡 의존성 자동 업데이트 (Renovate / Dependabot)
- [ ] 🟢 SBOM 생성

## 1. XSS 방지 (프론트 최우선 위협)

- [ ] 🔴 `dangerouslySetInnerHTML` 원칙적 금지 — 불가피하면 DOMPurify로 sanitize
- [ ] 🔴 `eslint-plugin-no-unsanitized`로 위 패턴 자동 탐지
- [ ] 🔴 사용자 입력을 `href`/`src`에 넣을 때 `javascript:` 스킴 차단
- [ ] 🟡 마크다운/리치텍스트 렌더링 시 화이트리스트 sanitizer
- [ ] 🟡 `eval` / `new Function` / 동적 `import()` 사용자 입력 금지
- [ ] 🟢 MUI 컴포넌트에 신뢰 불가 값을 HTML로 렌더하는 prop 전달 금지

## 2. 시크릿 & 환경변수

- [ ] 🔴 **프론트 번들에 비밀키 금지** — API 시크릿, 서명키는 서버에만
- [ ] 🔴 `VITE_` 접두 환경변수는 전부 공개됨을 팀 전체가 인지 (문서화)
- [ ] 🟡 빌드 산출물에 소스 시크릿 없는지 grep 검사 CI 추가

## 3. 인증 토큰 / 세션 처리

- [ ] 🔴 토큰 저장 — `httpOnly` 쿠키 권장 (XSS 시 탈취 방지). localStorage 사용 시 리스크 문서화
- [ ] 🔴 로그아웃 시 토큰/세션 완전 무효화 (서버 연동)
- [ ] 🟡 인증 만료/갱신 흐름 — 자동 리프레시 + 실패 시 안전한 리다이렉트
- [ ] 🟡 라우트 가드 — 보호 라우트 접근 제어 (단, 서버 인가가 진짜 경계)

## 4. 콘텐츠 보안 정책 & 헤더 (서버/호스팅 연계)

- [ ] 🔴 CSP 설정 — `script-src` 제한, inline script 최소화
- [ ] 🔴 `frame-ancestors` (클릭재킹 방지)
- [ ] 🟡 서드파티 스크립트 SRI(Subresource Integrity)
- [ ] 🟡 `Referrer-Policy`, `Permissions-Policy`
- [ ] 🟢 Trusted Types (지원 브라우저)

## 5. 안전한 데이터 흐름 / 라우팅

- [ ] 🔴 오픈 리다이렉트 방지 — 리다이렉트 대상 URL 화이트리스트
- [ ] 🔴 폼 검증은 클라이언트 + **서버 양쪽** (클라 검증은 UX용일 뿐)
- [ ] 🟡 API 타입 자동 생성(orval) — 응답 신뢰 경계 명확화, 수동 타이핑 금지
- [ ] 🟡 에러 메시지에 내부 정보/스택 노출 금지
- [ ] 🟢 민감 데이터 클라 캐싱/로깅 최소화 (콘솔 로그 prod 제거)

## 6. 의존성 / 공급망

- [ ] 🔴 SCA 게이트 통과 못 하면 머지 차단
- [ ] 🟡 새 의존성 추가 시 Socket 등으로 공급망 리스크 점검
- [ ] 🟡 MUI 등 핵심 라이브러리 버전 고정 + 정기 업데이트

## 7. CI/CD 보안 게이트

- [ ] 🔴 PR 게이트 — lint(security) · SAST · 시크릿 · SCA
- [ ] 🔴 브랜치 보호 + 필수 리뷰
- [ ] 🟡 빌드 산출물 시크릿 스캔
- [ ] 🟡 에러 트래킹 (Sentry) — source map 비공개 업로드, PII 스크러빙
- [ ] 🟢 서명 커밋

---

## 권장 셋업 순서

1. 보안 자동화 기반 (security ESLint·SAST·시크릿·SCA) → CI 게이트화
2. XSS 방어 (no-unsanitized + DOMPurify 정책)
3. 시크릿/환경변수 노출 점검 + 토큰 저장 전략
4. CSP·보안 헤더 (호스팅/서버 연계)
5. 오픈 리다이렉트·서버 측 검증 의존 확립
6. 에러 트래킹(PII 스크러빙) + 빌드 산출물 스캔
