#!/usr/bin/env bash
# SessionStart: knip 으로 dead code/unused export 를 탐지해 "오염 맵" 요약을 컨텍스트로 주입한다(Pattern Contamination 인지).
# 정책: 탐지·인지 전용 — 삭제/커밋은 하지 않는다. 정리는 .claude/rules/pattern-contamination.md 가 에이전트를 유도한다.
# 안전: 게이트(CC_CONTAMINATION_REPORT — 이 리포는 settings.json env 로 기본 활성) · 타임아웃 · 캐시(lockfile/package.json mtime) · 실패 시 비차단(graceful degrade).
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# 게이트 꺼져 있으면 조용히 통과(이 리포는 settings.json env 의 CC_CONTAMINATION_REPORT=1 로 기본 활성; 끄려면 env 제거)
[ -z "${CC_CONTAMINATION_REPORT:-}" ] && exit 0
# 중첩 claude -p 가 세션을 다시 트리거하는 재귀 방지
[ -n "${CC_GATE_SKIP:-}" ] && exit 0
# knip 미설치(clean checkout/CI 등) → 비차단
pnpm exec knip --version >/dev/null 2>&1 || exit 0

# 훅은 Claude 의 cwd(하위 디렉터리일 수 있음)를 상속하므로 repo 루트로 이동 — 아래 CACHE·신선도
# 비교(pnpm-lock.yaml·package.json)가 모두 cwd=루트 전제 상대경로다. cd 실패 시 비차단.
cc_cd_root || exit 0
CACHE="$(cc_git_dir)/cc_knip_cache"

# 캐시 신선도: 캐시가 lockfile·package.json 보다 최신이면 재사용(매 세션 knip 재실행 회피)
if [ -f "$CACHE" ] && [ "$CACHE" -nt "pnpm-lock.yaml" ] && [ "$CACHE" -nt "package.json" ]; then
  cc_emit_session_context "$(cat "$CACHE" 2>/dev/null || echo '')"
  exit 0
fi

OUT_F=$(mktemp 2>/dev/null || echo "/tmp/cc_knip_$$")
# dependencies 분석은 config/test 전체 커버가 필요해 오탐이 많으므로 files,exports 만(룰과 동일 스코프).
# 타임아웃 래퍼는 결합 출력(2>&1)을 캡처하므로, knip stderr 노이즈는 sh -c 안에서 직접 버려 요약 오염 방지.
run_with_timeout 60 "$OUT_F" sh -c 'env CC_GATE_SKIP=1 pnpm exec knip --include files,exports --no-progress --reporter compact 2>/dev/null'
RAW=$(head -n 40 "$OUT_F" 2>/dev/null || true)
rm -f "$OUT_F"

if [ -z "$RAW" ]; then
  printf 'Pattern Contamination(knip): 탐지된 dead code/unused export 없음(또는 분석 생략).' >"$CACHE" 2>/dev/null || true
  cc_emit_session_context "$(cat "$CACHE" 2>/dev/null || echo '')"
  exit 0
fi

SUMMARY="Pattern Contamination 후보(knip — files,exports). 정책 정본: .claude/rules/pattern-contamination.md
$RAW

주의: 위는 '후보'다. FSD 공개 API 배럴(index.ts/index.tsx)·라우터 lazy 컴포넌트·MSW 핸들러·Storybook 스토리·생성물(src/shared/api/generated)은 정적 unused 여도 삭제 금지 — 참조 경로 확인 후 판단. FSD 경계는 steiger 가 별도 강제.
정리는 현재 작업 범위 내에서만, 기능 변경과 분리해 chore(cleanup): 단독 커밋. 전체 일괄 정리는 /contamination-sweep 로."

printf '%s' "$SUMMARY" >"$CACHE" 2>/dev/null || true
cc_emit_session_context "$SUMMARY"
exit 0
