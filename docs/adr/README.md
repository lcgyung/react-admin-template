# Architecture Decision Records (ADR)

주요 아키텍처 결정을 기록한다. 코드만 봐서는 알기 어려운 "왜"를 남겨, 이후 합류자가 맥락을
빠르게 파악하고 같은 논의를 반복하지 않게 하는 것이 목적이다. 경량 [MADR](https://adr.github.io/madr/)
형식을 따른다.

| #                                             | 제목                                               | 상태              |
| --------------------------------------------- | -------------------------------------------------- | ----------------- |
| [0001](0001-record-architecture-decisions.md) | ADR 도입                                           | Accepted          |
| [0002](0002-state-management.md)              | 상태 관리 — React Query + Zustand                  | Accepted          |
| [0003](0003-fsd-architecture.md)              | Feature-Sliced Design 채택                         | Accepted          |
| [0004](0004-api-types-orval.md)               | API 타입 — orval + 샘플 스펙                       | Accepted          |
| [0005](0005-token-storage.md)                 | 토큰 저장 — localStorage persist                   | Accepted          |
| [0006](0006-observability.md)                 | 관찰가능성 — Sentry/Web Vitals 스텁                | Accepted          |
| [0007](0007-security-headers-csp.md)          | 보안 헤더 & CSP — 실용 베이스라인                  | Accepted          |
| [0008](0008-demo-to-real-backend-switch.md)   | 데모/실배포 전환 — 오버라이드 방식                 | Superseded (0011) |
| [0010](0010-design-theme-system.md)           | 디자인 시스템 — 토큰 단일 소스+우회 차단           | Accepted          |
| [0011](0011-backend-first-workflow.md)        | 백엔드-우선 워크플로 — 스펙 import·MSW 테스트/데모 | Accepted          |

새 결정은 다음 번호로 파일을 추가하고 이 표에 한 줄 등록한다.
(0009는 thinkseed-admin-web의 도메인 모델 매핑 전용 결정이라 이 템플릿에는 포함하지 않는다 — 번호 공백.)
