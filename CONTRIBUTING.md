# Contributing

이 문서는 `react-admin-template`에 기여할 때의 브랜치 전략·커밋 컨벤션·버전 규칙을 정의합니다.

## 브랜치 전략

- `main` — 릴리스 브랜치. **직접 푸시 금지**, 항상 PR을 경유합니다.
- `dev` — 통합 브랜치. 기능 작업이 모이고, 릴리스 시 `main`으로 PR합니다.
- `feat/*` · `fix/*` · `chore/*` · `docs/*` · `refactor/*` — 작업 브랜치. `dev`에서 분기합니다.

## 커밋 / PR 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/)를 따릅니다.

- 타입: `feat` / `fix` / `chore` / `docs` / `refactor` / `test` / `style` 등
- 스코프(선택): 변경 영역을 괄호로. 예) `feat(fsd): ...`, `chore(release): ...`
- 형식: `type(scope): subject`
- 커밋 시 `.husky/commit-msg`의 commitlint(`@commitlint/config-conventional`)가 이 형식을 **자동 강제**합니다.

PR은 [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) 양식을 채워 작성하고, 폴더 구조·네이밍·라이브러리 선택 등 결정 사항을 본문에 명시합니다.

## 버전 규칙

[Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

- **MAJOR** — 호환성이 깨지는 변경
- **MINOR** — 하위 호환 기능 추가
- **PATCH** — 하위 호환 버그 수정

릴리스 시 다음 3가지를 동기화합니다: `package.json`의 `version`, `CHANGELOG.md`의 해당 버전 항목, `vX.Y.Z` git 태그.

## 로컬 검증 게이트

PR을 올리기 전에 아래를 모두 통과시킵니다(Stop 게이트 `gate.sh` 및 CI와 동일):

```bash
pnpm lint          # ESLint
pnpm lint:fsd      # FSD 레이어/Public API 규칙 (Steiger)
pnpm test          # Vitest
pnpm build         # tsc -b 타입체크 + vite build
```

> 패키지 매니저는 **pnpm** 입니다. 커밋 시 Husky + Lint-Staged가 변경 파일에 `eslint --fix` + `prettier`를 자동 적용합니다.
