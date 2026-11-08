#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v node >/dev/null 2>&1; then
  exec node "$project_root/server.js"
fi

dashboard_pid=""
mobile_pid=""

if ! curl --silent --head --fail http://localhost:3000 >/dev/null; then
  python3 -m http.server 3000 --directory "$project_root/dashboard/dist" &
  dashboard_pid=$!
fi

if ! curl --silent --head --fail http://localhost:3001 >/dev/null; then
  python3 -m http.server 3001 --directory "$project_root/mobile/dist" &
  mobile_pid=$!
fi

cleanup() {
  [[ -z "$dashboard_pid" ]] || kill "$dashboard_pid" 2>/dev/null || true
  [[ -z "$mobile_pid" ]] || kill "$mobile_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Business dashboard: http://localhost:3000"
echo "Mobile customer app: http://localhost:3001"

if [[ -n "$dashboard_pid" || -n "$mobile_pid" ]]; then
  wait
fi
