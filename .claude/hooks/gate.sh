#!/usr/bin/env bash
# Stop: 타입체크 + 린트 + FSD(steiger) + 테스트 게이트. 실패 시 exit 2 → Claude가 계속 수정
# Vite project references 구조이므로 `tsc -b`(빌드 모드)로 타입체크. --noEmit 로 산출물 없이 검사.
set -uo pipefail

# 무한루프 가드: Stop 훅이 이미 한 번 차단한 뒤 재호출된 경우(stop_hook_active=true)는 통과.
INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# 훅은 Claude의 cwd(하위 디렉터리일 수 있음)를 상속하므로 repo 루트로 이동.
# (tsc -b / eslint . / vitest / steiger 가 cwd=루트를 전제하므로 필수)
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" || exit 1
ERR=""

if ! pnpm exec tsc -b --noEmit >/tmp/cc_tsc.log 2>&1; then
  ERR+="[typecheck 실패]\n$(tail -n 40 /tmp/cc_tsc.log)\n\n"
fi

if ! pnpm exec eslint . >/tmp/cc_eslint.log 2>&1; then
  ERR+="[lint 실패]\n$(tail -n 40 /tmp/cc_eslint.log)\n\n"
fi

# FSD 레이어/Public API 규칙 (즉시 error 하드 차단)
if ! pnpm exec steiger ./src >/tmp/cc_steiger.log 2>&1; then
  ERR+="[FSD(steiger) 위반]\n$(tail -n 40 /tmp/cc_steiger.log)\n\n"
fi

if ! pnpm exec vitest run --silent >/tmp/cc_vitest.log 2>&1; then
  ERR+="[test 실패]\n$(tail -n 40 /tmp/cc_vitest.log)\n\n"
fi

if [ -n "$ERR" ]; then
  printf "%b" "$ERR" >&2
  exit 2
fi
exit 0
