#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_ENV="${ROOT_DIR}/backend/.env"
FRONTEND_ENV="${ROOT_DIR}/frontend/.env"

DB_USER="${DB_USER:-stc_user}"
DB_PASSWORD="${DB_PASSWORD:-change_me_locally}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-stc_gets}"
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN:-http://localhost:5173}"
API_URL="${API_URL:-http://localhost:${BACKEND_PORT}/api}"

for arg in "$@"; do
  case "$arg" in
    --db-user=*) DB_USER="${arg#*=}" ;;
    --db-password=*) DB_PASSWORD="${arg#*=}" ;;
    --db-host=*) DB_HOST="${arg#*=}" ;;
    --db-port=*) DB_PORT="${arg#*=}" ;;
    --db-name=*) DB_NAME="${arg#*=}" ;;
    --backend-port=*) BACKEND_PORT="${arg#*=}" ;;
    --frontend-origin=*) FRONTEND_ORIGIN="${arg#*=}" ;;
    --api-url=*) API_URL="${arg#*=}" ;;
    *)
      echo "Argument inconnu: $arg"
      echo "Usage: configure-env.sh [--db-user=...] [--db-password=...] [--db-host=...] [--db-port=...] [--db-name=...] [--backend-port=...] [--frontend-origin=...] [--api-url=...]"
      exit 1
      ;;
  esac
done

cat > "${BACKEND_ENV}" <<EOT
PORT=${BACKEND_PORT}
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
CORS_ORIGIN="${FRONTEND_ORIGIN}"
APP_BASE_URL="${FRONTEND_ORIGIN}"
EOT

cat > "${FRONTEND_ENV}" <<EOT
VITE_API_URL=${API_URL}
EOT

echo "Configuration écrite:"
echo "- ${BACKEND_ENV}"
echo "- ${FRONTEND_ENV}"
echo "DATABASE_URL => mysql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}"
