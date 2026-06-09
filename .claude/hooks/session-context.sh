#!/usr/bin/env bash
# SessionStart: 현재 브랜치/규칙을 컨텍스트로 주입
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
jq -n --arg b "$BRANCH" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: ("현재 브랜치: \($b)\nMUI 규칙: 색/간격은 theme 토큰 사용(하드코딩 금지). 스타일은 sx/styled. label·aria로 접근성 확보.")
  }
}'
