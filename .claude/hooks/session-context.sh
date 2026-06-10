#!/usr/bin/env bash
# SessionStart: 현재 브랜치/규칙을 컨텍스트로 주입
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
jq -n --arg b "$BRANCH" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("현재 브랜치: \($b)\nMUI 규칙: 색/간격은 theme 토큰 사용(하드코딩 금지). 스타일은 sx/styled. label·aria로 접근성 확보.\nFSD 규칙: src는 app>pages>widgets>features>entities>shared 레이어. 자기보다 아래 레이어만 import 가능, 같은 레이어 슬라이스 간 import 금지(@x 예외). 슬라이스 간 import는 index.ts(Public API) 경유, shared는 세그먼트 배럴(@/shared/api 등) 경유. 게이트: pnpm lint:fsd(steiger).")
  }
}'
