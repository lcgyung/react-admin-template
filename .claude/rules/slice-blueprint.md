---
paths:
  - 'src/features/**'
  - 'src/entities/**'
  - 'src/shared/**'
  - 'tools/templates/**'
  - 'plopfile.mjs'
---

# 슬라이스 파일 구현 골격 (새 슬라이스 작성 규약)

폴더/레이어 구조는 `steiger`가 강제하지만, **슬라이스 내부 파일을 어떻게 채우는가**는 아래 골격을
정본으로 통일한다. 새 슬라이스는 **`pnpm gen:slice`** 로 생성하면 이 골격대로 스캐폴딩된다(수기
작성 시에도 동일 골격을 따른다). `tools/templates/slice/`의 plop 템플릿은 이 문서와 1:1 정합을
유지해야 한다. 🔒 표시 항목은 ESLint가 **error로 하드 강제**한다(게이트·CI 차단).

## feature 슬라이스 (`src/features/<name>/`)

정본: `src/features/users/`.

- `index.ts` (Public API 배럴) — 스키마 타입·스키마·훅·keys 만 export. **api 함수는 노출 금지.**

  ```ts
  export type { UserFormValues } from './model/userFormSchema';
  export { userFormSchema } from './model/userFormSchema';
  export { useCreateUser, userKeys, useUser, useUsers } from './model/useUsers';
  ```

- `api/<name>Api.ts` — raw axios named async 함수. 🔒 `axiosInstance`는 `api/` 세그먼트에서만 import.

  ```ts
  export const getUsers = async () => {
    const { data } = await axiosInstance.get<User[]>('/users');
    return data;
  };
  ```

- `model/<name>Schema.ts` — zod 스키마 + `z.infer` 추론 타입. 도메인 값은 `ROLES` 등 단일소스 재사용.

  ```ts
  export const userFormSchema = z.object({ name: z.string().min(1), role: z.enum(ROLES) });
  export type UserFormValues = z.infer<typeof userFormSchema>;
  ```

- `model/use<Name>.ts` — 맨 위 `keys` 상수 객체, 아래 훅이 `queryKey: <keys>.*` 참조.
  🔒 queryKey 배열 리터럴 금지(상수 객체만).

  ```ts
  export const userKeys = {
    all: ['users'] as const,
    detail: (id: number) => ['users', id] as const,
  };
  export const useUsers = () => useQuery({ queryKey: userKeys.all, queryFn: getUsers });
  ```

## entity 슬라이스 (`src/entities/<name>/`)

정본: `src/entities/user/`.

- `index.ts` — 도메인 타입·상수·헬퍼만 export.
- `model/types.ts` — 도메인 타입 + `ROLES` 류 단일소스 상수(`as const`).
- `@x/<other>.ts` — 다른 entity에 타입을 노출하는 크로스임포트(예: `entities/user/@x/session`).

**검증 정책 — entity 는 타입 전용 레이어다.** 별도 테스트/검증 하네스를 두지 않는다(FSD 레이어 정책).

- entity 슬라이스는 **타입 전용** → `*.test.ts` 단위 테스트 **비대상**(인터페이스엔 실행 코드가 없다).
- 적합성 게이트 = `tsc` + `src/app/mocks/data.ts` 의 **타입드 시드 리터럴**(엔티티 타입에 고정된 시드가
  타입 위반 시 컴파일 실패 — 컴파일타임 적합성 검사) + steiger `insignificant-slice`(소비처 1개 이상 보장).
- **런타임/zod 검증은 entity 가 아니라 feature 연동 시** `model/*Schema.ts`·api 경계에서 한다.
- 예외: `session` 처럼 **런타임 로직(스토어·헬퍼)을 가진 슬라이스만** `*.test.ts` 대상이다.

## shared (`src/shared/<segment>/`)

세그먼트 배럴로만 노출: `@/shared/api`, `@/shared/config`, `@/shared/ui/<Name>`, `@/shared/lib/<name>`.

## 새 슬라이스 체크리스트

1. `pnpm gen:slice` 로 생성(layer·이름 입력) — 골격 자동 스캐폴딩(생성물에 `eslint --fix`+prettier 자동 적용).
   생성 직후엔 미참조라 `steiger`가 `fsd/insignificant-slice`로 막으니, 상위(페이지 등)에서 import해 연결해야 게이트가 통과한다.
2. 배럴(`index.ts`)은 스키마·훅·keys 만 노출(api 함수 제외). 🔒(steiger: 배럴 경유 강제)
3. queryKey 는 `keys` 상수 객체. 🔒
4. `axiosInstance` 호출은 `api/` 세그먼트에만. 🔒
5. export 는 named only(default export 금지). 🔒
6. 폼 스키마는 `model/*Schema.ts` 에 zod로, `z.infer` 로 타입 추론.
