#!/usr/bin/env bash
# PreToolUse(Bash): 위험 명령 차단.
# 공통 규칙은 전 모드 적용, auto 계열(acceptEdits/bypassPermissions) 및 모드 미상 시 추가 규칙 강화 —
# 사용자 확인 프롬프트가 줄어드는 모드일수록 훅이 보상 통제를 맡는다(판단 불가 시 강하게: fail-closed).
set -euo pipefail
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')
MODE=$(printf '%s' "$INPUT" | jq -r '.permission_mode // empty')

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

# 공통 규칙 (전 모드)
echo "$CMD" | grep -qE 'rm[[:space:]]+-[a-z]*r[a-z]*f?[[:space:]]+(/|~|\$HOME)' && deny "위험: 루트/홈 대상 rm -rf 차단"
echo "$CMD" | grep -qE 'git[[:space:]]+push.*(--force|-f)([[:space:]]|$)'      && deny "force push 차단 — 필요하면 사람이 직접 실행"
echo "$CMD" | grep -qE 'git[[:space:]]+reset[[:space:]]+--hard'                 && deny "git reset --hard 차단 — 변경 유실 위험"

# 강화 규칙: 확인 프롬프트가 살아있는 plan/default 만 공통 규칙으로 통과시키고,
# auto 계열(acceptEdits/bypassPermissions) + 모드를 못 읽은 경우(빈/미지)는 강화 규칙 적용 (fail-closed).
case "$MODE" in
  plan|default)
    : # 공통 규칙만 — 사용자가 확인 프롬프트로 직접 판단
    ;;
  *)
    echo "$CMD" | grep -qE 'git[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'                       && deny "auto 모드 강화 규칙: git clean 차단 — untracked 파일 유실 위험, 필요하면 사람이 직접 실행"
    echo "$CMD" | grep -qE '(curl|wget)[^|]*\|[[:space:]]*(ba|z|da)?sh([[:space:]]|$)'         && deny "auto 모드 강화 규칙: 원격 스크립트 파이프 실행(curl|sh 류) 차단"
    echo "$CMD" | grep -qE 'git[[:space:]]+(checkout|restore)[[:space:]]+(--[[:space:]]+)?\.([[:space:]]|$)' && deny "auto 모드 강화 규칙: 작업트리 일괄 폐기(git checkout/restore .) 차단"
    ;;
esac

exit 0
