#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

log() {
  echo "[start] $1"
}

warn() {
  echo "[start][warning] $1"
}

read_env_value() {
  local key="$1"
  local default_value="$2"
  local file_path="$3"

  if [[ ! -f "$file_path" ]]; then
    printf '%s' "$default_value"
    return
  fi

  local raw_value
  raw_value="$(grep -E "^${key}=" "$file_path" | tail -n 1 | cut -d '=' -f2- || true)"

  if [[ -z "$raw_value" ]]; then
    printf '%s' "$default_value"
    return
  fi

  raw_value="${raw_value%\"}"
  raw_value="${raw_value#\"}"
  raw_value="${raw_value%\'}"
  raw_value="${raw_value#\'}"

  printf '%s' "$raw_value"
}

mysql_ping() {
  if [[ -n "$DB_PASSWORD" ]]; then
    MYSQL_PWD="$DB_PASSWORD" mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "SELECT 1;" >/dev/null 2>&1
  else
    mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "SELECT 1;" >/dev/null 2>&1
  fi
}

is_ubuntu_or_debian() {
  if [[ ! -f /etc/os-release ]]; then
    return 1
  fi

  # shellcheck disable=SC1091
  source /etc/os-release

  [[ "${ID:-}" == "ubuntu" || "${ID:-}" == "debian" || "${ID_LIKE:-}" == *"debian"* ]]
}

detect_db_service() {
  local candidate

  if ! command -v systemctl >/dev/null 2>&1; then
    printf '%s' ""
    return
  fi

  for candidate in mysql mariadb mysqld; do
    if systemctl list-unit-files --type=service 2>/dev/null | awk '{print $1}' | grep -qx "${candidate}.service"; then
      printf '%s' "$candidate"
      return
    fi
  done

  printf '%s' ""
}

try_start_mysql_ubuntu() {
  if ! is_ubuntu_or_debian; then
    return
  fi

  local service_name
  service_name="$(detect_db_service)"
  if [[ -z "$service_name" ]]; then
    warn "Aucun service mysql/mariadb/mysqld détecté."
    return
  fi

  log "Tentative de démarrage du service SQL (${service_name}) via sudo..."

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start "$service_name" || true
  fi

  if ! mysql_ping && command -v service >/dev/null 2>&1; then
    sudo service "$service_name" start || true
  fi
}

if command -v mysql >/dev/null 2>&1; then
  ENV_FILE="$BACKEND_DIR/.env"
  DB_HOST="$(read_env_value "DB_HOST" "localhost" "$ENV_FILE")"
  DB_PORT="$(read_env_value "DB_PORT" "3306" "$ENV_FILE")"
  DB_USER="$(read_env_value "DB_USER" "root" "$ENV_FILE")"
  DB_PASSWORD="$(read_env_value "DB_PASSWORD" "" "$ENV_FILE")"

  if ! mysql_ping && [[ "$(uname -s)" == "Linux" ]]; then
    try_start_mysql_ubuntu
  fi
fi

BACK_PID=""
FRONT_PID=""

cleanup() {
  if [[ -n "$BACK_PID" ]] && kill -0 "$BACK_PID" >/dev/null 2>&1; then
    kill "$BACK_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$FRONT_PID" ]] && kill -0 "$FRONT_PID" >/dev/null 2>&1; then
    kill "$FRONT_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

log "Démarrage backend sur http://localhost:5000"
(
  cd "$BACKEND_DIR"
  npm run dev
) &
BACK_PID=$!

sleep 1

log "Démarrage frontend sur http://localhost:5173"
(
  cd "$FRONTEND_DIR"
  npm run dev
) &
FRONT_PID=$!

log "Services démarrés. CTRL+C pour arrêter backend + frontend."

if command -v curl >/dev/null 2>&1; then
  sleep 2
  health_response="$(curl -sS -m 4 http://localhost:5000/api/health || true)"

  if [[ "$health_response" == *'"db":"down"'* ]]; then
    warn "La base de données MySQL est indisponible. Le frontend tourne, mais certaines pages (dashboard, CRUD) échoueront."
    if is_ubuntu_or_debian; then
      warn "Sur Ubuntu/Debian: ./scripts/setup-ubuntu-db.sh"
    fi
  fi
fi

wait "$BACK_PID" "$FRONT_PID"
