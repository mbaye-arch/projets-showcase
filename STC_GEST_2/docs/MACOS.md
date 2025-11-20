# Guide macOS

## 1) Pré-requis

Installer Homebrew si nécessaire puis:

```bash
brew install node
```

Node.js 20+ recommandé.

Installer MySQL (si besoin):

```bash
brew install mysql
brew services start mysql
```

Créer la base:

```sql
CREATE DATABASE stc_gets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2) Configuration

```bash
bash scripts/linux-mac/configure-env.sh --db-user=stc_user --db-password=change_me_locally --db-host=127.0.0.1 --db-name=stc_gets
```

## 3) Setup complet + DB

```bash
bash scripts/linux-mac/setup.sh --with-db
```

## 4) Démarrage développement

```bash
bash scripts/linux-mac/start-dev.sh
```

## 5) Déploiement local production

```bash
bash scripts/linux-mac/deploy-prod.sh
```
