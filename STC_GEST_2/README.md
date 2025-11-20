# STC GEST 2 - Gestion de Stock & Identification Matériel IT

STC GEST 2 est une application full-stack de gestion de stock IT. Elle permet de suivre les matériels, les quantités, les mouvements, les inventaires et les étiquettes d'identification avec codes-barres, QR codes et exports PDF.

Le projet met en avant une logique métier orientée inventaire, traçabilité et exploitation interne, avec un backend Node.js/Express, une base MySQL pilotée par Prisma et un frontend React/Vite.

![Dashboard stock](screenshots/dashboard-stock.png)

---

## Objectif du projet

L'objectif est de fournir un outil interne pour:

- centraliser les matériels informatiques;
- suivre l'état du stock par article;
- détecter les stocks faibles et les ruptures;
- historiser les entrées, sorties, retours et ajustements;
- réaliser des inventaires physiques;
- générer des numéros d'inventaire uniques;
- produire des codes-barres et QR codes;
- imprimer ou exporter des étiquettes d'identification.

---

## Aperçu de l'interface

### Dashboard stock

Le dashboard affiche les indicateurs clés: nombre de matériels, valeur totale du stock, stocks faibles, ruptures et mouvements récents.

![Dashboard stock](screenshots/dashboard-stock.png)

### Liste des matériels

Le module matériels centralise les équipements avec référence, nom, marque, modèle, catégorie, description et stock associé.

![Liste matériels](screenshots/materiels.png)

### Mouvements de stock

Le module mouvements trace les opérations de stock: entrée, sortie, retour et ajustement, avec quantité, motif, document de référence et date.

![Mouvements de stock](screenshots/mouvements.png)

### Étiquette QR / code-barres

Le module étiquettes génère un aperçu exploitable pour identifier physiquement un équipement avec numéro d'inventaire, code-barres et QR code.

![Étiquette QR et code-barres](screenshots/etiquette-qr-barcode.png)

---

## Fonctionnalités

### Dashboard

- KPI de stock.
- Valeur totale du stock.
- Nombre de matériels.
- Nombre de stocks faibles.
- Nombre de ruptures.
- Liste des mouvements récents.
- Bloc d'alertes stocks critiques.
- Nombre d'inventaires enregistrés.

### Matériels

- Création, consultation, modification et suppression de matériels.
- Référence unique.
- Nom, marque, modèle et catégorie.
- Description technique.
- Association avec une fiche stock.
- Recherche et consultation rapide.
- Fiche détail matériel.

### Stock

- Création et mise à jour de stock par matériel.
- Numéro d'inventaire unique.
- Valeur de code-barres.
- Valeur QR code.
- Quantité actuelle.
- Stock minimum.
- Emplacement.
- Prix d'achat.
- Dates d'achat, réception, entrée, sortie, reprise et fin de garantie.
- Calcul automatique de la valeur du stock.
- Statut automatique: `NORMAL`, `FAIBLE`, `RUPTURE`.

### Mouvements de stock

- Création et consultation des mouvements.
- Types disponibles: `ENTREE`, `SORTIE`, `RETOUR`, `AJUSTEMENT`.
- Contrôle métier sur les sorties pour éviter les stocks insuffisants.
- Historisation du matériel, numéro d'inventaire, quantité, prix unitaire, date, motif et document.
- Mise à jour automatique des informations de stock.
- Transactions Prisma pour sécuriser les opérations.

### Inventaires

- Création d'inventaires.
- Ajout d'items d'inventaire.
- Comparaison quantité théorique / quantité réelle.
- Calcul automatique des écarts.
- Commentaires par ligne d'inventaire.
- Base prête pour convertir les écarts en ajustements de stock.

### Identification

- Génération de numéro d'inventaire.
- Format configurable: `{prefix}-{year}-{counter}`.
- Préfixe configurable.
- Compteur annuel ou global.
- Padding du compteur.
- Unicité garantie en base.
- Recherche rapide par valeur scannée.

### Codes-barres, QR codes et étiquettes

- Génération de code-barres SVG avec JsBarcode.
- Génération de QR code avec la librairie `qrcode`.
- QR code basé sur numéro d'inventaire ou URL interne.
- Aperçu HTML d'étiquette.
- Export PDF via Puppeteer.
- Format et contenu d'étiquette configurables.

### Paramètres système

- Configuration du format de numéro d'inventaire.
- Configuration du préfixe par défaut.
- Configuration du mode compteur.
- Configuration de la stratégie QR code.
- Configuration de l'URL de base interne.
- Configuration du format d'étiquette.

---

## Stack technique

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- Zod
- Puppeteer
- JsBarcode
- qrcode
- dayjs
- Morgan
- Dotenv

### Frontend

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS
- React Hook Form
- Zod
- dayjs

### Exploitation

- Scripts Linux/macOS
- Scripts Windows PowerShell
- Configuration `.env.example`
- Seed Prisma
- Données de démonstration SQL

---

## Architecture

```text
STC_GEST_2/
  backend/
    prisma/
      schema.prisma
      seed.js
      demo-data.sql
    src/
      config/
      constants/
      controllers/
      middlewares/
      routes/
      services/
      utils/
      validation/
      app.js
      server.js
  frontend/
    src/
      components/
      hooks/
      layouts/
      pages/
      services/
      utils/
      App.jsx
      main.jsx
      index.css
  docs/
  scripts/
  screenshots/
```

---

## Modèle de données

Le schéma Prisma est disponible dans:

```text
backend/prisma/schema.prisma
```

Entités principales:

- `Materiel`
- `Stock`
- `MouvementStock`
- `Inventaire`
- `InventaireItem`
- `Parametre`
- `CompteurInventaire`

Enums métier:

- `TypeMouvement`: `ENTREE`, `SORTIE`, `RETOUR`, `AJUSTEMENT`
- `StatutStock`: `NORMAL`, `FAIBLE`, `RUPTURE`
- `StrategieQrCode`: `INVENTORY_NUMBER`, `INTERNAL_URL`
- `ModeCompteurInventaire`: `ANNUEL`, `GLOBAL`

---

## API REST

Base URL:

```text
http://localhost:4000/api
```

| Domaine | Endpoint |
| --- | --- |
| Santé API | `GET /health` |
| Matériels | `/materiels` |
| Stocks | `/stocks` |
| Mouvements | `/mouvements-stock` |
| Inventaires | `/inventaires` |
| Recherche | `/recherche/materiel/:value` |
| Paramètres | `/parametres` |

Endpoints identification:

- `POST /stocks/:id/generate-inventory-number`
- `POST /stocks/:id/generate-barcode`
- `POST /stocks/:id/generate-qrcode`
- `GET /stocks/:id/label-preview`
- `GET /stocks/:id/label-pdf`

---

## Routes frontend

- `/dashboard`
- `/materiels`
- `/materiels/:id`
- `/stock`
- `/mouvements`
- `/inventaires`
- `/etiquettes`
- `/parametres`

---

## Prérequis

- Node.js 20+
- npm
- MySQL 8+

---

## Configuration backend

Copier l'exemple:

```bash
cd backend
cp .env.example .env
```

Variables principales:

```env
PORT=4000
DATABASE_URL="mysql://stc_inventory_user:change_me_locally@localhost:3306/stc_gets"
CORS_ORIGIN="http://localhost:5173"
APP_BASE_URL="http://localhost:5173"
```

Ne pas versionner de `.env` contenant des identifiants réels.

---

## Configuration frontend

Copier l'exemple:

```bash
cd frontend
cp .env.example .env
```

Variable principale:

```env
VITE_API_URL=http://localhost:4000/api
```

---

## Installation locale

Installer les dépendances:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Créer la base MySQL:

```sql
CREATE DATABASE stc_gets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Préparer Prisma:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
npm run seed
```

Charger les données de démonstration:

```bash
mysql -u root -p stc_gets < backend/prisma/demo-data.sql
```

---

## Lancement local

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Accès:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000`
- healthcheck: `http://localhost:4000/api/health`

---

## Données de démonstration

Le fichier `backend/prisma/demo-data.sql` ajoute un jeu de données propre pour les tests et captures:

- 5 matériels;
- 5 fiches de stock;
- 4 mouvements;
- 1 inventaire;
- 2 lignes d'inventaire;
- exemples de stock normal, stock faible et rupture.

Exemples inclus:

- Laptop Dell Latitude 5420;
- Routeur TP-Link Archer AX55;
- Imprimante HP LaserJet Pro M404;
- Écran Dell 24 pouces;
- NAS Synology DS220+.

---

## Scripts d'exploitation

Linux/macOS:

```bash
bash scripts/linux-mac/configure-env.sh
bash scripts/linux-mac/setup.sh --with-db
bash scripts/linux-mac/start-dev.sh
bash scripts/linux-mac/deploy-prod.sh
```

Windows PowerShell:

```powershell
.\scripts\windows\configure-env.ps1
.\scripts\windows\setup.ps1 -WithDatabase
.\scripts\windows\start-dev.ps1
.\scripts\windows\deploy-prod.ps1
```

Scripts npm racine:

```bash
npm run setup:linux-mac:db
npm run start:linux-mac
npm run deploy:linux-mac
```

---

## Logique métier centrale

### Numéro d'inventaire

- Génération automatique ou saisie manuelle.
- Unicité garantie en base.
- Format configurable.
- Préfixe configurable.
- Compteur annuel ou global.

### Stock

- `valeurStock = quantiteActuelle × prixAchat`
- `RUPTURE` si quantité = 0.
- `FAIBLE` si quantité positive inférieure ou égale au stock minimum.
- `NORMAL` sinon.

### Mouvements

- Transactions Prisma.
- Contrôle stock insuffisant sur `SORTIE`.
- Mise à jour automatique des dates clés.
- Historisation persistante.

### QR / Barcode / PDF

- Code-barres basé sur le numéro d'inventaire.
- QR code basé sur le numéro d'inventaire ou une URL interne.
- Étiquette HTML.
- PDF généré via Puppeteer.

---

## Vérifications recommandées

Backend:

```bash
cd backend
npm run start
```

Frontend:

```bash
cd frontend
npm run build
```

---

## Documentation complémentaire

- [Vue d'ensemble scripts](docs/SCRIPTS.md)
- [Guide Ubuntu](docs/UBUNTU.md)
- [Guide macOS](docs/MACOS.md)
- [Guide Windows](docs/WINDOWS.md)

---

## Statut

Projet fonctionnel en environnement local avec backend Express, Prisma, MySQL, frontend React/Vite, gestion de stock, mouvements, inventaire, codes-barres, QR codes et export d'étiquettes PDF.
