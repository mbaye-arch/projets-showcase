# Guide Ubuntu

## 1) Pré-requis

```bash
sudo apt update
sudo apt install -y curl build-essential
```

Node.js 20+ recommandé.

## 2) MySQL

Créer la base:

```sql
CREATE DATABASE stc_gets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3) Configuration

Depuis la racine du projet:

```bash
bash scripts/linux-mac/configure-env.sh --db-user=stc_user --db-password=change_me_locally --db-host=127.0.0.1 --db-name=stc_gets
```

## 4) Setup complet + DB

```bash
bash scripts/linux-mac/setup.sh --with-db
```

## 5) Démarrage développement

```bash
bash scripts/linux-mac/start-dev.sh
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## 6) Déploiement local production

```bash
bash scripts/linux-mac/deploy-prod.sh
```

- Frontend preview: `http://localhost:4173`
- Backend API: `http://localhost:4000`
