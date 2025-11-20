# 📋 CAHIER DES CHARGES - PROJET NIVAH

## 🎯 INFORMATIONS GÉNÉRALES

**Projet:** Nivah - Plateforme E-commerce Multi-Boutiques  
**Date:** 22 Décembre 2025  
**Version:** 1.0  
**Type:** Application Mobile + Backend API

---

## 📱 ARCHITECTURE DU PROJET

### Stack Technique Proposée

```
┌─────────────────────────────────────────────┐
│         APPLICATION MOBILE (FRONTEND)       │
│              Flutter (Dart)                 │
│     iOS + Android + Web (Progressive)       │
└─────────────────┬───────────────────────────┘
                  │
                  │ REST API (JSON)
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────┐
│           BACKEND API (SERVER)              │                
│  Option : PHP Laravel                       │            
└─────────────────┬───────────────────────────┘
                  │
                  │ MySQL
                  │
┌─────────────────▼───────────────────────────┐
│          BASE DE DONNÉES                    │
│          MySQL (Existante)                  │
│     - 20+ tables déjà créées                │
│     - Employés, Clients, Boutiques          │
│     - Produits, Commandes, Paiements        │
└─────────────────────────────────────────────┘
```

---

## 🎯 OBJECTIFS DU PROJET

### Objectif Principal
Créer un écosystème e-commerce mobile permettant aux clients de:
- ✅ S'inscrire et créer un compte sécurisé
- ✅ Se connecter avec authentification (JWT/OAuth)
- ✅ Parcourir les boutiques partenaires (Zara, H&M, Nike, etc.)
- ✅ Consulter les produits par catégorie
- ✅ Ajouter des articles au panier
- ✅ Passer des commandes
- ✅ Effectuer des paiements (Wave, Orange Money, CB)
- ✅ Suivre leurs commandes en temps réel



## 👥 ACTEURS DU SYSTÈME

### 1. Clients (Utilisateurs finaux)
- **Profil:** Acheteurs sur mobile (iOS/Android)
- **Besoins:** Navigation fluide, paiement sécurisé, suivi commandes
- **Authentification:** Email + Mot de passe 

### ⚠️ IMPORTANT - SCOPE DU PROJET

**CE PROJET COUVRE UNIQUEMENT :**
- ✅ Backend API Laravel pour les **clients**
- ✅ Application mobile Flutter pour les **clients**
- ✅ Endpoints lecture seule : boutiques, produits, catégories

**HORS SCOPE (Géré ailleurs) :**
- ❌ Dashboard admin/employés
- ❌ Gestion boutiques (création, modification, suppression)
- ❌ Gestion produits (ajout, modification, stock)
- ❌ Gestion commandes côté admin
- ❌ Statistiques et rapports

**Note :** Les boutiques et produits sont gérés via un système admin séparé. L'API cliente consomme ces données en **lecture seule**.

---

## 🔧 MODULES À DÉVELOPPER

### MODULE 1: BACKEND API (Priorité Haute)

#### 1.1 Authentification & Sécurité
**Endpoints:**
```
POST   /api/auth/register          - Inscription client
POST   /api/auth/login             - Connexion client
POST   /api/auth/verify-email      - Vérification email (code 6 chiffres)
POST   /api/auth/forgot-password   - Réinitialisation mot de passe
POST   /api/auth/refresh-token     - Renouvellement token JWT
POST   /api/auth/logout            - Déconnexion
GET    /api/auth/me                - Profil utilisateur connecté
```

**Sécurité:**
- ✅ JWT Tokens (access + refresh)
- ✅ Hashage bcrypt pour mots de passe
- ✅ Rate limiting (10 tentatives/min)
- ✅ Blocage compte après 10 échecs
- ✅ HTTP obligatoire
- ✅ Validation des inputs (XSS, SQL Injection)

#### 1.2 Gestion Clients
**Endpoints:**
```
GET    /api/clients/profile        - Détails profil client
PUT    /api/clients/profile        - Modifier profil
PUT    /api/clients/photo          - Upload photo profil
GET    /api/clients/addresses      - Liste adresses
POST   /api/clients/addresses      - Ajouter adresse livraison
PUT    /api/clients/addresses/:id  - Modifier adresse
DELETE /api/clients/addresses/:id  - Supprimer adresse
```

#### 1.3 Boutiques
**Endpoints:**
```
GET    /api/boutiques              - Liste boutiques actives
GET    /api/boutiques/featured     - Boutiques mises en avant
GET    /api/boutiques/:slug        - Détails boutique
GET    /api/boutiques/:slug/produits - Produits par boutique
GET    /api/boutiques/:slug/avis   - Avis sur boutique
```

**Fonctionnalités:**
- Filtrage (actif/inactif)
- Tri (note, popularité, A-Z)
- Recherche par nom
- Pagination (20 items/page)

#### 1.4 Produits & Catalogue
**Endpoints:**
```
GET    /api/produits               - Liste produits (avec filtres)
GET    /api/produits/nouveautes    - Nouveautés
GET    /api/produits/promotions    - Produits en promo
GET    /api/produits/coups-coeur   - Coups de cœur
GET    /api/produits/:slug         - Détails produit
GET    /api/produits/:id/variantes - Variantes (tailles, couleurs)
GET    /api/produits/:id/similaires - Produits similaires
POST   /api/produits/:id/vue       - Incrémenter vues

GET    /api/categories             - Liste catégories
GET    /api/categories/:slug       - Produits par catégorie
GET    /api/marques                - Liste marques
```

**Filtres:**
- Genre (homme, femme, enfant, mixte)
- Catégorie
- Marque
- Prix min/max
- Couleur, taille
- Disponibilité stock
- Note (⭐⭐⭐⭐⭐)

#### 1.5 Panier
**Endpoints:**
```
GET    /api/panier                 - Panier actif client
POST   /api/panier/ajouter         - Ajouter article
PUT    /api/panier/article/:id     - Modifier quantité
DELETE /api/panier/article/:id     - Retirer article
DELETE /api/panier/vider           - Vider panier
POST   /api/panier/code-promo      - Appliquer code promo
GET    /api/panier/calcul-frais    - Calcul frais livraison
```

**Logique Métier:**
- Persistance panier (session_id + client_id)
- Synchronisation multi-appareils
- Récupération panier abandonné
- Validation stock en temps réel
- Calcul automatique totaux

#### 1.6 Commandes
**Endpoints:**
```
POST   /api/commandes              - Créer commande
GET    /api/commandes              - Historique commandes
GET    /api/commandes/:numero      - Détails commande
PUT    /api/commandes/:id/annuler  - Annuler commande
GET    /api/commandes/:id/tracking - Suivi livraison
POST   /api/commandes/:id/avis     - Donner avis
```

**Workflow Commande:**
```
1. Client valide panier
2. Saisie adresse livraison
3. Choix mode livraison (standard/express)
4. Sélection mode paiement
5. Validation paiement
6. Confirmation commande (email + push)
7. Suivi statuts: en_attente → confirmee → en_preparation 
   → expedie → en_livraison → livree
```

#### 1.7 Paiements
**Endpoints:**
```
POST   /api/paiements/initier      - Initier paiement
POST   /api/paiements/callback     - Webhook providers
GET    /api/paiements/verify/:ref  - Vérifier statut paiement
POST   /api/paiements/remboursement - Demande remboursement
```

**Modes Paiement:**
- Paydunya integrant wave orange money paiement par carte 


**Sécurité:**
- Aucune carte stockée côté backend
- Tokenisation via Stripe/Wave
- Webhooks pour confirmation asynchrone
- Logs de toutes transactions

#### 1.8 Notifications
**Endpoints:**
```
POST   /api/notifications/register-token  - Enregistrer token FCM
GET    /api/notifications                 - Historique notifications
PUT    /api/notifications/:id/read        - Marquer comme lue
```

**Types Notifications:**
- 📦 Statut commande modifié
- 🎉 Nouvelle promo dans boutique favorite
- ⭐ Demande d'avis après livraison
- 🚚 Colis en cours de livraison
- 💰 Remboursement effectué

#### 1.9 Recherche & Filtres
**Endpoints:**
```
GET    /api/recherche              - Recherche globale
GET    /api/recherche/suggestions  - Autocomplétion
GET    /api/recherche/historique   - Historique recherches client
```

**Fonctionnalités:**
- Recherche full-text (nom, description, référence)
- Suggestions temps réel
- Historique personnel
- Filtres avancés

#### 1.10 Demandes Clients (Support & SAV)
**Endpoints:**
```
GET    /api/demandes                      - Liste des demandes du client
POST   /api/demandes                      - Créer une nouvelle demande
GET    /api/demandes/:numero              - Détails d'une demande
PUT    /api/demandes/:id/annuler          - Annuler une demande
POST   /api/demandes/:id/messages         - Ajouter un message
POST   /api/demandes/:id/pieces-jointes   - Upload fichier
GET    /api/demandes/types                - Liste types de demandes
GET    /api/demandes/statistiques         - Statistiques personnelles
```

**Types de demandes:**
- 🆘 **Support technique** - Problèmes connexion, bugs app, erreurs paiement
- 📢 **Réclamation** - Produit non conforme, livraison tardive, service client
- ❓ **Question produit** - Informations produit, disponibilité, caractéristiques
- 🚚 **Question livraison** - Suivi colis, adresse, délais
- 💰 **Remboursement** - Demande de remboursement, avoir, retour produit
- 🔄 **Retour/Échange** - Demande de retour ou échange produit
- 📝 **Autre** - Toute autre demande

**Statuts workflow:**
```
nouveau (client crée demande)
  ↓
en_attente (en file d'attente support)
  ↓
en_cours (pris en charge par agent)
  ↓
en_attente_client (réponse fournie, attend retour client)
  ↓
resolu (problème résolu)
  ↓
clos (fermé définitivement)

ou

annule (annulé par client)
```

**Niveaux de priorité:**
- **Basse** (7-14 jours) - Questions générales
- **Normale** (3-5 jours) - Questions produits, livraison
- **Haute** (24-48h) - Réclamations, problèmes commande
- **Urgente** (< 24h) - Paiement bloqué, problème sécurité

**Fonctionnalités:**

1. **Numérotation unique:**
   - Format: `DEM-YYYYMMDD-XXXXXX`
   - Exemple: `DEM-20251222-000001`
   - Auto-incrémenté par jour
   - Traçable et unique

2. **Lien avec entités:**
   - Lien avec commande (optionnel) - pour suivi SAV
   - Lien avec produit (optionnel) - pour questions produit
   - Référence automatique au client authentifié

3. **Upload de fichiers:**
   - Types acceptés: JPG, PNG, PDF, HEIC
   - Taille max: 5MB par fichier
   - Max 5 fichiers par demande
   - Stockage sécurisé avec URL signée
   - Prévisualisation dans l'app

4. **Système de messagerie:**
   - Thread de messages (conversation)
   - Messages client ↔ support
   - Horodatage précis
   - Indicateur "nouveau message" (badge)
   - Notifications push à chaque réponse

5. **Notifications:**
   - Création demande → Confirmation reçue
   - Changement statut → Notification push + email
   - Nouvelle réponse support → Alerte temps réel
   - Résolution → Demande d'avis satisfaction

6. **SLA (Service Level Agreement):**
   - Première réponse < 24h (jours ouvrés)
   - Résolution urgente < 24h
   - Résolution normale < 5 jours
   - Indicateur temps écoulé dans l'app

**Données requises à la création:**
```json
{
  "type": "reclamation|support|question_produit|...",
  "sujet": "Titre court (max 100 car)",
  "message": "Description détaillée (max 2000 car)",
  "commande_numero": "CMD-20251222-000123", // optionnel
  "produit_id": 456, // optionnel
  "priorite": "normale", // auto ou manuel
  "pieces_jointes": ["file1.jpg", "file2.pdf"] // optionnel
}
```

**Réponse API - Détails demande:**
```json
{
  "id": 1,
  "numero": "DEM-20251222-000001",
  "type": "reclamation",
  "type_label": "Réclamation",
  "sujet": "Produit reçu endommagé",
  "statut": "en_cours",
  "statut_label": "En cours de traitement",
  "priorite": "haute",
  "commande": {
    "numero": "CMD-20251222-000123",
    "total": 45000,
    "date": "2025-12-20"
  },
  "messages": [
    {
      "id": 1,
      "auteur": "client",
      "auteur_nom": "Jean Dupont",
      "message": "J'ai reçu mon produit cassé...",
      "pieces_jointes": [
        {
          "nom": "produit_casse.jpg",
          "url": "https://cdn.nivah.com/demandes/1/produit_casse.jpg",
          "type": "image/jpeg",
          "taille": 2457600
        }
      ],
      "created_at": "2025-12-22 10:30:00"
    },
    {
      "id": 2,
      "auteur": "support",
      "auteur_nom": "Service Client Nivah",
      "message": "Nous sommes désolés. Nous allons procéder à un échange...",
      "created_at": "2025-12-22 14:15:00"
    }
  ],
  "temps_ecoule": "3h45min",
  "sla_respecte": true,
  "created_at": "2025-12-22 10:30:00",
  "updated_at": "2025-12-22 14:15:00"
}
```

**Validation & Sécurité:**
- ✅ Client peut uniquement voir ses propres demandes
- ✅ Limite 5 demandes/jour par client (anti-spam)
- ✅ Validation format fichiers (MIME type)
- ✅ Scan antivirus fichiers uploadés
- ✅ Sanitisation inputs (XSS, injection)
- ✅ Rate limiting: 20 req/min
- ✅ Logs complets de toutes actions

**Indicateurs de performance:**
- Temps moyen de première réponse
- Temps moyen de résolution par type
- Taux de satisfaction (après résolution)
- Nombre de demandes ouvertes/fermées
- Top 5 problèmes récurrents

---

### MODULE 2: APPLICATION MOBILE FLUTTER (Priorité Haute)

#### 2.1 Pages & Écrans

**Authentification:**
```
├── Splash Screen (logo + animation)
├── Onboarding (3 slides présentation)
├── Inscription
├── Connexion
├── Vérification Email (OTP 6 chiffres)
└── Mot de passe oublié
```

**Navigation Principale:**
```
└── Bottom Navigation Bar (5 onglets)
    ├── 🏠 Accueil
    ├── 🏪 Boutiques
    ├── 🛒 Panier
    ├── 📦 Commandes
    └── 👤 Profil
```

**Écran Accueil:**
- Bannière carrousel (promos)
- Catégories (grille horizontale scrollable)
- Boutiques featured (cartes)
- Nouveautés (grille produits)
- Coups de cœur (liste horizontale)
- Sections par genre (Homme, Femme, Enfant)

**Écran Boutiques:**
- Liste boutiques (cartes avec logo)
- Barre de recherche
- Filtre actif/featured
- Tri (A-Z, note, popularité)
- Entrée dans boutique → Catalogue produits

**Écran Produit (Détails):**
- Galerie images (swiper)
- Nom + Prix (barré si promo)
- Note ⭐⭐⭐⭐⭐ + nombre avis
- Description complète
- Sélection variantes (taille, couleur)
- Quantité (+/- buttons)
- Bouton "Ajouter au panier" (sticky bottom)
- Produits similaires (carrousel)
- Section avis clients

**Écran Panier:**
- Liste articles (image, nom, prix, quantité)
- Boutons +/- pour modifier quantité
- Swipe pour supprimer
- Champ code promo
- Résumé: Sous-total, Remise, Frais livraison, Total
- Bouton "Commander" (sticky)

**Écran Commande:**
- Étape 1: Adresse livraison
- Étape 2: Mode livraison (standard/express)
- Étape 3: Récapitulatif
- Étape 4: Paiement
- Étape 5: Confirmation (animation succès)

**Écran Mes Commandes:**
- Onglets: En cours / Historique
- Cartes commandes (numéro, date, total, statut)
- Timeline statuts avec badges colorés
- Bouton "Suivre livraison" (si expedie)
- Bouton "Annuler" (si en_attente)

**Écran Profil:**
- Photo + Nom client
- Sections:
  - Mes informations
  - Mes adresses
  - Moyens de paiement sauvegardés
  - Mes demandes (support)
  - Notifications
  - Langue
  - Mode sombre
  - À propos
  - Déconnexion

**Écran Mes Demandes (Support):**
- Liste demandes (cartes avec statut coloré)
- Bouton "Nouvelle demande" (floating action)
- Filtres par statut/type
- Timeline réponses
- Upload pièces jointes

**Écran Créer Demande:**
- Sélection type (dropdown)
- Lien avec commande (optionnel)
- Sujet (input)
- Message détaillé (textarea)
- Upload fichiers (images, PDF)
- Bouton "Envoyer"

#### 2.2 Packages Flutter Requis

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  # ou riverpod: ^2.4.0
  
  # Networking
  http: ^1.1.2
  dio: ^5.4.0  # Recommended pour API REST
  
  # Authentification
  flutter_secure_storage: ^9.0.0  # Stockage sécurisé tokens
  jwt_decoder: ^2.0.1
  
  # UI/UX
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0  # Loading skeletons
  flutter_svg: ^2.0.9
  google_fonts: ^6.1.0
  animate_do: ^3.1.2  # Animations
  smooth_page_indicator: ^1.1.0  # Dots indicators
  
  # Navigation
  go_router: ^13.0.0
  
  # Paiements
  flutter_stripe: ^10.1.0
  
  # Notifications
  # Notifications locales via API PHP/email
  flutter_local_notifications: ^16.3.0
  
  # Géolocalisation
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # Autres
  intl: ^0.19.0  # Formatage dates/devises
  share_plus: ^7.2.1
  url_launcher: ^6.2.2
  image_picker: ^1.0.5  # Upload photos demandes support
  pin_code_fields: ^8.0.1  # OTP input
  badges: ^3.1.2  # Badge panier
  file_picker: ^6.1.1  # Upload fichiers PDF
  flutter_chat_ui: ^1.6.11  # Interface messagerie demandes
```

#### 2.3 Architecture Flutter

```
lib/
├── main.dart
├── app.dart
├── config/
│   ├── routes.dart
│   ├── theme.dart
│   └── constants.dart
├── core/
│   ├── api/
│   │   ├── api_client.dart
│   │   ├── api_endpoints.dart
│   │   └── api_interceptor.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   └── services/
│       ├── auth_service.dart
│       ├── storage_service.dart
│       └── notification_service.dart
├── models/
│   ├── client.dart
│   ├── boutique.dart
│   ├── produit.dart
│   ├── panier.dart
│   ├── commande.dart
│   └── paiement.dart
├── providers/
│   ├── auth_provider.dart
│   ├── boutique_provider.dart
│   ├── produit_provider.dart
│   ├── panier_provider.dart
│   └── commande_provider.dart
├── screens/
│   ├── auth/
│   ├── home/
│   ├── boutiques/
│   ├── produits/
│   ├── panier/
│   ├── commandes/
│   ├── demandes/
│   └── profil/
└── widgets/
    ├── common/
    ├── cards/
    ├── buttons/
    └── inputs/
```

---

## 📊 MODÈLE DE DONNÉES (Base Existante)

### Tables Principales
✅ **employes** - Gestion staff (déjà créée)  
✅ **clients** - Utilisateurs app mobile (déjà créée)  
✅ **boutiques** - Multi-boutiques (5 insérées: Zara, H&M, Nike, Sephora, Adidas)  
✅ **categories** - Arbre catégories (déjà créée)  
✅ **produits** - Catalogue complet (déjà créée)  
✅ **variantes_produits** - Tailles, couleurs (déjà créée)  
✅ **images_produits** - Galerie photos (déjà créée)  
✅ **paniers** - Paniers clients (déjà créée)  
✅ **panier_articles** - Items panier (déjà créée)  
✅ **commandes** - Historique commandes (déjà créée)  
✅ **commande_articles** - Détails articles (déjà créée)  
✅ **paiements** - Transactions (déjà créée)  
✅ **logs_activite** - Logs audit (déjà créée)  
✅ **demandes_clients** - Support et réclamations (déjà créée)

### Extensions Nécessaires

**Nouvelle table: notifications**
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  type ENUM('commande', 'promo', 'livraison', 'avis', 'systeme'),
  titre VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data_json TEXT,
  lue BOOLEAN DEFAULT FALSE,
  date_lecture DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

**Nouvelle table: tokens_fcm**
```sql
CREATE TABLE tokens_fcm (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  device_type ENUM('ios', 'android', 'web'),
  actif BOOLEAN DEFAULT TRUE,
  derniere_utilisation DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_client_token (client_id, token),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
```

**Nouvelle table: favoris**
```sql
CREATE TABLE favoris (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  produit_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_favori (client_id, produit_id),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);
```

**Extension table demandes_clients** (colonnes supplémentaires)
```sql
-- Ajouter colonnes si manquantes:
ALTER TABLE demandes_clients
  ADD COLUMN IF NOT EXISTS numero VARCHAR(50) UNIQUE AFTER id,
  ADD COLUMN IF NOT EXISTS produit_id INT NULL AFTER commande_id,
  ADD COLUMN IF NOT EXISTS sla_premiere_reponse DATETIME NULL,
  ADD COLUMN IF NOT EXISTS sla_resolution DATETIME NULL,
  ADD COLUMN IF NOT EXISTS temps_premiere_reponse INT NULL COMMENT 'en minutes',
  ADD COLUMN IF NOT EXISTS temps_resolution INT NULL COMMENT 'en minutes',
  ADD COLUMN IF NOT EXISTS satisfaction_note TINYINT NULL COMMENT '1-5 étoiles',
  ADD COLUMN IF NOT EXISTS satisfaction_commentaire TEXT NULL,
  ADD FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL;

-- Trigger pour générer le numéro unique
DELIMITER $$
CREATE TRIGGER before_insert_demande_numero
BEFORE INSERT ON demandes_clients
FOR EACH ROW
BEGIN
  DECLARE next_num INT;
  DECLARE date_prefix VARCHAR(8);

  SET date_prefix = DATE_FORMAT(NOW(), '%Y%m%d');

  -- Récupérer le prochain numéro pour aujourd'hui
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero, -6) AS UNSIGNED)), 0) + 1
  INTO next_num
  FROM demandes_clients
  WHERE numero LIKE CONCAT('DEM-', date_prefix, '-%');

  -- Générer le numéro format: DEM-20251222-000001
  SET NEW.numero = CONCAT('DEM-', date_prefix, '-', LPAD(next_num, 6, '0'));
END$$
DELIMITER ;
```

---

## 🔐 SÉCURITÉ & CONFORMITÉ

### Authentification
- ✅ JWT avec expiration (15min access, 7j refresh)
- ✅ Refresh token rotation
- ✅ Logout = blacklist token

### Protection Données (RGPD)
- ✅ Consentement explicite
- ✅ Droit à l'oubli (suppression compte)
- ✅ Export données personnelles
- ✅ Chiffrement mots de passe (bcrypt)

### API Security
- ✅ Rate limiting (100 req/min par IP)
- ✅ CORS configuré
- ✅ Input validation (Joi/Yup)
- ✅ Headers sécurisés (Helmet.js si Node)
- ✅ HTTPS obligatoire en production

### Logs & Monitoring
- ✅ Table `logs_activite` (déjà créée)
- ✅ Logs erreurs API
- ✅ Monitoring paiements
- ✅ Alertes anomalies

---

## 📈 INDICATEURS DE PERFORMANCE (KPIs)

### Techniques
- Temps réponse API < 200ms
- Uptime > 99.5%
- Taux erreur < 1%

### Business
- Taux conversion panier → commande
- Valeur moyenne panier
- Taux paniers abandonnés
- Nombre commandes/jour
- Produits les plus vendus

---

## 📅 PLANNING SUGGÉRÉ

### Phase 1: Backend API (3-4 semaines)
**Semaine 1-2:**
- Setup projet (Node.js/PHP/Python)
- Connexion base de données
- Authentification JWT
- Endpoints clients + boutiques

**Semaine 3-4:**
- Endpoints produits + panier
- Endpoints commandes
- Intégration paiements
- Endpoints demandes clients (support/SAV)
- Tests API (Postman/Insomnia)

### Phase 2: Application Flutter (4-5 semaines)
**Semaine 5-6:**
- Setup Flutter + architecture
- Écrans authentification
- Intégration API auth
- Navigation principale

**Semaine 7-8:**
- Écrans boutiques + produits
- Panier fonctionnel
- Filtres & recherche

**Semaine 9:**
- Processus commande
- Intégration paiements
- Notifications push
- Écrans demandes clients (support/SAV)
- Interface messagerie & upload fichiers

### Phase 3: Tests & Déploiement (2 semaines)
**Semaine 10:**
- Tests utilisateurs (beta)
- Corrections bugs
- Optimisations performances

**Semaine 11:**
- Déploiement API (Heroku/DigitalOcean/AWS)
- Publication stores (Google Play + App Store)
- Documentation

---

## 🚀 TECHNOLOGIES RECOMMANDÉES

### Option : PHP Laravel
```
- Framework: Laravel 11
- ORM: Eloquent
- Auth: Laravel Sanctum
- Validation: Form Requests
- Logs: Monolog
- Tests: PHPUnit
```

---

## 💰 ESTIMATION BUDGET (Approximatif)

### Développement
- Backend API: 40-60h → 2000-3000€
- App Flutter: 80-100h → 4000-5000€
- Tests & Debug: 20h → 1000€
- **Total Dev: 7000-9000€**

### Infrastructure (mensuel)
- Hébergement API: 20-50€/mois
- Base de données: Inclus
- Notifications locales (email/API PHP): inclus en local
- CDN images: 10-30€/mois
- **Total Infra: 30-100€/mois**

### Frais Paiements
- Stripe: 1.4% + 0.25€/transaction
- Wave: 1-2%
- Orange Money: 2-3%

---

## ✅ LIVRABLES FINAUX

### Backend
- [ ] API REST complète documentée (Swagger)
- [ ] Code source versionné (Git)
- [ ] Tests unitaires > 70% coverage
- [ ] Documentation technique
- [ ] Scripts déploiement

### Flutter
- [ ] Application iOS + Android
- [ ] Code source versionné (Git)
- [ ] Guide utilisateur
- [ ] Assets graphiques (logos, icônes)
- [ ] Packages stores

### Documentation
- [ ] Cahier des charges (ce document)
- [ ] Schéma architecture
- [ ] Guide développeur API
- [ ] Guide déploiement
- [ ] Changelog versions

---

## 📋 CAS D'USAGE - SYSTÈME DE DEMANDES CLIENTS

### Scénario 1: Réclamation Produit Défectueux

**Contexte:** Client reçoit un produit endommagé

**Flux utilisateur:**
1. Client ouvre l'app → Va dans "Mes Commandes"
2. Clique sur la commande concernée → "Signaler un problème"
3. Sélectionne type "Réclamation" → "Produit défectueux"
4. Remplit formulaire:
   - Sujet: "Produit reçu cassé"
   - Description détaillée du problème
   - Upload 2-3 photos du produit endommagé
5. Soumet la demande
6. Reçoit notification: "Demande #DEM-20251222-000001 créée"
7. Service client répond sous 24h avec solution
8. Client reçoit notification push de la réponse
9. Dialogue jusqu'à résolution (échange ou remboursement)

**Réponse API après création:**
```json
{
  "success": true,
  "message": "Demande créée avec succès",
  "demande": {
    "numero": "DEM-20251222-000001",
    "statut": "en_attente",
    "priorite": "haute",
    "sla_premiere_reponse": "2025-12-23 10:30:00"
  }
}
```

### Scénario 2: Question sur un Produit

**Contexte:** Client veut savoir si un produit est disponible en taille XL

**Flux utilisateur:**
1. Client consulte fiche produit
2. Clique sur "Poser une question"
3. Type: "Question produit" (pré-sélectionné)
4. Message: "Ce modèle est-il disponible en taille XL ?"
5. Produit automatiquement lié à la demande
6. Support répond rapidement (< 3h généralement)

**Données envoyées:**
```json
{
  "type": "question_produit",
  "sujet": "Disponibilité taille XL",
  "message": "Ce modèle est-il disponible en taille XL ?",
  "produit_id": 789,
  "priorite": "normale"
}
```

### Scénario 3: Suivi d'une Demande Existante

**Flux utilisateur:**
1. Client va dans Profil → "Mes demandes"
2. Voit liste des demandes avec badges de statut:
   - 🟡 En attente (2)
   - 🔵 En cours (1)
   - 🟢 Résolues (5)
3. Clique sur une demande en cours
4. Affichage style "chat" avec timeline:
   - Message initial du client (hier 10:30)
   - Réponse support (hier 14:15)
   - Badge "Nouveau message" si non lu
5. Client peut ajouter un message de suivi
6. Upload fichier complémentaire si besoin

**Interface conversation:**
```
┌─────────────────────────────────────────┐
│ DEM-20251222-000001 · En cours          │
│ Réclamation · Haute priorité            │
├─────────────────────────────────────────┤
│                                         │
│ [CLIENT] Jean Dupont                    │
│ Hier à 10:30                           │
│ J'ai reçu mon produit cassé...         │
│ 📎 produit_casse.jpg                   │
│                                         │
│         [SUPPORT] Service Client Nivah │
│                          Hier à 14:15  │
│ Nous sommes désolés. Nous procédons   │
│ à un échange immédiat...               │
│                                         │
│ [NOUVEAU] ●                            │
│ [CLIENT] Jean Dupont                    │
│ Aujourd'hui à 09:00                    │
│ Merci ! Quand recevrai-je le           │
│ nouveau produit ?                       │
│                                         │
└─────────────────────────────────────────┘
  [Votre message...]              [Envoyer]
```

### Scénario 4: Annulation d'une Demande

**Contexte:** Client résout le problème par lui-même

**Flux utilisateur:**
1. Client ouvre sa demande en attente
2. Clique sur "Annuler la demande"
3. Popup de confirmation: "Êtes-vous sûr ?"
4. Choisit raison: "Problème résolu" / "Plus nécessaire" / "Autre"
5. Demande passe en statut "annulé"
6. Plus de notifications envoyées

### Scénario 5: Demande de Remboursement

**Contexte:** Client insatisfait veut un remboursement

**Flux utilisateur:**
1. Type: "Remboursement"
2. Commande liée obligatoire
3. Raison: Dropdown avec options
   - Produit non conforme
   - Délai de livraison dépassé
   - Changement d'avis (si < 14 jours)
   - Autre
4. Upload justificatifs (facture, photos)
5. Priorité automatique: "Haute"
6. Traitement sous 48h maximum
7. Si approuvé → Remboursement sous 5-7 jours

**Workflow backend:**
```
1. Vérification éligibilité (délai retour, conditions)
2. Validation par service client
3. Si OK → Création ordre de remboursement
4. Notification client "Remboursement approuvé"
5. Traitement paiement inverse
6. Notification "Remboursement effectué"
7. Demande → statut "resolu"
```

### Indicateurs de Qualité du Service

**Pour le client (visibles dans l'app):**
- ⏱️ Temps de première réponse: "Répondu en 3h45"
- 📊 Statut SLA: ✅ "Dans les délais" / ⚠️ "En retard"
- 🎯 Taux de résolution: "98% de nos demandes résolues"

**Pour Nivah (dashboard admin - hors scope):**
- Temps moyen première réponse par type
- Taux de résolution par agent
- Satisfaction client (note /5 après résolution)
- Volume de demandes par jour/semaine
- Pics d'activité (pour staffing support)

### Notifications Push Associées

**Événements déclencheurs:**
1. ✅ **Demande créée** → "Votre demande #DEM-XXX a été enregistrée"
2. 🔔 **Prise en charge** → "Un agent traite votre demande"
3. 💬 **Nouveau message support** → "Vous avez une nouvelle réponse"
4. ⚡ **Changement statut** → "Demande #DEM-XXX → Résolue"
5. ⭐ **Demande avis** → "Comment s'est passé votre support ?"
6. ⏰ **Rappel** → "Votre demande attend votre retour" (si en_attente_client > 3j)

### Règles Métier Importantes

1. **Limite anti-spam:** 5 demandes max/jour/client
2. **Auto-fermeture:** Demande "en_attente_client" > 15 jours → auto-close
3. **Fichiers:** Scan antivirus obligatoire avant stockage
4. **Confidentialité:** Client voit UNIQUEMENT ses demandes
5. **Traçabilité:** Logs de toutes actions (qui, quand, quoi)
6. **RGPD:** Suppression demandes si client supprime son compte

---

## 🎨 DESIGN & UX

### Charte Graphique
- Couleurs principales: #FF6B6B (rouge), #4ECDC4 (turquoise), #292F36 (dark)
- Typographie: SF Pro / Roboto
- Style: Material Design + iOS Human Interface Guidelines
- Mode sombre supporté

### Principes UX
- ✅ Navigation intuitive (max 3 clics pour acheter)
- ✅ Chargements optimisés (shimmer loading)
- ✅ Feedback visuel immédiat
- ✅ Accessibilité (contraste, tailles texte)
- ✅ Offline mode (cache produits récents)

---

## 📞 CONTACTS & SUPPORT

**Support Technique:** support@example.invalid  
**Urgences:** +221 XX XXX XX XX  
**Documentation:** docs.nivah.com

---

## 📝 NOTES IMPORTANTES

1. **Base de données déjà prête** ✅
   - 20+ tables créées
   - Relations définies
   - Triggers fonctionnels
   - Données de test insérées

2. **Prochaines étapes:**
   - [ ] Valider ce cahier des charges
   - [ ] Choisir stack backend (Node.js recommandé)
   - [ ] Créer repo GitHub
   - [ ] Setup environnement dev
   - [ ] Commencer développement API

3. **Priorités de développement:**
   - **P1 (Critique):** Auth + Boutiques + Produits
   - **P2 (Important):** Panier + Commandes
   - **P3 (Important):** Paiements + Notifications
   - **P4 (Normal):** Demandes Clients (Support/SAV)
   - **P5 (Nice to have):** Favoris + Recherche avancée

---

**Document créé le:** 22 Décembre 2025
**Dernière mise à jour:** 22 Décembre 2025
**Version:** 1.1

### 📝 Changelog Version 1.1
**Ajouts majeurs:**
- ✅ Section complète "Demandes Clients (Support & SAV)" avec 8 endpoints API
- ✅ Extension table existante `demandes_clients` avec nouvelles colonnes (numero, produit_id, SLA, satisfaction)
- ✅ Trigger MySQL pour génération automatique numéro unique (DEM-YYYYMMDD-XXXXXX)
- ✅ Workflow complet des statuts (nouveau → en_attente → en_cours → résolu → clos)
- ✅ Système de suivi des demandes avec SLA automatique
- ✅ Gestion priorités (basse, normale, haute, urgente) avec calcul SLA
- ✅ 5 scénarios d'usage détaillés (réclamation, question produit, suivi, annulation, remboursement)
- ✅ 6 types de notifications push associées
- ✅ Règles métier (limite 5 demandes/jour, auto-close après 15j)
- ✅ Procédures stockées: statistiques client, auto-fermeture demandes inactives
- ✅ Vue SQL: demandes en cours avec statut SLA
- ✅ Intégration dans planning (semaines 3-4 backend, semaine 9 Flutter)

---

## 🤝 VALIDATION

Ce cahier des charges doit être validé par:
- [ ] Client/Product Owner
- [ ] Développeur Backend
- [ ] Développeur Flutter
- [ ] Designer UX/UI
- [ ] Chef de projet

**Date validation:** ________________  
**Signature:** ________________
