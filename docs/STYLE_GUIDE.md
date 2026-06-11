# 코드 스타일 가이드

이 문서는 일관된 클린코드를 위한 **사람용 상세 가이드**입니다. 대부분의 규칙은
`pnpm lint`(ESLint)·`pnpm lint:fsd`(Steiger)·커밋 훅이 자동으로 강제하므로, 여기서는
**도구가 잡아주지 못하거나 판단이 필요한 부분**을 중심으로 설명합니다.

- FSD 레이어/Public API 규칙은 [`../CLAUDE.md`](../CLAUDE.md)의 "FSD 의존성 규칙"을 따릅니다(여기서 중복 서술하지 않음).
- 변경분의 리뷰 자동 점검 기준은 [`.claude/skills/code-review`](../.claude/skills/code-review/SKILL.md)가 권위이며, 이 문서는 그 부연입니다.

## 컴포넌트

- **선언**: 화살표 함수 + `const`. `function` 선언이나 `default export`는 쓰지 않습니다
  (배럴 일관성·`react-refresh/only-export-components` 룰과 정합).

  ```tsx
  export const StatCard = ({ label, value }: StatCardProps) => { ... };
  ```

- **props 타입**: `interface NameProps`(PascalCase)로 정의하고, 보통 컴포넌트 파일 내부에 둡니다.
  여러 컴포넌트가 공유하는 props만 별도 타입 파일로 분리합니다.
- **파일당 1 컴포넌트**가 기본입니다. 한 셸을 구성하는 밀접한 컴포넌트(예: `main-layout`의
  `Header`/`Sidebar`/`MainLayout`)는 같은 `ui` 세그먼트에 둘 수 있습니다.

## 네이밍

| 대상                                | 규칙              | 예                                   |
| ----------------------------------- | ----------------- | ------------------------------------ |
| 컴포넌트 / 타입 / 인터페이스 / enum | `PascalCase`      | `UsersPage`, `User`, `StatCardProps` |
| 훅                                  | `use` + camelCase | `useAuth`, `useUsers`                |
| 일반 함수 / 변수                    | `camelCase`       | `formatDate`, `roleColor`            |
| 모듈 상수(원시값)                   | `UPPER_CASE`      | `DRAWER_WIDTH`, `ROLES`              |
| 상수 객체(queryKeys 등)             | `camelCase`       | `userKeys`, `authKeys`               |
| 파일명(컴포넌트)                    | `PascalCase.tsx`  | `LoginPage.tsx`                      |
| 파일명(훅·모델·유틸)                | `camelCase.ts`    | `useAuth.ts`, `loginSchema.ts`       |

- 위 규칙은 `@typescript-eslint/naming-convention`이 `warn`으로 노출합니다(자동수정 불가).
- boolean 변수의 `is`/`has` 접두는 **권장**하되 강제하지 않습니다(예: `isLoading`, `hasError`).
- 세그먼트 이름은 "왜"(`ui`/`api`/`model`/`lib`/`config`)로. `components`/`hooks` 금지 — CLAUDE.md 참조.

## import 순서

`eslint-plugin-simple-import-sort`가 아래 순서로 **자동 정렬**합니다. 수동으로 맞추지 말고
`pnpm lint -- --fix`(또는 저장 시 훅)에 맡기세요.

1. side-effect import (예: `import '@/app/config/configureApi'`)
2. 외부 패키지 (`react` 우선)
3. FSD 레이어 — 상위(`@/app`) → 하위(`@/shared`) 순서로 한 블록
4. 슬라이스 내부 상대경로(`../`, `./`)

블록 사이에는 빈 줄을 둡니다. `import type`은 같은 경로 그룹 안에서 정렬됩니다.

## 서버 상태 (React Query)

- queryKey는 **`xxxKeys` 상수 객체**로 관리합니다. 배열 리터럴을 컴포넌트/훅에 하드코딩하지 않습니다.

  ```ts
  // features/users/model/useUsers.ts
  export const userKeys = {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  };
  // features/auth/model/useAuth.ts
  export const authKeys = { me: ['me'] as const };
  ```

- `invalidateQueries`/`getQueryData` 등은 위 키 객체를 참조합니다(`queryKey: userKeys.all`).
- 컴포넌트에서 `axios`를 직접 호출하지 않고 feature 훅을 거칩니다. 자세한 규칙은 CLAUDE.md "아키텍처" 참조.

## 폼 / 검증 (Zod)

- 스키마는 해당 feature의 `model` 세그먼트에 `*Schema.ts`로 두고, `z.infer`로 타입을 파생합니다.
- enum 값은 **도메인 단일 출처**를 재사용합니다. 문자열 배열을 중복 정의하지 마세요.

  ```ts
  // entities/user/model/types.ts — 단일 출처
  export const ROLES = ['admin', 'manager', 'user'] as const;
  export type Role = (typeof ROLES)[number];

  // features/users/model/userFormSchema.ts — 재사용 (Public API 배럴 경유)
  import { ROLES } from '@/entities/user';
  role: z.enum(ROLES);
  ```

## MUI 스타일

- 색·간격·타이포는 **theme 토큰**을 사용합니다. 하드코딩한 `#hex`/`px`를 지양하고 `sx`/`styled`,
  `theme.spacing()`을 씁니다. 인라인 `style` 대신 `sx`를 씁니다.
- `sx`에 매 렌더 새 객체를 남발하지 않습니다(불필요한 리렌더 방지).
- 반복되는 매직 값은 상수화합니다(예: `DRAWER_WIDTH`).
- 접근성: 인터랙티브 요소에 `label`/`aria`/`role`을 부여하고 키보드 접근을 보장합니다.
  `eslint-plugin-jsx-a11y`가 1차로 점검합니다.

## 주석 / JSDoc

- **최소 보일러플레이트** 원칙. 자명한 컴포넌트에는 주석을 달지 않습니다.
- JSDoc/주석은 **공개 API**(배럴로 노출되는 함수·훅)와 **비자명한 로직·함정(gotcha)**에 한정합니다.
  대표 예: `shared/api/axiosInstance.ts`의 인증 브리지 주석.

## 커밋

- [Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다. `.husky/commit-msg`의
  commitlint가 형식을 **강제**합니다. 타입·스코프 규칙은 [`../CONTRIBUTING.md`](../CONTRIBUTING.md) 참조.
