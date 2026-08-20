#!/usr/bin/env bash
# Stop: 스코프 검증 게이트. 현재 세션이 바꾼 파일에 한해 lint·format·관련 테스트를 검사하고,
# 전체 그래프 검사(tsc -b · steiger)는 전체 실행·차단한다(파일 단위로 못 쪼갬). 실패 시 exit 2.
# 세션 스코프는 SessionStart baseline(.git/cc_autocommit/<sid>.baseline) 대비 내용 해시 diff 로
# 가려낸다 — 같은 dev 브랜치의 타 작업(병렬 편집·기존 WIP)이 내 검증/커밋을 막지 않게 하기 위함.
# 커버리지 ratchet 은 CI(pnpm test:coverage)가 전체 강제(로컬은 vitest related — 관련 테스트만).
# 검사는 병렬 실행 + 명령별 타임아웃(lib.sh 순수 bash 래퍼) + 세션별 격리 로그(mktemp).
set -uo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# 무한루프 가드: Stop 훅이 이미 한 번 차단한 뒤 재호출된 경우(stop_hook_active=true)는 통과.
INPUT=$(cat 2>/dev/null || true)
if printf '%s' "$INPUT" | jq -e '.stop_hook_active == true' >/dev/null 2>&1; then
  exit 0
fi

# plan mode: 편집 금지 모드라 변경분이 없음 — 게이트 스킵.
# 필드가 없거나 파싱 실패면 검사하는 쪽(게이트)으로 폴백.
if printf '%s' "$INPUT" | jq -e '.permission_mode == "plan"' >/dev/null 2>&1; then
  exit 0
fi

# 훅은 Claude의 cwd(하위 디렉터리일 수 있음)를 상속하므로 repo 루트로 이동.
# (tsc -b / eslint / vitest / steiger 가 cwd=루트를 전제하므로 필수)
cc_cd_root || exit 1

# ── 세션 스코프 계산(검증·커밋 넛지 공용) ───────────────────────────────────────
# SessionStart baseline(시작 시점 내용 해시)에 없거나 해시가 달라진 추적 파일이 "세션 작업".
# 내용 해시라 기존 dirty 파일을 세션이 더 편집한 경우도 잡히고, 손대지 않은 기존 WIP 는 제외된다.
# (macOS bash 3.2 호환: 배열 대신 개행 구분 문자열 — 경로 공백 없음 가정, FSD 컨벤션상 해당 없음.)
SID=$(cc_session_id "$INPUT")
GITDIR=$(cc_git_dir)
DIR="$GITDIR/cc_autocommit"
BASELINE="$DIR/$SID.baseline"
LAST="$DIR/$SID.last"

SESSION=""
N=0
FALLBACK=""
if [ -f "$BASELINE" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    if [ -e "$f" ]; then bh=$(git hash-object "$f" 2>/dev/null || echo ""); else bh="DELETED"; fi
    base=$(awk -v f="$f" '$2==f{print $1; exit}' "$BASELINE" 2>/dev/null || echo "")
    if [ -z "$base" ] || [ "$bh" != "$base" ]; then
      SESSION="$SESSION$f"$'\n'
      N=$((N + 1))
    fi
  done < <(git diff --name-only HEAD 2>/dev/null)
else
  # baseline 없음(SessionStart 미실행 등) → 세션 구분 불가: 보수적으로 전체 검증·전체 변경 폴백.
  FALLBACK=" (baseline 없음 — 전체 검증·전체 변경 폴백)"
  while IFS= read -r f; do
    [ -n "$f" ] && { SESSION="$SESSION$f"$'\n'; N=$((N + 1)); }
  done < <(git diff --name-only HEAD 2>/dev/null)
fi

# 세션이 바꾼 추적 파일이 없으면 검증·넛지 모두 스킵(타 작업으로 게이트가 돌지 않게).
if [ "$N" -eq 0 ]; then
  exit 0
fi

# ── 검사 인프라(병렬 + 타임아웃 + 세션별 로그) ──────────────────────────────────
GATE_TIMEOUT="${CC_GATE_TIMEOUT:-180}"
LOGDIR=$(mktemp -d 2>/dev/null || echo "/tmp/cc_gate_$$")
mkdir -p "$LOGDIR"

# 각 검사를 백그라운드로 동시 실행 — 종료코드는 라벨별 .rc 파일에 기록.
launch() { # <label> <cmd...>
  local label=$1
  shift
  (
    run_with_timeout "$GATE_TIMEOUT" "$LOGDIR/$label.log" "$@"
    echo $? >"$LOGDIR/$label.rc"
  ) &
}

# 검사 명령 정의는 package.json scripts 단일 출처 경유(바이너리 인라인 금지).
# tsc -b · steiger 는 전체 그래프라 전체 실행·차단(전체 정본 pnpm verify·CI 와 동일 스크립트).
# eslint · prettier · vitest 는 세션 파일로 스코프 — 타 작업이 게이트를 막지 않게.
if [ -z "$FALLBACK" ]; then
  # 세션 파일을 확장자별로 분류(eslint: ts/tsx, prettier: 광범위, vitest: src 의 ts/tsx).
  ESLINT_FILES=""
  PRETTIER_FILES=""
  SRC_FILES=""
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    [ -e "$f" ] || continue # 삭제 파일은 검사 대상 제외
    case "$f" in
      *.ts | *.tsx) ESLINT_FILES="$ESLINT_FILES $f" ;;
    esac
    case "$f" in
      *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.css | *.scss | *.md | *.html | *.yml | *.yaml)
        PRETTIER_FILES="$PRETTIER_FILES $f"
        ;;
    esac
    case "$f" in
      src/*) case "$f" in *.ts | *.tsx) SRC_FILES="$SRC_FILES $f" ;; esac ;;
    esac
  done <<EOF
$SESSION
EOF

  launch typecheck pnpm typecheck
  launch fsd pnpm lint:fsd
  [ -n "$ESLINT_FILES" ] && launch lint pnpm lint:files $ESLINT_FILES
  [ -n "$PRETTIER_FILES" ] && launch format pnpm format:check:files $PRETTIER_FILES
  [ -n "$SRC_FILES" ] && launch test pnpm test:related $SRC_FILES
else
  # 폴백(baseline 없음): 세션 구분 불가 → 전체 5종 게이트(현행 안전 동작).
  launch typecheck pnpm typecheck
  launch lint pnpm lint
  launch format pnpm format:check
  launch fsd pnpm lint:fsd
  launch test pnpm run test:coverage
fi

wait

ERR=""
add_err() { # <label> <헤더> <tail줄수>
  local label=$1 header=$2 lines=$3 rc
  [ -f "$LOGDIR/$label.rc" ] || return 0 # 스킵된(런치 안 한) 라벨은 무시
  rc=$(cat "$LOGDIR/$label.rc" 2>/dev/null || echo 1)
  if [ "$rc" != "0" ]; then
    ERR+="[$header]\n$(tail -n "$lines" "$LOGDIR/$label.log" 2>/dev/null)\n\n"
  fi
}

add_err typecheck "typecheck 실패" 40
add_err lint "lint 실패" 40
add_err format "format 실패 — pnpm format 으로 정리" 20
add_err fsd "FSD(steiger) 위반" 40
add_err test "test 실패" 60

rm -rf "$LOGDIR"

if [ -n "$ERR" ]; then
  printf "%b" "$ERR" >&2
  exit 2
fi

# ── 게이트 green — 자동 커밋 넛지(own/overlap 분할; 옵트인 CC_AUTOCOMMIT, settings.json env) ──
# 정책: 훅은 직접 커밋하지 않는다(bash 라 한글 Conventional Commits 메시지를 못 만든다).
# 세션 시작 시 clean 이던(=baseline 없는) 파일 = own → 자동 커밋 넛지.
# 세션 시작 시 이미 dirty 였던(=병렬/기존 작업과 겹치는) 파일 = overlap → 보류·사용자 확인.
# 작성·실행 주체는 Claude(메시지 품질·판단 보존). 무한루프는 상단 stop_hook_active 가드가 차단.
if [ -n "${CC_AUTOCOMMIT:-}" ]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
  PROTECT="${CC_AUTOCOMMIT_PROTECT:-main master}"
  # 보호 브랜치면 자동 커밋 금지 — 브랜치 우선(CLAUDE.md 규약에 위임).
  case " $PROTECT " in *" $BRANCH "*) BRANCH="" ;; esac
  if [ -n "$BRANCH" ]; then
    # 상태변화 시에만 넛지(매 턴 잔소리 방지): 세션 스코프 diff 내용 해시가 직전과 같으면 skip.
    SESSION_FILES=$(printf '%s' "$SESSION" | tr '\n' ' ')
    HASH=$(git diff HEAD -- $SESSION_FILES 2>/dev/null | git hash-object --stdin 2>/dev/null || echo "")
    if [ -n "$HASH" ] && [ "$HASH" = "$(cat "$LAST" 2>/dev/null)" ]; then
      exit 0
    fi
    mkdir -p "$DIR" 2>/dev/null || true
    printf '%s' "$HASH" >"$LAST" 2>/dev/null || true

    # 세션 파일을 own/overlap 으로 분할: baseline 에 있던(시작 시 dirty) 파일이 overlap.
    OWN=""
    OVERLAP=""
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      if [ -f "$BASELINE" ] && awk -v f="$f" 'NF>=2 && $2==f{ok=1} END{exit !ok}' "$BASELINE"; then
        OVERLAP="$OVERLAP $f"
      else
        OWN="$OWN $f"
      fi
    done <<EOF
$SESSION
EOF
    OWN=$(printf '%s' "$OWN" | sed 's/^ *//')
    OVERLAP=$(printf '%s' "$OVERLAP" | sed 's/^ *//')

    MSG=""
    if [ -n "$OWN" ]; then
      MSG="$MSG[자동 커밋 대기] 게이트 green — 이 세션이 단독 작성한 파일이 미커밋입니다$FALLBACK.\n작업 완료 규약: \`git add -- $OWN\` 후 변경 내용을 설명하는 한글 Conventional Commits 메시지로 커밋하세요(type(scope): 접두어는 영문, subject/body 는 한글 — commitlint 강제). 무관한 기존 변경은 자동 제외되었습니다. 오염 정리는 chore(cleanup): 단독 커밋으로 분리. --no-verify 금지.\n"
    fi
    if [ -n "$OVERLAP" ]; then
      MSG="$MSG[겹침 보류] 아래 파일은 세션 시작 시 이미 변경 중(병렬/기존 작업과 겹침)이라 자동 커밋하지 않습니다:\n  $OVERLAP\n해당 작업이 끝날 때까지 대기하고, 커밋 전 AskUserQuestion 으로 방향(채택/유지/복원)을 사용자에게 확인하세요. 임의 add·되돌리기 금지.\n"
    fi
    if [ -n "$MSG" ]; then
      printf '%b' "$MSG" >&2
      exit 2
    fi
  fi
fi
exit 0
