#!/usr/bin/env bash
# SessionStart: 현재 브랜치를 컨텍스트로 주입 (정적 규칙은 CLAUDE.md·.claude/rules 가 담당)
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
cc_emit_session_context "현재 브랜치: $BRANCH"
