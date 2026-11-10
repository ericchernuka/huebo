#!/usr/bin/env bash
# Starts, checks and stops a Huebo dev server for verification runs.
#
#   huebo.sh launch [run-id]   start a server on a free port, wait until usable
#   huebo.sh doctor [run-id]   read-only: is this instance ours and worth driving?
#   huebo.sh stop [run-id]     stop the server this run started; keep the evidence
#   huebo.sh env [run-id]      print URL=, EVIDENCE=, SESSION= for `eval "$(...)"`
#
# Run state lives in .verify/runs/<run-id>/ and evidence in
# .verify/evidence/<run-id>/. Both are gitignored. Stop removes only the run
# state. The run id defaults to "default".
set -euo pipefail

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
RUN="${2:-default}"
STATE="$ROOT/.verify/runs/$RUN"
EVIDENCE="$ROOT/.verify/evidence/$RUN"
VITE="$ROOT/node_modules/vite/bin/vite.js"

cd "$ROOT"

free_port() {
  python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])'
}

usable() {
  local url="$1"

  curl -fsS "$url/" 2>/dev/null | grep -q '<title>Huebo' &&
    curl -fsS -o /dev/null "$url/src/main.tsx" 2>/dev/null
}

launch() {
  if [[ -f "$STATE/pid" ]] && kill -0 "$(cat "$STATE/pid")" 2>/dev/null; then
    echo "Run '$RUN' already has a server (pid $(cat "$STATE/pid")). Use doctor or stop." >&2
    exit 1
  fi

  [[ -f "$VITE" ]] || pnpm install --frozen-lockfile

  mkdir -p "$STATE" "$EVIDENCE"

  local port
  port="$(free_port)"

  nohup node "$VITE" --host 127.0.0.1 --port "$port" --strictPort >"$STATE/server.log" 2>&1 &
  echo $! >"$STATE/pid"

  echo "$port" >"$STATE/port"
  git -C "$ROOT" rev-parse HEAD >"$STATE/commit"

  local url="http://127.0.0.1:$port"

  for _ in $(seq 1 60); do
    if usable "$url"; then
      echo "Huebo ready at $url (pid $(cat "$STATE/pid"), run '$RUN')"
      echo "Evidence goes in $EVIDENCE"
      return
    fi

    kill -0 "$(cat "$STATE/pid")" 2>/dev/null || break
    sleep 0.5
  done

  echo "Huebo didn't become usable. Last log lines:" >&2
  tail -20 "$STATE/server.log" >&2
  exit 1
}

doctor() {
  local fail=0

  check() {
    if eval "$2"; then echo "ok    $1"; else echo "FAIL  $1"; fail=1; fi
  }

  [[ -f "$STATE/pid" ]] || { echo "FAIL  run '$RUN' has no server; run launch"; exit 1; }

  local pid port url
  pid="$(cat "$STATE/pid")"
  port="$(cat "$STATE/port")"
  url="http://127.0.0.1:$port"

  check "server process $pid is alive" "kill -0 $pid 2>/dev/null"
  check "port $port belongs to pid $pid" "lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null | grep -qx $pid"
  check "$url serves Huebo and compiles src/main.tsx" "usable $url"
  check "checkout is still at the launch commit $(cut -c1-7 "$STATE/commit")" \
    "[[ \$(git -C '$ROOT' rev-parse HEAD) == \$(cat '$STATE/commit') ]]"

  if [[ -n "$(git -C "$ROOT" status --porcelain -- src)" ]]; then
    echo "note  src/ has uncommitted changes; the server serves them, so say so in the proof"
  fi

  exit "$fail"
}

stop() {
  if [[ -f "$STATE/pid" ]]; then
    local pid
    pid="$(cat "$STATE/pid")"

    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"

      for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.2; done
      kill -0 "$pid" 2>/dev/null && kill -9 "$pid"
    fi
  fi

  rm -rf "$STATE"
  echo "Stopped run '$RUN'. Evidence kept in $EVIDENCE"
}

print_env() {
  [[ -f "$STATE/port" ]] || { echo "Run '$RUN' has no server; run launch" >&2; exit 1; }

  echo "URL=http://127.0.0.1:$(cat "$STATE/port")"
  echo "EVIDENCE=$EVIDENCE"
  echo "SESSION=$(agent-browser session id --scope worktree --prefix "verify-huebo-$RUN")"
}

case "${1:-}" in
  launch) launch ;;
  doctor) doctor ;;
  stop) stop ;;
  env) print_env ;;
  *) sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'; exit 2 ;;
esac
