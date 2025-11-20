# SenTechCare One Web

Frontend React de SenTechCare One, prêt à être branché au backend Spring Boot.

## Stack technique

- React 19
- Vite 5
- Tailwind CSS 3
- React Router
- Axios
- React Hook Form + Zod

## Prérequis

- Node.js 20+
- npm 10+

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` à la racine du frontend (ou copier `.env.example`) :

```bash
cp .env.example .env
```

Variables disponibles :

- `VITE_API_BASE_URL` : URL de base backend utilisée par Axios (défaut `/api`)
- `VITE_BACKEND_PROXY_TARGET` : cible backend du proxy Vite en dev (défaut `http://localhost:8080`)
- `VITE_APP_NAME` : nom affiché dans la navigation
- `VITE_ENABLE_QUOTE_CONVERSION` : active le bouton de conversion devis -> facture (défaut `false`)

Exemple :

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_PROXY_TARGET=http://localhost:8080
VITE_APP_NAME=SenTechCare One
VITE_ENABLE_QUOTE_CONVERSION=false
```

## Lancement

Mode développement :

```bash
npm run dev
```

Le proxy Vite redirige automatiquement `/api/*` vers `VITE_BACKEND_PROXY_TARGET`, ce qui évite les problèmes CORS en développement.

Build production :

```bash
npm run build
```

Prévisualisation du build :

```bash
npm run preview
```

## Authentification (JWT)

- Login via `POST /auth/login`
- Récupération utilisateur connecté via `GET /auth/me`
- Le token JWT est stocké côté navigateur (`localStorage`)
- Axios ajoute automatiquement `Authorization: Bearer <token>`
- En cas de `401`, la session est nettoyée et l’utilisateur est redirigé vers login

## Modules implémentés

- Dashboard
- Clients
- Abonnements
- Matériels
- Interventions
- Tickets
- Devis
- Factures
- Paiements
- Utilisateurs
- Profil connecté

## Arborescence principale

```text
src/
  api/
  app/
  components/
  config/
  features/
  hooks/
  layouts/
  lib/
  pages/
  router/
  styles/
  utils/
```

## Notes backend

- Les routes frontend sont alignées avec les contrôleurs backend `/api/*`.
- La conversion d’un devis en facture est masquée tant que l’endpoint backend n’est pas exposé.
- Si Spring Security applique des rôles stricts, certaines pages peuvent être restreintes selon l’utilisateur connecté.
