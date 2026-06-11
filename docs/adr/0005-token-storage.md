# 0005. 토큰 저장 — localStorage persist

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

인증 토큰을 어디에 저장할지는 보안과 직결된다. `httpOnly` 쿠키는 XSS 시 탈취를 막지만 서버의
쿠키 발급·CSRF 대응이 필요하다. 이 템플릿은 백엔드 비의존(MSW 목) 데모를 우선한다.

## 결정

데모 단순성을 위해 `entities/session` 의 Zustand `persist`(localStorage)에 토큰/유저를 저장한다.
이는 **편의상 선택이며 보안 트레이드오프가 있음을 명시**한다.

- RBAC 라우트 가드(`ProtectedRoute`/`RoleRoute`)와 사이드바 역할 필터는 **UX 차원의 제어**일 뿐,
  진짜 인가 경계는 백엔드다.
- axios 응답 인터셉터가 401 시 인증 상태를 초기화하고 `/login` 으로 보낸다.

## 보안 트레이드오프

- localStorage 토큰은 **XSS 발생 시 탈취 가능**하다. 따라서 XSS 방어(=`dangerouslySetInnerHTML`
  금지, `eslint-plugin-no-unsanitized` 정적 차단, 입력 sanitize)와 CSP 가 1차 방어선이다.
  CSP·보안 헤더는 [ADR 0007](0007-security-headers-csp.md) 에서 적용한다.
- 운영 전환 시 권장: 토큰을 `httpOnly`+`Secure`+`SameSite` 쿠키로 옮기고, 자동 리프레시와 실패 시
  안전한 리다이렉트를 구현한다. 그 경우 본 ADR 을 Superseded 처리한다.

## 운영 강화 경로 — httpOnly 쿠키 + 토큰 리프레시 (통합자 책임)

이 항목들은 **백엔드 계약에 결합**되므로 템플릿은 코드로 강제하지 않고 통합 지점만 명시한다.

- **httpOnly 쿠키 전환**: 서버가 로그인 응답에서 `Set-Cookie`(httpOnly·Secure·SameSite)를 내려주고,
  `shared/api/axiosInstance.ts` 의 Bearer 주입을 제거한 뒤 `withCredentials: true` 로 전환한다.
  이 경우 CSRF 토큰(이중 제출/Origin 검증)을 함께 도입한다.
- **자동 리프레시**: refresh 엔드포인트 도입 후, axios 응답 인터셉터의 401 분기에서 1회 refresh →
  원요청 재시도 흐름을 추가한다(현재는 401 시 인증 초기화 + `/login` 리다이렉트만 수행).

## 결과

- 백엔드 없이 인증 흐름을 데모할 수 있다.
- 실서비스에서는 쿠키 기반으로 교체가 필요하다(위 "운영 강화 경로" 참고).
