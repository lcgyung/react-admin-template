#!/usr/bin/env bash
# PreToolUse(Bash): 위험 명령 차단
set -euo pipefail
INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

deny() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

echo "$CMD" | grep -qE 'rm[[:space:]]+-[a-z]*r[a-z]*f?[[:space:]]+(/|~|\$HOME)' && deny "위험: 루트/홈 대상 rm -rf 차단"
echo "$CMD" | grep -qE 'git[[:space:]]+push.*(--force|-f)([[:space:]]|$)'      && deny "force push 차단 — 필요하면 사람이 직접 실행"
echo "$CMD" | grep -qE 'git[[:space:]]+reset[[:space:]]+--hard'                 && deny "git reset --hard 차단 — 변경 유실 위험"
exit 0
