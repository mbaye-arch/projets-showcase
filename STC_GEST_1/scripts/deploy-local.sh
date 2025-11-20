#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
SQL_DIR="$BACKEND_DIR/sql"

RUN_SEED=1
RUN_BUILD=0
SKIP_DB=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-seed)
      RUN_SEED=0
      shift
      ;;
    --build)
      RUN_BUILD=1
      shift
      ;;
    --skip-db)
      SKIP_DB=1
      shift
      ;;
    *)
      echo "Option inconnue: $1"
      echo "Usage: ./scripts/deploy-local.sh [--no-seed] [--build] [--skip-db]"
      exit 1
      ;;
  esac
done

log() {
  echo "[deploy] $1"
}

warn() {
  echo "[deploy][warning] $1"
}

fail() {
  echo "[deploy][error] $1"
  exit 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Commande manquante: $1"
  fi
}

copy_env_if_missing() {
  local target="$1"
  local source="$2"

  if [[ ! -f "$target" ]]; then
    cp "$source" "$target"
    log "Création de $(basename "$target") à partir de $(basename "$source")"
  fi
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

run_mysql_script() {
  local script_path="$1"

  if [[ -n "$DB_PASSWORD" ]]; then
    MYSQL_PWD="$DB_PASSWORD" mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" < "$script_path"
  else
    mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" < "$script_path"
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

  log "Service SQL inactif. Tentative de démarrage (${service_name}) via sudo..."

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl start "$service_name" || true
  fi

  if ! mysql_ping && command -v service >/dev/null 2>&1; then
    sudo service "$service_name" start || true
  fi
}

try_setup_ubuntu_db() {
  if ! is_ubuntu_or_debian; then
    return
  fi

  if [[ ! -x "$ROOT_DIR/scripts/setup-ubuntu-db.sh" ]]; then
    chmod +x "$ROOT_DIR/scripts/setup-ubuntu-db.sh" || true
  fi

  if [[ -x "$ROOT_DIR/scripts/setup-ubuntu-db.sh" ]]; then
    warn "Tentative d'installation/configuration automatique de la base locale (Ubuntu/Debian)."
    "$ROOT_DIR/scripts/setup-ubuntu-db.sh" || true
  fi
}

log "Vérification prérequis"
require_cmd node
require_cmd npm

log "Installation dépendances backend"
(cd "$BACKEND_DIR" && npm install)

log "Installation dépendances frontend"
(cd "$FRONTEND_DIR" && npm install)

copy_env_if_missing "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.example"
copy_env_if_missing "$FRONTEND_DIR/.env" "$FRONTEND_DIR/.env.example"

mkdir -p "$BACKEND_DIR/uploads"

if [[ "$SKIP_DB" -eq 0 ]]; then
  require_cmd mysql

  ENV_FILE="$BACKEND_DIR/.env"

  DB_HOST="$(read_env_value "DB_HOST" "localhost" "$ENV_FILE")"
  DB_PORT="$(read_env_value "DB_PORT" "3306" "$ENV_FILE")"
  DB_USER="$(read_env_value "DB_USER" "root" "$ENV_FILE")"
  DB_PASSWORD="$(read_env_value "DB_PASSWORD" "" "$ENV_FILE")"

  log "Test connexion MySQL (${DB_USER}@${DB_HOST}:${DB_PORT})"
  if ! mysql_ping; then
    if [[ "$(uname -s)" == "Linux" ]]; then
      try_start_mysql_ubuntu
    fi
  fi

  if ! mysql_ping; then
    if [[ "$(uname -s)" == "Linux" ]]; then
      try_setup_ubuntu_db
      DB_HOST="$(read_env_value "DB_HOST" "localhost" "$ENV_FILE")"
      DB_PORT="$(read_env_value "DB_PORT" "3306" "$ENV_FILE")"
      DB_USER="$(read_env_value "DB_USER" "root" "$ENV_FILE")"
      DB_PASSWORD="$(read_env_value "DB_PASSWORD" "" "$ENV_FILE")"
    fi
  fi

  if ! mysql_ping; then
    fail "Connexion SQL impossible. Lance ./scripts/setup-ubuntu-db.sh (Ubuntu) ou démarre ton service MySQL/MariaDB puis vérifie backend/.env."
  fi

  log "Application du schema principal"
  run_mysql_script "$SQL_DIR/schema.sql"

  log "Application migration Catalogues"
  run_mysql_script "$SQL_DIR/migration_catalogues.sql"

  if [[ "$RUN_SEED" -eq 1 ]]; then
    log "Application des données de démonstration"
    run_mysql_script "$SQL_DIR/seed.sql"
  else
    log "Seed ignoré (--no-seed)"
  fi
else
  warn "Migration SQL ignorée (--skip-db)"
fi

if [[ "$RUN_BUILD" -eq 1 ]]; then
  log "Build frontend"
  (cd "$FRONTEND_DIR" && npm run build)
fi

log "Déploiement local terminé"
log "Démarrage rapide: ./scripts/start-local.sh"
log "Ou manuellement:"
log "  1) cd backend && npm run dev"
log "  2) cd frontend && npm run dev"
