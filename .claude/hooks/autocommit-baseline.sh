#!/usr/bin/env bash
# SessionStart: 세션 시작 시점의 기존 dirty 파일별 내용(blob) 해시를 baseline 으로 기록한다.
# gate.sh 가 이 baseline 과 현재 내용 해시를 비교해 "현재 세션이 바꾼 파일"을 가려내어
# (1) 스코프 검증(세션 파일만 lint/format/test)과 (2) 자동 커밋 넛지(own/overlap 분할) 양쪽에
# 쓴다(내용 해시라 기존 dirty 파일을 세션이 더 편집한 경우도 잡힌다 — 목록이 아닌 내용 비교).
# baseline 은 CC_AUTOCOMMIT 토글과 무관하게 항상 기록한다 — 스코프 검증이 이를 전제하기 때문.
# 자동 커밋 넛지 자체는 gate.sh 의 CC_AUTOCOMMIT 가드가 계속 통제. 모든 git 호출은 실패 비차단.
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

INPUT=$(cat 2>/dev/null || true)

# 세션 식별자(상태 파일 키). 동시 세션 격리. 없으면 'nosid' 로 폴백.
SID=$(cc_session_id "$INPUT")

cc_cd_root || exit 0
GITDIR=$(cc_git_dir)
DIR="$GITDIR/cc_autocommit"
mkdir -p "$DIR" 2>/dev/null || exit 0

# 오래된 세션 잔여 정리(베스트에포트).
find "$DIR" -type f -mtime +7 -delete 2>/dev/null || true

# 기존 dirty(추적) 파일별 시작 시점 워킹트리 blob 해시 기록: "<hash> <relpath>".
# baseline 파일은 항상 생성(빈 파일이면 '세션 시작 시 clean' 을 뜻함).
BASELINE="$DIR/$SID.baseline"
: >"$BASELINE" 2>/dev/null || exit 0
git diff --name-only HEAD 2>/dev/null | while IFS= read -r f; do
  [ -n "$f" ] || continue
  if [ -e "$f" ]; then
    h=$(git hash-object "$f" 2>/dev/null || echo "")
    [ -n "$h" ] && printf '%s %s\n' "$h" "$f" >>"$BASELINE"
  else
    # 시작 시 이미 삭제된 기존 WIP — DELETED 센티넬로 기록해 세션이 새로 지운 파일과 구분.
    printf 'DELETED %s\n' "$f" >>"$BASELINE"
  fi
done

# 새 세션이므로 직전 넛지 dedup 해시도 초기화.
: >"$DIR/$SID.last" 2>/dev/null || true

exit 0
