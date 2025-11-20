#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"
FRONT_PORT="${FRONT_PORT:-4173}"

if [[ ! -f "${BACKEND_DIR}/.env" || ! -f "${FRONTEND_DIR}/.env" ]]; then
  echo "Fichiers .env absents. Lance d'abord: bash scripts/linux-mac/configure-env.sh"
  exit 1
fi

echo "Installation dépendances..."
npm --prefix "${BACKEND_DIR}" install
npm --prefix "${FRONTEND_DIR}" install

echo "Build frontend..."
npm --prefix "${FRONTEND_DIR}" run build

echo "Prisma generate backend..."
npm --prefix "${BACKEND_DIR}" run prisma:generate

echo "Démarrage services via PM2..."
npx pm2 delete stc-gets-backend >/dev/null 2>&1 || true
npx pm2 delete stc-gets-frontend >/dev/null 2>&1 || true

npx pm2 start "npm --prefix '${BACKEND_DIR}' run start" --name stc-gets-backend
npx pm2 start "npm --prefix '${FRONTEND_DIR}' run preview -- --host 0.0.0.0 --port ${FRONT_PORT}" --name stc-gets-frontend
npx pm2 save

echo "Déploiement local production terminé."
echo "- Frontend preview: http://localhost:${FRONT_PORT}"
echo "- Backend API: http://localhost:4000"
echo "- Statut PM2: npx pm2 status"
