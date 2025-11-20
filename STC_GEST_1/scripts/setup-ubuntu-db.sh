#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
ENV_FILE="$BACKEND_DIR/.env"

log() {
  echo "[setup-db] $1"
}

warn() {
  echo "[setup-db][warning] $1"
}

fail() {
  echo "[setup-db][error] $1"
  exit 1
}

is_ubuntu_or_debian() {
  if [[ ! -f /etc/os-release ]]; then
    return 1
  fi

  # shellcheck disable=SC1091
  source /etc/os-release

  [[ "${ID:-}" == "ubuntu" || "${ID:-}" == "debian" || "${ID_LIKE:-}" == *"debian"* ]]
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

set_env_value() {
  local key="$1"
  local value="$2"
  local file_path="$3"

  if grep -qE "^${key}=" "$file_path"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file_path"
  else
    echo "${key}=${value}" >> "$file_path"
  fi
}

detect_db_service() {
  local candidate

  if command -v systemctl >/dev/null 2>&1; then
    for candidate in mysql mariadb mysqld; do
      if systemctl list-unit-files --type=service 2>/dev/null | awk '{print $1}' | grep -qx "${candidate}.service"; then
        printf '%s' "$candidate"
        return 0
      fi
    done
  fi

  printf '%s' ""
}

start_db_service() {
  local service_name="$1"

  if [[ -z "$service_name" ]]; then
    return 1
  fi

  log "Démarrage du service ${service_name} via sudo..."

  if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl enable --now "$service_name"
  elif command -v service >/dev/null 2>&1; then
    sudo service "$service_name" start
  else
    return 1
  fi

  return 0
}

if ! is_ubuntu_or_debian; then
  fail "Ce script est prévu pour Ubuntu/Debian."
fi

if ! command -v apt-get >/dev/null 2>&1; then
  fail "apt-get introuvable. Impossible d'installer MySQL automatiquement."
fi

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
  log "Fichier backend/.env créé depuis .env.example"
fi

if ! command -v mysql >/dev/null 2>&1; then
  log "Client MySQL absent. Installation..."
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-client
fi

SERVICE_NAME="$(detect_db_service)"

if [[ -z "$SERVICE_NAME" ]]; then
  log "Aucun service MySQL/MariaDB détecté. Installation du serveur MySQL..."
  sudo apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server
  SERVICE_NAME="$(detect_db_service)"
fi

if [[ -z "$SERVICE_NAME" ]]; then
  fail "Service SQL introuvable après installation. Vérifie les paquets installés."
fi

start_db_service "$SERVICE_NAME" || fail "Impossible de démarrer le service ${SERVICE_NAME}."

DB_HOST="$(read_env_value "DB_HOST" "localhost" "$ENV_FILE")"
DB_PORT="$(read_env_value "DB_PORT" "3306" "$ENV_FILE")"
DB_NAME="$(read_env_value "DB_NAME" "sentechcare_internal_manager" "$ENV_FILE")"
DB_USER="$(read_env_value "DB_USER" "root" "$ENV_FILE")"
DB_PASSWORD="$(read_env_value "DB_PASSWORD" "" "$ENV_FILE")"

if [[ "$DB_USER" == "root" || -z "$DB_PASSWORD" ]]; then
  warn "Configuration backend/.env non adaptée à Ubuntu (root sans mot de passe via TCP)."
  warn "Création automatique d'un compte applicatif local."

  DB_USER="stc_app"
  DB_PASSWORD="change_me_locally"

  set_env_value "DB_USER" "$DB_USER" "$ENV_FILE"
  set_env_value "DB_PASSWORD" "$DB_PASSWORD" "$ENV_FILE"

  log "backend/.env mis à jour: DB_USER=${DB_USER}"
fi

log "Initialisation base + utilisateur applicatif..."
sudo mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL

log "Test connexion MySQL TCP (${DB_USER}@${DB_HOST}:${DB_PORT})..."
if ! MYSQL_PWD="$DB_PASSWORD" mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "SELECT 1;" >/dev/null 2>&1; then
  fail "Connexion TCP impossible malgré la configuration. Vérifie le bind-address MySQL."
fi

log "Base locale prête."
log "Tu peux maintenant lancer: ./scripts/run-local.sh"
