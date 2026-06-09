#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit): 변경 파일만 포맷/린트 (pnpm)
set -euo pipefail
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0
[ -f "$FILE" ] || exit 0

case "$FILE" in
  *.ts|*.tsx)
    pnpm exec prettier --write "$FILE" >/dev/null 2>&1 || true
    pnpm exec eslint --fix "$FILE"     >/dev/null 2>&1 || true
    ;;
  *.css|*.scss|*.json|*.md)
    pnpm exec prettier --write "$FILE" >/dev/null 2>&1 || true
    ;;
esac
exit 0
