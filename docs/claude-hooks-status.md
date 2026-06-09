# Claude Code 훅 자동화 — 구현 현황 및 잔여 작업

> 구현 완료분은 `.claude/`(settings·hooks·skills·agents)에 반영되어 있다. 이 문서는 상태 기록이며,
> 기존 블루프린트(구 `docs/tdd-workflow.md`) 대비 **미구현/부분 구현** 항목을 잔여 작업으로 남긴다.
> 잔여 작업은 별도 컨텍스트에서 진행한다.

## 구현 완료 (`.claude/`)

- **SessionStart** — 브랜치 + MUI 규칙(theme 토큰 사용 / sx·styled / label·aria 접근성) 주입.
- **PreToolUse(Bash) 가드** — `rm -rf /|~|$HOME`, force push, `reset --hard` 차단.
- **PostToolUse 포맷** — 변경 `*.ts/*.tsx` 에 `pnpm exec prettier --write` + `eslint --fix`, `*.{css,scss,json,md}` 에 prettier.
- **Stop 게이트(부분)** — `pnpm exec tsc -b --noEmit`(Vite project references) + `pnpm exec eslint .`. 실패 시 exit 2 로 피드백.
- **code-review 스킬 + code-reviewer 서브에이전트** — git diff 기반 React+MUI 리뷰.

## 잔여 (블루프린트 대비 미구현/부분 — 다른 컨텍스트에서 진행)

- [ ] **`/tdd` 스킬** (RED→GREEN→REFACTOR 안내) — 미구현.
- [ ] **Stop 게이트에 테스트 추가** — 현재 `tsc + lint`만. 블루프린트 목표는 `test → lint → prettier --check`.
      유닛/컴포넌트(`vitest run`)를 게이트에 포함(관련 테스트만 도는 튜닝 고려).
- [ ] **Stop 게이트에 `prettier --check` 추가**.

## 메모

- husky/lint-staged(`*.{ts,tsx}` → eslint --fix + prettier)는 **커밋 시점 안전망**으로 유지(편집·종료 게이트와 보완).
- 타입체크는 Vite project references 구조라 `tsc --noEmit` 대신 **`tsc -b --noEmit`** 를 쓴다(산출물 없이 참조 프로젝트까지 검사).
