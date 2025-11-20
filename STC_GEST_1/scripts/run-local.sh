#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() {
  echo "[run-local] $1"
}

log "Déploiement local (install + SQL + seed)"
"$ROOT_DIR/scripts/deploy-local.sh" "$@"

log "Démarrage backend + frontend"
"$ROOT_DIR/scripts/start-local.sh"
