---
name: contamination-sweep
description: >-
  전체 코드베이스 Pattern Contamination(dead code·unused export·경쟁 패턴) 정기 스윕 절차.
  "오염 정리/스윕", knip 전체 점검, dead code 일괄 제거 작업 시 적용. 전용 세션에서만 실행한다.
---

# Pattern Contamination 정기 스윕

규칙 정본은 `.claude/rules/pattern-contamination.md`. 이 스킬은 **전체 코드베이스를 한 번에** 훑는
**전용 절차**다 — 일반 작업 세션에서 돌리지 말 것(작업 diff 에 무관한 정리가 섞이면 안 된다).

## 전제

- **깨끗한 작업 트리에서 시작**한다(`git status` 로 미커밋 변경 없음 확인). 정리 결과만 단독 커밋하기 위함.

## 절차

1. **전체 탐지** — `pnpm knip` (unused files·exports).
2. **트리아지** — 각 후보를 `.claude/rules/pattern-contamination.md` 의 **false positive 가드**로 거른다:
   FSD 공개 API 배럴·라우터 lazy·MSW·Storybook·생성물(`shared/api/generated`)은 제외. 애매하면
   `git grep <symbol>` 로 참조 확인.
3. **경쟁 패턴 통일** — 같은 일을 하는 방식이 둘 이상이면 한 쪽을 표준으로 고정하고 나머지를 제거.
   표준이 모호하면 사용자에게 확인 후 진행.
4. **제거** — 확정된 dead code/unused export 삭제. `import` 정리는 hook(`format-changed-file.sh`)·eslint 가 처리.
5. **게이트 통과 확인** — `pnpm verify`(typecheck·lint·format:check·lint:fsd·test:coverage 전체 정본).
   깨지면 되돌리거나 수정.
6. **단독 커밋** — `git commit -m "chore(cleanup): <무엇을 왜 제거했는지>"`. 기능 변경과 섞지 않는다.

## 금지

- 한 커밋에 정리 + 기능 변경 혼합.
- 후보를 참조 확인 없이 일괄 삭제(특히 공개 API 배럴/lazy/생성물).
- 일반 작업 세션 중 전체 스윕(범위 폭증 → 리뷰 불가).
