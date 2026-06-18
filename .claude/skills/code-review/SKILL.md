---
name: code-review
description: React + MUI 변경에 대한 프론트엔드 리뷰 기준. 테마 토큰 사용, 접근성, 컴포넌트 구조, 리렌더 최적화를 점검할 때 사용.
---

# React + MUI 코드 리뷰 기준

## 스타일 / 테마

ESLint(`no-restricted-syntax`)가 #hex/rgb/hsl 색·인라인 fontWeight/fontSize·인라인 style을 이미 error로 막는다
(정책: ADR 0010). 리뷰는 **린트가 못 막는 회색지대를 받는 마지막 그물**이다.

- 색이 `theme.palette.*` 시맨틱 토큰(`primary.main`/`text.secondary` 등)을 거치는가 — named color(`'red'`)나
  부정확한 시맨틱 키 사용은 린트가 못 잡으니 리뷰가 잡는다.
- 타이포가 `variant`를 쓰는가, 인라인 가중치/크기 우회가 없는가. 신규 스케일은 컴포넌트가 아니라
  `tokens.ts` variant에 추가했는가.
- magic px가 의미 있는 상수/`spacing()` index로 표현됐는가(린트 미차단 영역).
- 인라인 style 대신 sx/styled를 쓰는가. sx에 매 렌더 새 객체 남발이 없는가.

## 컴포넌트 설계

- 표현/컨테이너 책임이 섞이지 않았는가. props 타입이 명시적인가.
- 거대한 컴포넌트가 적절히 분리됐는가.

## 접근성 (a11y)

- 인터랙티브 요소에 label/aria/role이 있는가. 키보드 접근이 되는가.
- 색만으로 정보를 전달하지 않는가.

## 성능

- 불필요한 리렌더(컨텍스트 과용, 비메모 콜백/객체)가 없는가.
- 리스트에 안정적 key를 쓰는가.

## 출력 형식

- blocker / warning / nit 로 분류, 파일·라인·근거·수정안 제시.
