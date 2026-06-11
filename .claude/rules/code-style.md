---
paths:
  - 'src/**/*.ts'
  - 'src/**/*.tsx'
  - '.storybook/**'
---

# 코드 스타일 컨벤션

> 강제의 정본은 `eslint.config.js`(+`tsconfig`의 strict)다. 이 문서는 그 규칙의 해설·요약이며,
> 충돌 시 린트 설정이 우선한다. 모든 코드는 `pnpm lint`, `pnpm format`을 통과해야 한다.

- **타입 안정성 우선** — TypeScript 타입을 명확히 지정하고 `any` 사용을 지양한다.
  `tsconfig`에 `strict`, `noUnusedLocals/Parameters`가 켜져 있다.
- **최소 보일러플레이트** — 불필요한 추상화를 피하고 간결하게 작성한다.
- **컴포넌트 선언은 화살표 함수** — `react/function-component-definition`이 `const X = () => …`를
  강제한다(autofix). `default export`는 쓰지 않고 named export로 통일한다(`local/no-default-export`가
  **error로 차단** — Storybook meta·`*.config.ts`는 예외). props는 `interface NameProps`(PascalCase)로 정의한다.
- **네이밍** — 컴포넌트/타입 `PascalCase`, 훅 `use*`, 함수/변수 `camelCase`, 모듈 상수 `UPPER_CASE`,
  상수 객체(queryKeys 등) `camelCase`. `@typescript-eslint/naming-convention`이 **error로 강제**한다
  (객체 리터럴 키·import 별칭은 false positive 방지로 미강제).
- **import 정렬(자동)** — `simple-import-sort`가 `side-effect → 외부 → @/ 레이어(app→shared) → 상대경로`
  순으로 자동 정렬한다. 수동으로 맞추지 말고 `--fix`에 맡긴다. 단, side-effect import
  (`import '@/app/config/configureApi'`)는 정렬 장벽으로 위치가 보존된다.
- **queryKey는 객체 패턴** — React Query 키는 `userKeys`/`authKeys` 같은 상수 객체로 관리하고,
  배열 리터럴을 하드코딩하지 않는다. `local/query-key-object`가 `queryKey: [...]` 리터럴을 **error로 차단**한다.
- **enum 단일 출처** — `Role` 등 도메인 값은 `entities`의 `ROLES`(`entities/user`)를 단일 출처로
  재사용한다(`z.enum(ROLES)`). 문자열 배열 중복 정의 금지.
- **MUI 스타일** — 색·간격·타이포는 theme 토큰(`sx`/`styled`, `theme.spacing()`)을 사용한다.
  하드코딩 `#hex`는 `no-restricted-syntax`가 **error로 차단**한다(theme 토큰 단일소스·스토리는 예외).
  `px`는 권장 차원. 인라인 `style` 대신 `sx`를 쓰고, `sx`에 매 렌더 새 객체를 남발하지 않는다(불필요한 리렌더 방지).
- **접근성(a11y)** — `eslint-plugin-jsx-a11y` recommended를 강제한다. 인터랙티브 요소의
  label/aria/role·키보드 접근 위반은 린트에서 막힌다.
- **JSDoc 범위** — JSDoc/주석은 공개 API(배럴로 노출되는 함수·훅)와 비자명한 로직·함정(gotcha)에
  한정한다(예: `shared/api/axiosInstance.ts`의 인증 브리지 주석). 자명한 컴포넌트엔 생략한다.
