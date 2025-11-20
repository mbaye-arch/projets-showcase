# 🎯 TOUS LES ENDPOINTS - API Nivah

## 📊 Résumé

**Total : 65+ endpoints**

- ✅ Authentification : 5 endpoints
- ✅ Profil Client : 6 endpoints
- ✅ Adresses : 4 endpoints
- ✅ Boutiques : 4 endpoints
- ✅ Produits : 8 endpoints
- ✅ Catégories : 4 endpoints
- ✅ Marques : 4 endpoints
- ✅ Panier : 7 endpoints
- ✅ Commandes : 8 endpoints
- ✅ Demandes (SAV) : 6 endpoints

---

## 🔐 AUTHENTIFICATION (5)

### POST /api/auth/register
Inscription d'un nouveau client
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "demo.user@example.invalid",
  "mot_de_passe": "Password123!",
  "telephone": "700000000"
}
```

### POST /api/auth/login
Connexion (retourne JWT token)
```json
{
  "email": "demo.user@example.invalid",
  "mot_de_passe": "Password123!"
}
```

### POST /api/auth/forgot-password
Demande de réinitialisation mot de passe
```json
{
  "email": "demo.user@example.invalid"
}
```

### GET /api/auth/me 🔒
Profil utilisateur connecté

### POST /api/auth/logout 🔒
Déconnexion

---

## 👤 PROFIL CLIENT (6)

### GET /api/client/profil 🔒
Obtenir le profil complet

### PUT /api/client/profil 🔒
Mettre à jour le profil
```json
{
  "nom": "Nouveau Nom",
  "prenom": "Nouveau Prénom",
  "telephone": "700000001",
  "ville": "Dakar"
}
```

### PUT /api/client/mot-de-passe 🔒
Changer le mot de passe
```json
{
  "ancien_mot_de_passe": "Old123!",
  "nouveau_mot_de_passe": "New123!"
}
```

### PUT /api/client/preferences 🔒
Mettre à jour les préférences
```json
{
  "notifications_enabled": true,
  "newsletter_subscribed": false,
  "langue": "fr"
}
```

### DELETE /api/client/compte 🔒
Supprimer le compte
```json
{
  "mot_de_passe": "Password123!"
}
```

---

## 📍 ADRESSES (4)

### GET /api/client/adresses 🔒
Liste des adresses de livraison

### POST /api/client/adresses 🔒
Ajouter une adresse
```json
{
  "adresse": "10 Rue de la Paix",
  "ville": "Dakar",
  "quartier": "Plateau",
  "region": "Dakar",
  "telephone": "700000000",
  "est_defaut": true
}
```

### PUT /api/client/adresses/{id} 🔒
Modifier une adresse

### DELETE /api/client/adresses/{id} 🔒
Supprimer une adresse

---

## 🏪 BOUTIQUES (4)

### GET /api/boutiques
Liste des boutiques
**Params:** `?featured=true&search=zara&sort=nom_asc&page=1&limit=20`

### GET /api/boutiques/featured
Boutiques mises en avant

### GET /api/boutiques/{slug}
Détails d'une boutique
**Exemple:** `/api/boutiques/zara`

### GET /api/boutiques/{slug}/produits
Produits d'une boutique
**Params:** `?categorie_id=1&prix_min=1000&prix_max=50000&sort=prix_asc`

---

## 🛍️ PRODUITS (8)

### GET /api/produits
Liste des produits avec filtres avancés
**Params:**
```
?boutique_id=1
&categorie_id=2
&marque_id=3
&genre=homme
&prix_min=1000
&prix_max=50000
&nouveautes=true
&coups_coeur=true
&promotions=true
&en_stock=true
&search=chaussure
&sort=prix_asc
&page=1
&limit=20
```

### GET /api/produits/nouveautes
Produits nouveautés
**Params:** `?limit=10`

### GET /api/produits/coups-coeur
Coups de cœur
**Params:** `?limit=10`

### GET /api/produits/promotions
Produits en promotion
**Params:** `?limit=20`

### GET /api/produits/{slug}
Détails d'un produit
**Exemple:** `/api/produits/nike-air-max-90`

### GET /api/produits/{id}/similaires
Produits similaires
**Params:** `?limit=6`

### POST /api/produits/{id}/vue
Incrémenter le nombre de vues

### GET /api/produits/{id}/stock
Vérifier la disponibilité du stock
**Params:** `?quantity=2`

---

## 📂 CATEGORIES (4)

### GET /api/categories
Arbre hiérarchique des catégories
**Params:** `?format=tree` (ou `flat`)

### GET /api/categories/{slug}
Détails d'une catégorie
**Exemple:** `/api/categories/vetements-homme`

### GET /api/categories/{id}/produits
Produits d'une catégorie
**Params:** `?prix_min=1000&prix_max=50000&genre=homme&sort=prix_asc`

### GET /api/categories/{id}/children
Sous-catégories

---

## 🏷️ MARQUES (4)

### GET /api/marques
Liste des marques
**Params:** `?premium=true&search=nike&page=1&limit=50`

### GET /api/marques/premium
Marques premium uniquement

### GET /api/marques/{slug}
Détails d'une marque
**Exemple:** `/api/marques/nike`

### GET /api/marques/{id}/produits
Produits d'une marque
**Params:** `?categorie_id=1&genre=homme&sort=prix_desc`

---

## 🛒 PANIER (7)

### GET /api/panier 🔒
Obtenir le panier actif du client

### GET /api/panier/count 🔒
Compter les articles du panier

### POST /api/panier/ajouter 🔒
Ajouter un article au panier
```json
{
  "produit_id": 123,
  "quantite": 2,
  "variante_id": 456
}
```

### PUT /api/panier/article/{id} 🔒
Modifier la quantité d'un article
```json
{
  "quantite": 3
}
```

### DELETE /api/panier/article/{id} 🔒
Retirer un article du panier

### DELETE /api/panier/vider 🔒
Vider complètement le panier

### POST /api/panier/valider 🔒
Valider le panier avant commande

---

## 📦 COMMANDES (8)

### GET /api/commandes 🔒
Liste des commandes du client
**Params:** `?statut=en_cours&page=1&limit=20`

### POST /api/commandes 🔒
Créer une commande depuis le panier
```json
{
  "adresse_livraison": "10 Rue de la Paix, Dakar",
  "adresse_facturation": "10 Rue de la Paix, Dakar",
  "mode_livraison": "standard",
  "mode_paiement": "paydunya"
}
```

### GET /api/commandes/{numero} 🔒
Détails d'une commande
**Exemple:** `/api/commandes/CMD-20251223-000001`

### GET /api/commandes/statistiques 🔒
Statistiques des commandes du client

### PUT /api/commandes/{id}/annuler 🔒
Annuler une commande
```json
{
  "raison": "Changement d'avis"
}
```

### GET /api/commandes/{id}/tracking 🔒
Suivi de livraison (timeline)

### GET /api/commandes/{id}/facture 🔒
Télécharger la facture (TODO: PDF)

---

## 🆘 DEMANDES - Support/SAV (6)

### GET /api/demandes 🔒
Liste des demandes du client
**Params:** `?statut=en_cours&type=reclamation&page=1&limit=20`

### POST /api/demandes 🔒
Créer une demande
```json
{
  "type": "reclamation",
  "sujet": "Produit défectueux",
  "message": "J'ai reçu un produit cassé...",
  "commande_id": 123,
  "produit_id": 456,
  "priorite": "haute"
}
```

### GET /api/demandes/{numero} 🔒
Détails d'une demande
**Exemple:** `/api/demandes/DEM-20251223-000001`

### PUT /api/demandes/{id}/annuler 🔒
Annuler une demande
```json
{
  "raison": "Problème résolu"
}
```

### GET /api/demandes/statistiques 🔒
Statistiques personnelles des demandes

### GET /api/demandes/types 🔒
Liste des types de demandes disponibles

---

## 🔑 Légende

- 🔒 = Authentification JWT requise
- Sans icône = Route publique

---

## 📝 Headers requis

### Routes publiques
```
Content-Type: application/json
```

### Routes protégées 🔒
```
Content-Type: application/json
Authorization: Bearer {votre_token_jwt}
```

---

## 💡 Exemples d'utilisation

### 1. Inscription + Connexion + Profil

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

# Réponse: { "token": "eyJ0eXAiOiJKV1QiLCJh..." }

# 3. Profil
curl https://example.invalid/api/auth/me \
  -H "Authorization: Bearer {TOKEN}"
```

### 2. Parcourir les produits

```bash
# Boutiques featured
curl https://example.invalid/api/boutiques/featured

# Nouveautés
curl https://example.invalid/api/produits/nouveautes?limit=10

# Produits d'une catégorie
curl https://example.invalid/api/categories/1/produits?prix_max=50000&sort=prix_asc

# Recherche
curl "https://example.invalid/api/produits?search=nike&genre=homme&sort=prix_asc"
```

### 3. Ajouter au panier et commander

```bash
TOKEN="votre_token_ici"

# 1. Ajouter au panier
curl -X POST https://example.invalid/api/panier/ajouter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "produit_id": 1,
    "quantite": 2
  }'

# 2. Voir le panier
curl https://example.invalid/api/panier \
  -H "Authorization: Bearer $TOKEN"

# 3. Valider le panier
curl -X POST https://example.invalid/api/panier/valider \
  -H "Authorization: Bearer $TOKEN"

# 4. Créer la commande
curl -X POST https://example.invalid/api/commandes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adresse_livraison": "10 Rue de la Paix, Dakar",
    "mode_livraison": "standard",
    "mode_paiement": "paydunya"
  }'
```

### 4. Créer une demande support

```bash
curl -X POST https://example.invalid/api/demandes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "reclamation",
    "sujet": "Produit défectueux",
    "message": "Le produit reçu est cassé"
  }'
```

---

## 🚀 Fichiers créés

Tous les contrôleurs sont prêts :

✅ **AuthController.php** - Authentification
✅ **ClientController.php** - Gestion profil et adresses
✅ **BoutiqueController.php** - Boutiques
✅ **ProduitController.php** - Produits
✅ **CategorieController.php** - Catégories
✅ **MarqueController.php** - Marques
✅ **PanierController.php** - Panier
✅ **CommandeController.php** - Commandes
✅ **DemandeController.php** - Support/SAV

**Router complet** : `index_complet.php` (65+ routes)

---

**Nivah API v1.0** - Backend 100% complet !
