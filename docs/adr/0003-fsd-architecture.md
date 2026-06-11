# 0003. Feature-Sliced Design 채택

- 상태: Accepted
- 날짜: 2026-06-11

## 맥락

기능이 늘수록 임의의 폴더 구조는 의존성이 얽혀 유지보수가 어려워진다. 레이어 경계와 공개 API 를
강제할 구조적 규칙이 필요하다.

## 결정

[Feature-Sliced Design 2.x](https://feature-sliced.design) 6레이어를 채택한다:
`app > pages > widgets > features > entities > shared`. 모듈은 자기보다 **엄격히 아래** 레이어만
import 하고, 같은 레이어 슬라이스 간 import 는 금지한다(유일 예외: `@x` 크로스임포트). 슬라이스 간
import 는 `index.ts` 공개 API 배럴을 경유하고, `shared` 는 세그먼트 배럴(`@/shared/api` 등)을 쓴다.
세그먼트 이름은 "왜"로 짓는다(`ui/api/model/lib/config`).

규칙은 `pnpm lint:fsd`(Steiger, recommended)가 CI·Stop 게이트에서 error 로 강제한다. 생성물
(`src/shared/api/generated`)은 Steiger 대상에서 제외한다.

## 대안

- 기능별 자유 폴더링: 경계가 코드 리뷰에만 의존해 시간이 지나면 무너진다.
- Atomic Design: UI 분류엔 좋으나 도메인/데이터 흐름 레이어링은 부족하다.

## 결과

- 의존성 방향이 자동 강제되어 결합도가 낮게 유지된다.
- 초기 학습 비용과 약간의 배럴 보일러플레이트가 있으나 린트 자동화로 상쇄한다.
