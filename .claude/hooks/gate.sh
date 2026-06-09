#!/usr/bin/env bash
# Stop: 타입체크 + 린트 게이트. 실패 시 exit 2 → Claude가 계속 수정
# Vite project references 구조이므로 `tsc -b`(빌드 모드)로 타입체크. --noEmit 로 산출물 없이 검사.
set -uo pipefail
ERR=""

if ! pnpm exec tsc -b --noEmit >/tmp/cc_tsc.log 2>&1; then
  ERR+="[typecheck 실패]\n$(tail -n 40 /tmp/cc_tsc.log)\n\n"
fi

if ! pnpm exec eslint . >/tmp/cc_eslint.log 2>&1; then
  ERR+="[lint 실패]\n$(tail -n 40 /tmp/cc_eslint.log)\n\n"
fi

# (선택) 컴포넌트 테스트 게이트 — 느리면 제외
# if ! pnpm exec vitest run --silent >/tmp/cc_vitest.log 2>&1; then
#   ERR+="[test 실패]\n$(tail -n 40 /tmp/cc_vitest.log)\n\n"
# fi

if [ -n "$ERR" ]; then
  printf "%b" "$ERR" >&2
  exit 2
fi
exit 0
