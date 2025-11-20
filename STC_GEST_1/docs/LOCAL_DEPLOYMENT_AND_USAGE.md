# Déploiement local et utilisation

Ce guide explique comment déployer rapidement le projet en local, démarrer les serveurs et utiliser les modules métier (dont le nouveau module Catalogues clients).

## 1) Démarrage ultra simple (Ubuntu / Linux / macOS)

Depuis la racine du projet:

```bash
cd /home/mbaye/Bureau/SenTechCare/STC_GEST_1
chmod +x ./scripts/*.sh
./scripts/run-local.sh
```

Notes:
- Sur Ubuntu/Debian, les scripts tentent automatiquement de démarrer MySQL avec `sudo systemctl start mysql` si nécessaire.
- Le script de déploiement applique `schema.sql`, `migration_catalogues.sql`, puis `seed.sql`.
- Si le service SQL est absent (`mysql.service not found`), lancer:
  - `./scripts/setup-ubuntu-db.sh`

Mode en 2 étapes (si tu veux contrôler séparément):

```bash
./scripts/deploy-local.sh
./scripts/start-local.sh
```

## 2) Démarrage ultra simple (Windows PowerShell)

Depuis la racine du projet:

```powershell
cd C:\chemin\vers\STC_GEST_1
.\scripts\run-local.ps1
```

Si l'exécution des scripts est bloquée:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 3) Options utiles du script de déploiement

Linux/macOS:

```bash
./scripts/run-local.sh --no-seed
./scripts/run-local.sh --build
./scripts/run-local.sh --skip-db
./scripts/deploy-local.sh --no-seed
./scripts/deploy-local.sh --build
./scripts/deploy-local.sh --skip-db
```

Windows:

```powershell
.\scripts\run-local.ps1 -NoSeed
.\scripts\run-local.ps1 -Build
.\scripts\run-local.ps1 -SkipDb
.\scripts\deploy-local.ps1 -NoSeed
.\scripts\deploy-local.ps1 -Build
.\scripts\deploy-local.ps1 -SkipDb
```

## 4) URLs locales

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Santé API: `http://localhost:5000/api/health`

## 5) Comment utiliser l'application

### Dashboard
- Ouvrir `/dashboard` pour voir les statistiques globales.

### Fournisseurs
- Ouvrir `/suppliers`.
- Créer/modifier/supprimer des fournisseurs.
- Vérifier la fiche détail avec les matériels liés.

### Catégories
- Ouvrir `/categories`.
- Créer et organiser les catégories hardware/software.

### Matériels
- Ouvrir `/hardware`.
- Ajouter matériel, image principale, galerie, vidéo.
- Gérer les filtres (type, état, catégorie, fournisseur).

### Logiciels
- Ouvrir `/software`.
- Gérer CRUD logiciel, prix, licence, compatibilité.

### Catalogue interne
- Ouvrir `/catalog`.
- Rechercher produits et ajouter à la sélection.

### Sélection interne
- Ouvrir `/selection`.
- Ajuster quantités, note interne, total global.

### Catalogues clients (nouveau module)
- Ouvrir `/catalogues`.
- Workflow recommandé:
1. Créer les types clients dans `/catalogues/types-clients`.
2. Créer un catalogue dans `/catalogues/new`.
3. Ouvrir le catalogue (`/catalogues/:id`) et ajouter des sections.
4. Ajouter des produits existants via `/catalogues/:id/products`.
5. Personnaliser les items (titre, description, prix, remise, visibilité, mise en avant, image spécifique).
6. Prévisualiser via `/catalogues/:id/preview`.
7. Exporter en PDF via bouton `Export PDF`.
8. Dupliquer un catalogue depuis la liste pour repartir d'un modèle.

## 6) Services/API principaux

### Types clients
- `GET /api/types-clients`
- `POST /api/types-clients`
- `PUT /api/types-clients/:id`
- `DELETE /api/types-clients/:id`

### Catalogues
- `GET /api/catalogues`
- `GET /api/catalogues/:id`
- `POST /api/catalogues`
- `PUT /api/catalogues/:id`
- `DELETE /api/catalogues/:id`
- `POST /api/catalogues/:id/duplicate`
- `GET /api/catalogues/:id/preview`
- `GET /api/catalogues/:id/export-pdf`

### Sections
- `POST /api/catalogues/:id/sections`
- `PUT /api/catalogues/:id/sections/:sectionId`
- `DELETE /api/catalogues/:id/sections/:sectionId`

### Items de catalogue
- `POST /api/catalogues/:id/items`
- `PUT /api/catalogues/:id/items/:itemId`
- `DELETE /api/catalogues/:id/items/:itemId`

## 7) Arrêt des serveurs

- Linux/macOS avec `start-local.sh`: `CTRL + C` dans le terminal du script.
- Windows avec `start-local.ps1`: fermer les deux fenêtres PowerShell ouvertes.

## 8) Dépannage rapide

- Erreur MySQL socket/connexion:
  - Ubuntu: `sudo systemctl start mysql`
  - Si `mysql.service` est introuvable: `./scripts/setup-ubuntu-db.sh`
  - Vérifier `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`)

- Port déjà utilisé:
  - Backend: changer `PORT` dans `backend/.env`
  - Frontend: adapter `frontend/vite.config.js`

- PDF vide ou images manquantes:
  - Vérifier que les images sont bien présentes dans `backend/uploads/`
  - Vérifier la visibilité des items dans le catalogue
