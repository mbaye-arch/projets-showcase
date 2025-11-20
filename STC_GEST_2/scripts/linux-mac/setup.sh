#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WITH_DB=0

for arg in "$@"; do
  case "$arg" in
    --with-db) WITH_DB=1 ;;
    *)
      echo "Argument inconnu: $arg"
      echo "Usage: setup.sh [--with-db]"
      exit 1
      ;;
  esac
done

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Commande manquante: $1"
    exit 1
  fi
}

need_cmd node
need_cmd npm

if [[ ! -f "${ROOT_DIR}/backend/.env" || ! -f "${ROOT_DIR}/frontend/.env" ]]; then
  echo "Fichiers .env absents, génération par défaut..."
  "${ROOT_DIR}/scripts/linux-mac/configure-env.sh"
fi

if rg -n "mysql://root:" "${ROOT_DIR}/backend/.env" >/dev/null 2>&1; then
  echo "Configuration invalide détectée: backend/.env utilise root."
  echo "Utilise un utilisateur MySQL dédié, puis relance:"
  echo "bash scripts/linux-mac/configure-env.sh --db-user=stc_user --db-password=change_me_locally --db-host=127.0.0.1 --db-name=stc_gets"
  exit 1
fi

echo "Installation des dépendances backend..."
npm --prefix "${ROOT_DIR}/backend" install

echo "Installation des dépendances frontend..."
npm --prefix "${ROOT_DIR}/frontend" install

echo "Génération Prisma Client..."
npm --prefix "${ROOT_DIR}/backend" run prisma:generate

if [[ "${WITH_DB}" -eq 1 ]]; then
  echo "Application des schémas Prisma sur MySQL..."
  npm --prefix "${ROOT_DIR}/backend" run prisma:push

  echo "Seed des paramètres..."
  npm --prefix "${ROOT_DIR}/backend" run seed
fi

echo "Setup terminé."
echo "- Démarrage dev: bash scripts/linux-mac/start-dev.sh"
echo "- Déploiement local prod (PM2 + build): bash scripts/linux-mac/deploy-prod.sh"
