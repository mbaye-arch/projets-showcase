# Scripts d'exploitation (setup, démarrage, déploiement)

Ce projet fournit des scripts prêts à l'emploi pour:

- configuration des fichiers `.env`
- installation des dépendances
- démarrage en mode développement
- déploiement local en mode production (PM2)

## Emplacements

- Linux/macOS: `scripts/linux-mac/`
- Windows: `scripts/windows/`

## Commandes rapides

## Linux / macOS

```bash
bash scripts/linux-mac/configure-env.sh
bash scripts/linux-mac/setup.sh --with-db
bash scripts/linux-mac/start-dev.sh
bash scripts/linux-mac/deploy-prod.sh
```

## Windows PowerShell

```powershell
.\scripts\windows\configure-env.ps1
.\scripts\windows\setup.ps1 -WithDatabase
.\scripts\windows\start-dev.ps1
.\scripts\windows\deploy-prod.ps1
```

## Windows CMD (wrappers)

```cmd
scripts\windows\setup.cmd
scripts\windows\start-dev.cmd
scripts\windows\deploy-prod.cmd
```

## Scripts NPM racine (optionnel)

```bash
npm run setup:linux-mac:db
npm run start:linux-mac
npm run deploy:linux-mac
```

Et côté Windows:

```powershell
npm run setup:windows:db
npm run start:windows
npm run deploy:windows
```

## Paramètres de configuration .env

### Linux/macOS

Le script `configure-env.sh` accepte:

- `--db-user=...`
- `--db-password=...`
- `--db-host=...`
- `--db-port=...`
- `--db-name=...`
- `--backend-port=...`
- `--frontend-origin=...`
- `--api-url=...`

Exemple:

```bash
bash scripts/linux-mac/configure-env.sh \
  --db-user=stc_user \
  --db-password=change_me_locally \
  --db-host=127.0.0.1 \
  --db-name=stc_gets
```

### Windows PowerShell

Le script `configure-env.ps1` accepte:

- `-DbUser`
- `-DbPassword`
- `-DbHost`
- `-DbPort`
- `-DbName`
- `-BackendPort`
- `-FrontendOrigin`
- `-ApiUrl`

Exemple:

```powershell
.\scripts\windows\configure-env.ps1 -DbUser stc_user -DbPassword change_me_locally -DbHost 127.0.0.1 -DbName stc_gets
```

## Déploiement local production

Les scripts de déploiement:

- installent/valident les dépendances
- buildent le frontend
- génèrent Prisma côté backend
- démarrent backend + frontend preview via PM2

Commandes PM2 utiles:

```bash
npx pm2 status
npx pm2 logs
npx pm2 restart stc-gets-backend
npx pm2 restart stc-gets-frontend
npx pm2 stop stc-gets-backend stc-gets-frontend
npx pm2 delete stc-gets-backend stc-gets-frontend
```
