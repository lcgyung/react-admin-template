#!/usr/bin/env bash
# 훅 공용 헬퍼. source 전용(직접 실행 X).
# gate.sh · contamination-report.sh · autocommit-baseline.sh · session-context.sh 가 공유한다.

# 순수 bash 타임아웃 래퍼: macOS 기본 timeout/gtimeout 바이너리가 없으므로 직접 구현.
# <secs> <outfile> <cmd...> → cmd 의 종료코드를 반환. secs 초과 시 SIGTERM 후 SIGKILL.
#
# 별도 watcher 서브셸 대신 1초 폴링(kill -0)으로 감시한다 — gate 는 Stop 마다 5개를 병렬로
# 띄우므로, watcher+sleep 방식은 orphan sleep 누적과 "Terminated" 작업제어 메시지 누출을 부른다.
# 폴링 방식은 백그라운드 프로세스가 cmd 하나뿐이라 둘 다 발생하지 않는다.
run_with_timeout() {
  local secs=$1 out=$2
  shift 2
  "$@" >"$out" 2>&1 &
  local pid=$! count=0
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$count" -ge "$secs" ]; then
      kill -TERM "$pid" 2>/dev/null
      sleep 2
      kill -KILL "$pid" 2>/dev/null
      break
    fi
    sleep 1
    count=$((count + 1))
  done
  wait "$pid" 2>/dev/null
  return $?
}

# repo 루트로 이동. 훅은 Claude 의 cwd(하위 디렉터리일 수 있음)를 상속하므로 루트 전제 명령
# (tsc -b / eslint . / vitest / steiger / knip 캐시 상대경로) 전에 호출한다. cd 실패 시 비영(non-zero)
# 을 반환하므로 호출부가 `cc_cd_root || exit N` 으로 차단 정책을 결정한다.
cc_cd_root() {
  cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}" 2>/dev/null
}

# git 디렉터리 경로(상태 파일·캐시 기록 위치). worktree/submodule 에서 `.git` 이 파일/별도경로일 수
# 있으므로 하드코딩 대신 rev-parse. git 밖이면 `.git` 로 폴백.
cc_git_dir() {
  git rev-parse --git-dir 2>/dev/null || echo ".git"
}

# 세션 식별자(상태 파일 키). 동시 세션 격리. <hook stdin JSON> → sanitize 된 SID(없으면 'nosid').
cc_session_id() {
  local sid
  sid=$(printf '%s' "$1" | jq -r '.session_id // empty' 2>/dev/null || echo "")
  printf '%s' "${sid:-nosid}" | tr -c 'A-Za-z0-9_.-' '_'
}

# SessionStart additionalContext 출력. <summary> → hookSpecificOutput JSON.
cc_emit_session_context() {
  jq -n --arg s "$1" '{hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: $s}}'
}
