#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

if [[ ! -f "${BACKEND_DIR}/.env" || ! -f "${FRONTEND_DIR}/.env" ]]; then
  echo "Fichiers .env absents. Lance d'abord: bash scripts/linux-mac/configure-env.sh"
  exit 1
fi

cleanup() {
  if [[ -n "${BACK_PID:-}" ]]; then kill "${BACK_PID}" >/dev/null 2>&1 || true; fi
  if [[ -n "${FRONT_PID:-}" ]]; then kill "${FRONT_PID}" >/dev/null 2>&1 || true; fi
}

trap cleanup INT TERM EXIT

echo "Démarrage backend (http://localhost:4000)..."
(
  cd "${BACKEND_DIR}"
  npm run dev
) &
BACK_PID=$!

echo "Démarrage frontend (http://localhost:5173)..."
(
  cd "${FRONTEND_DIR}"
  npm run dev
) &
FRONT_PID=$!

wait
