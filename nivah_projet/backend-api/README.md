# 🚀 Nivah API - Backend PHP Simple

API REST pour l'application Nivah - Backend PHP pur sans framework.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Structure du projet](#structure-du-projet)
5. [Endpoints disponibles](#endpoints-disponibles)
6. [Tests](#tests)
7. [Déploiement](#déploiement)

---

## ✅ Prérequis

- PHP >= 7.4
- MySQL >= 5.7
- Apache avec mod_rewrite activé
- Composer (optionnel)

---

## 📦 Installation

### 1. Cloner le projet

```bash
cd /path/to/nivah-app/
```

### 2. Générer un secret JWT

Exécutez ce script PHP pour générer un secret JWT :

```bash
php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
```

Copiez le résultat et mettez-le dans `.env.production` à la ligne `JWT_SECRET=`.

### 3. Importer le schéma de base de données

```bash
# Importer la structure complète
mysql -u nivah_user -p nivah_database < bdd/nivah_database_complete.sql

# Importer les extensions demandes clients
mysql -u nivah_user -p nivah_database < bdd/migrations/EXECUTE_ALL_MIGRATIONS.sql
```

### 4. Vérifier les permissions

```bash
chmod -R 755 backend-api/
chmod -R 777 backend-api/storage/
```

---

## ⚙️ Configuration

Le fichier `.env.production` contient toutes les variables d'environnement.

### Variables importantes :

```env
# Base de données
DB_HOST=localhost
DB_DATABASE=nivah_database
DB_USERNAME=nivah_user
DB_PASSWORD=change_me_locally

# JWT (GÉNÉRER UN NOUVEAU SECRET)
JWT_SECRET=<VOTRE_SECRET_ICI>
JWT_TTL=10080  # 7 jours en minutes

# URL de l'app
APP_URL=https://example.invalid
```

---

## 📁 Structure du projet

```
backend-api/
├── config/
│   └── config.php              # Configuration (charge .env.production)
├── core/
│   ├── Database.php            # Classe PDO singleton
│   ├── Response.php            # Gestion réponses JSON
│   └── JWT.php                 # Gestion tokens JWT
├── controllers/
│   ├── AuthController.php      # Authentification
│   ├── DemandeController.php   # Demandes clients
│   ├── BoutiqueController.php  # Boutiques (à créer)
│   └── ProduitController.php   # Produits (à créer)
├── models/                     # Modèles (optionnel)
├── middleware/                 # Middleware (optionnel)
├── utils/                      # Utilitaires
├── storage/
│   └── logs/                   # Logs
├── public/
│   ├── index.php               # Point d'entrée API
│   └── .htaccess               # Routing Apache
└── README.md
```

---

## 🔌 Endpoints disponibles

### 🔐 Authentification

#### 1. Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "demo.user@example.invalid",
  "mot_de_passe": "MotDePasse123!",
  "telephone": "700000000"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie. Un code de vérification a été envoyé à votre email.",
  "data": {
    "client_id": 1,
    "email": "demo.user@example.invalid",
    "code_verification": "123456"
  }
}
```

#### 2. Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "demo.user@example.invalid",
  "mot_de_passe": "MotDePasse123!"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "client": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "demo.user@example.invalid"
    }
  }
}
```

#### 3. Profil utilisateur

```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### 4. Mot de passe oublié

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "demo.user@example.invalid"
}
```

---

### 📋 Demandes Clients

#### 1. Lister les demandes

```http
GET /api/demandes?page=1&limit=20&statut=en_cours&type=reclamation
Authorization: Bearer {token}
```

**Paramètres query:**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Éléments par page (défaut: 20)
- `statut` (optionnel) : Filtrer par statut
- `type` (optionnel) : Filtrer par type

**Réponse:**
```json
{
  "success": true,
  "data": {
    "demandes": [
      {
        "id": 1,
        "numero": "DEM-20251222-000001",
        "type": "reclamation",
        "type_label": "Réclamation",
        "sujet": "Produit défectueux",
        "statut": "en_cours",
        "statut_label": "En cours",
        "priorite": "haute",
        "created_at": "2025-12-22 10:30:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

#### 2. Créer une demande

```http
POST /api/demandes
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "reclamation",
  "sujet": "Produit reçu cassé",
  "message": "J'ai reçu mon colis aujourd'hui mais le produit est endommagé...",
  "commande_id": 123,
  "produit_id": 456,
  "priorite": "haute"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Demande créée avec succès. Numéro: DEM-20251222-000001",
  "data": {
    "id": 1,
    "numero": "DEM-20251222-000001",
    "type": "reclamation",
    "statut": "nouveau",
    "priorite": "haute"
  }
}
```

#### 3. Détails d'une demande

```http
GET /api/demandes/DEM-20251222-000001
Authorization: Bearer {token}
```

#### 4. Annuler une demande

```http
PUT /api/demandes/1/annuler
Authorization: Bearer {token}
Content-Type: application/json

{
  "raison": "Problème résolu"
}
```

#### 5. Statistiques personnelles

```http
GET /api/demandes/statistiques
Authorization: Bearer {token}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "total_demandes": 12,
    "en_attente": 2,
    "en_cours": 1,
    "resolues": 8,
    "annulees": 1,
    "temps_moyen_premiere_reponse": "4h30min",
    "temps_moyen_resolution": "2j 5h"
  }
}
```

#### 6. Types de demandes

```http
GET /api/demandes/types
```

---

## 🧪 Tests

### Test avec cURL

```bash
# 1. Inscription
curl -X POST https://example.invalid/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "demo.user@example.invalid",
    "mot_de_passe": "Test123!",
    "telephone": "700000000"
  }'

# 2. Connexion
curl -X POST https://example.invalid/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo.user@example.invalid",
    "mot_de_passe": "Test123!"
  }'

# 3. Créer une demande (avec le token obtenu)
curl -X POST https://example.invalid/api/demandes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "type": "support",
    "sujet": "Question test",
    "message": "Ceci est un test"
  }'
```

### Test avec Postman

1. Importer la collection Postman (à créer)
2. Définir la variable `baseUrl` = `https://example.invalid/api`
3. Tester les endpoints

---

## 🚀 Déploiement

### Option 1: Déploiement sur hébergement partagé

1. **Uploader les fichiers via FTP**

```bash
# Structure sur le serveur
public_html/
├── api/
│   ├── config/
│   ├── core/
│   ├── controllers/
│   └── index.php
└── .env.production
```

2. **Configurer l'URL de réécriture**

Le fichier `.htaccess` est déjà configuré.

3. **Tester**

```bash
curl https://example.invalid/api/demandes/types
```

### Option 2: Déploiement avec Git

```bash
# Sur le serveur
cd /var/www/html
git clone https://github.com/votre-repo/nivah-api.git api
cd api/backend-api
chmod -R 777 storage/
```

---

## 🔒 Sécurité

### Checklist de sécurité en production :

- [x] JWT_SECRET généré aléatoirement et gardé secret
- [x] APP_DEBUG=false en production
- [x] HTTPS obligatoire
- [x] Validation des inputs (XSS, SQL injection)
- [x] Rate limiting (10 req/15min)
- [x] Headers de sécurité (X-Frame-Options, etc.)
- [x] Passwords hashés avec bcrypt
- [ ] Enlever `code_verification` de la réponse registration
- [ ] Configurer l'envoi d'emails
- [ ] Ajouter logs d'activité
- [ ] Blacklist JWT si nécessaire

---

## 📝 TODO

### Endpoints à créer :

- [ ] Boutiques (`BoutiqueController`)
- [ ] Produits (`ProduitController`)
- [ ] Panier
- [ ] Commandes
- [ ] Paiements (Paydunya)
- [ ] Notifications email et push local optionnel

### Améliorations :

- [ ] Upload de fichiers (demandes)
- [ ] Envoi d'emails (SMTP configuré)
- [ ] Rate limiting avancé
- [ ] Cache (Redis optionnel)
- [ ] Tests unitaires

---

## 🐛 Dépannage

### Erreur "Route non trouvée"

Vérifier que `mod_rewrite` est activé :

```bash
# Apache
a2enmod rewrite
service apache2 restart
```

### Erreur de connexion base de données

Vérifier les credentials dans `.env.production` :

```bash
mysql -u nivah_user -p -e "SHOW DATABASES;"
```

### Token JWT invalide

Regénérer un nouveau secret JWT et reconnecter tous les clients.

---

## 📞 Support

- **Email :** dev@example.invalid
- **Documentation :** [CAHIER_DES_CHARGES_NIVAH.md](../CAHIER_DES_CHARGES_NIVAH.md)

---

**Nivah API v1.0** - Backend PHP simple et efficace
