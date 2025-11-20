# Installer les outils nécessaires (Windows et Mac)

Ce guide installe les outils nécessaires pour lancer l'application localement: Node.js, npm, MySQL, Git et un éditeur recommandé.

## Outils minimum

- Node.js LTS (inclut npm)
- MySQL 8+
- Git
- VS Code (recommandé)

## 1) Installation sur macOS

## Installer Homebrew (si absent)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Installer Node.js, MySQL, Git

```bash
brew update
brew install node
brew install mysql
brew install git
```

## Démarrer MySQL au boot

```bash
brew services start mysql
```

## Vérifier

```bash
node -v
npm -v
mysql --version
git --version
```

## Installer VS Code (optionnel)

```bash
brew install --cask visual-studio-code
```

## 2) Installation sur Windows

Option recommandée: `winget` (Windows 10/11 récent).

## Installer Node.js, MySQL, Git, VS Code

```powershell
winget install OpenJS.NodeJS.LTS
winget install Oracle.MySQL
winget install Git.Git
winget install Microsoft.VisualStudioCode
```

## Vérifier

```powershell
node -v
npm -v
mysql --version
git --version
```

## Démarrer MySQL

Méthode 1 (services Windows):
- Ouvrir `services.msc`
- Démarrer le service MySQL (`MySQL80` ou équivalent)

Méthode 2 (PowerShell admin):

```powershell
Start-Service MySQL80
```

## 3) Configuration Git minimale

```bash
git config --global user.name "Votre Nom"
git config --global user.email "vous@example.com"
```

## 4) Variables d'environnement du projet

Après clonage/ouverture du projet:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Sous Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Adapter `backend/.env` si besoin:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 5) Lancement des services du projet

macOS/Linux:

```bash
./scripts/run-local.sh
```

Windows:

```powershell
.\scripts\run-local.ps1
```

Mode en 2 étapes possible:
- Linux/macOS: `./scripts/deploy-local.sh` puis `./scripts/start-local.sh`
- Windows: `.\scripts\deploy-local.ps1` puis `.\scripts\start-local.ps1`

Si Ubuntu affiche `mysql.service could not be found`:
- lancer `./scripts/setup-ubuntu-db.sh` pour installer/configurer automatiquement MySQL local.

## 6) Utilisation des services (app)

Une fois lancé:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

Services métier disponibles:
- fournisseurs
- catégories
- matériels
- logiciels
- catalogue interne
- sélection interne
- catalogues clients (prévisualisation + export PDF)

## 7) Conseils pratiques

- Si un port est occupé, modifier `PORT` (backend) ou `vite.config.js` (frontend).
- Si MySQL ne démarre pas, redémarrer la machine puis relancer le service.
- Garder Node.js LTS pour éviter les incompatibilités de dépendances.
