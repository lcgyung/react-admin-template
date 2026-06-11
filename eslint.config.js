import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'storybook-static',
      'coverage',
      'public/mockServiceWorker.js',
      // orval 생성물 — import 정렬·네이밍 규칙 비대상.
      'src/shared/api/generated',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    // function-component-definition 룰만 켜기 위해 react 플러그인을 등록한다(recommended 미확장).
    settings: { react: { version: 'detect' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // 컴포넌트 선언은 화살표 함수로 통일(이미 전 컴포넌트가 화살표 — 위반 0건).
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      // import/export 정렬 — FSD 레이어(app→shared) 인지 그룹핑. --fix 자동.
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. side-effect import (예: import '@/app/config/configureApi' — 인증 브리지, 제거 금지)
            ['^\\u0000'],
            // 2. 외부 패키지 (react 우선)
            ['^react', '^@?\\w'],
            // 3. FSD 레이어 — 한 블록 안에서 상위(app)→하위(shared) 순서로 정렬
            [
              '^@/app(/.*)?$',
              '^@/pages(/.*)?$',
              '^@/widgets(/.*)?$',
              '^@/features(/.*)?$',
              '^@/entities(/.*)?$',
              '^@/shared(/.*)?$',
              '^@/',
            ],
            // 4. 슬라이스 내부 상대경로 (부모 → 동일 디렉터리)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      // 네이밍 컨벤션 — 노이즈 최소 셋(현재 코드 위반 0건). 자동수정 불가라 warn.
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        // PascalCase 허용: 컴포넌트를 인자로 받는 경우(Storybook 데코레이터·render prop·HOC)
        { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
        { selector: 'typeLike', format: ['PascalCase'] },
        // UPPER_CASE 허용: 환경변수·상수성 타입 멤버(예: ImportMetaEnv의 VITE_*)
        { selector: 'typeProperty', format: ['camelCase', 'UPPER_CASE'] },
        // 객체 리터럴 프로퍼티/import 별칭은 형식 강제 안 함 (mocks·sx·zod·API 키 false positive 차단)
        { selector: 'objectLiteralProperty', format: null },
        { selector: 'import', format: null },
      ],
      // 색상 하드코딩 금지(권장) — sx/styled 등에서 #hex 리터럴 사용 시 theme 토큰 사용을 유도한다.
      // 단일 소스인 features/theme/model/tokens.ts·스토리는 아래 override 로 예외. 게이트 차단 방지 위해 warn.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
          message:
            '색상은 theme 토큰을 사용하세요(하드코딩 #hex 금지). features/theme 의 토큰을 참고하세요.',
        },
      ],
    },
  },
  {
    // 테마 토큰 단일 소스와 스토리는 색상 하드코딩 규칙 예외.
    files: ['src/features/theme/model/tokens.ts', '**/*.stories.tsx'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  jsxA11y.flatConfigs.recommended,
  ...storybook.configs['flat/recommended'],
  // DOM XSS 정적 차단 — innerHTML/insertAdjacentHTML 등 비살균 sink 에 비literal 전달 시 error.
  noUnsanitized.configs.recommended,
  // 시큐어 코딩 정적 점검(eslint-plugin-security). 룰 기본 severity 는 warn.
  security.configs.recommended,
  {
    rules: {
      // no-unsanitized 는 명시적으로 error 로 하드 고정(권장셋이 error 지만 의도를 코드로 남긴다).
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
      // 프론트(브라우저) 코드에서 false positive 가 큰 두 룰은 비활성:
      // - detect-object-injection: 모든 obj[var] 접근에 발화(노이즈).
      // - detect-possible-timing-attacks: 목 로그인의 password 비교 등에 오탐(실인증은 백엔드 몫).
      'security/detect-object-injection': 'off',
      'security/detect-possible-timing-attacks': 'off',
    },
  },
  prettier,
);
