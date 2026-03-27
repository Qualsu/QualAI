#!/usr/bin/env bash
set -euo pipefail

mkdir -p "${DATA_DIR:-/data}"
mkdir -p "${MODELS_DIR:-/data/models}"
mkdir -p "${HF_HOME:-/data/hf-home}"

touch "${HISTORY_FILE:-/data/chat_history.json}"

uvicorn app:app --host 127.0.0.1 --port 8006 --app-dir /app/server --proxy-headers &
PYTHON_PID=$!

npm run start -- --hostname 127.0.0.1 --port 3000 &
NEXT_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

cleanup() {
  kill "$PYTHON_PID" "$NEXT_PID" "$NGINX_PID" 2>/dev/null || true
  wait "$PYTHON_PID" "$NEXT_PID" "$NGINX_PID" 2>/dev/null || true
}

trap cleanup SIGTERM SIGINT
wait -n "$PYTHON_PID" "$NEXT_PID" "$NGINX_PID"
cleanup
