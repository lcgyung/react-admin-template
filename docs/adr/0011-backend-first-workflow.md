# 0011. 백엔드-우선 워크플로 — 스펙 import·MSW 테스트/데모 전용

- 상태: Accepted (supersedes [0008](0008-demo-to-real-backend-switch.md))
- 날짜: 2026-06-18

## 맥락

초기 결정([0004](0004-api-types-orval.md)·[0008](0008-demo-to-real-backend-switch.md))은 "손으로 쓴 샘플
OpenAPI 스펙 + MSW를 데모 백엔드로 켠 빌드"를 기본값으로 삼았다. 실 백엔드와 연동하는 파생 프로젝트가
본격화되면 이 전제가 어긋난다.

- **스펙은 백엔드 Swagger를 import** 하는 것이 단일 진실(SSoT)이어야 한다. 손작성 샘플 스펙은 참조용일 뿐이다.
- **MSW는 데모 백엔드가 아니라 테스트/데모 픽스처**다. dev/preview/배포가 MSW에 의존하면 "백엔드와
  연동된 앱"이 아니라 "목에 고정된 앱"이 된다.

## 결정

다음 9단계를 표준 워크플로로 삼는다.

> 1.API 개발 → 2.Swagger import → 3.orval 산출물 생성 → 4.MSW 테스트 픽스처 → 5.페이지 퍼블리싱
> → 6.API 연동 → 7.MSW 기반 테스트 → 8.사용자 테스트 → 9.dev 배포

이를 위해:

1. **MSW = 테스트 전용 + 데모 옵트인** — 기본(dev/preview/`pnpm build`)은 **실 백엔드 전제(MSW OFF,
   `VITE_ENABLE_MOCK=false`)**. 데모는 `--mode demo`(`.env.demo`, `pnpm build:demo`)로 명시 옵트인하며
   **e2e(Playwright)·lighthouse가 사용**한다. 단위 테스트는 `vitest.setup.ts`의 `server`(setupServer)로 MSW를
   계속 쓴다.
2. **실 배포 오버라이드** — 기본 빌드를 실 주소로 띄우려면 `.env.production.local`(gitignore) 또는 CI 시크릿/
   빌드 arg 로 `VITE_API_BASE_URL`·`VITE_ENABLE_MOCK` 을 오버라이드한다(템플릿: `.env.production.local.example`).
3. **orval 보존** — `orval.config.ts`·`pnpm gen:api`·샘플 스펙·생성물(`src/shared/api/generated`)은 **백엔드
   Swagger를 import 한 뒤 DTO를 생성하는 메커니즘의 참조 구현**으로 보존한다([0004](0004-api-types-orval.md)).
   실 스펙 도착 시 `openapi/`를 교체하고 `pnpm gen:api` 로 재생성한다.
4. **샘플 보존** — `features/users`·`pages/users` CRUD 샘플과 MSW `users` 핸들러는 **참조 구현**으로 남긴다
   (템플릿의 학습 가치). 파생 프로젝트는 실 도메인으로 교체한다.

이는 [0008](0008-demo-to-real-backend-switch.md)이 검토했던 **전략 A**(데모를 `--mode demo`로 분리)를 채택하는
것이다 — 파생 프로젝트가 실 백엔드를 전제하므로 "기본=데모"의 전제가 사라졌다.

## 대안

- **데모-기본 유지([0008](0008-demo-to-real-backend-switch.md) 전략 B)** — 백엔드-우선 흐름과 모순돼 기각.
  단, 이 템플릿을 "클론 즉시 동작하는 쇼케이스"로만 쓰려면 `.env.*` 의 `VITE_ENABLE_MOCK` 를 true 로 되돌리면 된다.
- **orval 전체 생성(타입+클라이언트+훅+MSW 목)** — FSD 계층·queryKey 객체 규칙·손작성 데이터 레이어와
  충돌(경쟁 패턴)해 기각. 생성물에서 **DTO 타입만** 소비한다.

## 결과 / 트레이드오프

- **dev/preview는 백엔드 없이는 로그인·데이터 조회가 불가**하다(페이지는 정적 셸). 백엔드 없이 보려면
  데모 모드(`vite --mode demo`)로 띄운다 — 의도된 트레이드오프.
- **CI 그린 유지** — e2e·lighthouse는 `pnpm build:demo`(MSW ON)로 데모 빌드를 검증해, 데모 경로를 보존하면서도
  기본 빌드는 실 백엔드 산출물이 된다.
- 트레이드오프: 템플릿을 막 클론한 직후 `pnpm dev` 는 데이터가 보이지 않는다(`--mode demo` 안내가 필요).
