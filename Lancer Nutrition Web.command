#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_URL="http://127.0.0.1:3000"
CODEX_NODE_DIR="/Users/salahboussen2/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"
CODEX_PNPM="/Users/salahboussen2/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm"

cd "$PROJECT_DIR"

if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  open "$APP_URL"
  exit 0
fi

(sleep 3 && open "$APP_URL") &

if command -v pnpm >/dev/null 2>&1; then
  exec pnpm run dev -H 127.0.0.1 -p 3000
fi

if [ -x "$CODEX_PNPM" ] && [ -x "$CODEX_NODE_DIR/node" ]; then
  export PATH="$CODEX_NODE_DIR:$PATH"
  exec "$CODEX_PNPM" run dev -H 127.0.0.1 -p 3000
fi

if command -v npm >/dev/null 2>&1; then
  exec npm run dev -- -H 127.0.0.1 -p 3000
fi

osascript -e 'display alert "Node.js introuvable" message "Installez Node.js ou lancez l’application depuis Codex." as critical'
exit 1
