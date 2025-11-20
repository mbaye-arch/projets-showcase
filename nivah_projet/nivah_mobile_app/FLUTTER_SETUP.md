# 📱 SETUP FLUTTER - NIVAH MOBILE APP

## ✅ CE QUI A ÉTÉ FAIT

### 1. Configuration du Projet

**pubspec.yaml configuré avec 20+ packages:**
- ✅ Provider (State Management)
- ✅ Dio (Networking HTTP)
- ✅ GoRouter (Navigation)
- ✅ FlutterSecureStorage (Stockage sécurisé tokens)
- ✅ GoogleFonts, CachedNetworkImage, Shimmer (UI)
- ✅ EmailValidator, JWT Decoder (Validation & Auth)
- ✅ ConnectivityPlus, ImagePicker, FilePicker (Utilities)

### 2. Architecture Créée

```
lib/
├── core/
│   ├── constants/          # ✅ CRÉÉ
│   │   ├── app_constants.dart   # URLs API, timeouts, limites
│   │   ├── app_colors.dart      # Palette violet (#667EEA), statuts
│   │   └── app_styles.dart      # TextStyles, spacing, shadows
│   ├── config/             # À faire
│   ├── utils/              # À faire
│   └── widgets/            # À faire
├── data/
│   ├── models/             # ✅ CRÉÉ
│   │   ├── user_model.dart      # Modèle Client
│   │   ├── boutique_model.dart  # Modèle Boutique
│   │   └── produit_model.dart   # Modèle Produit
│   ├── repositories/       # À faire
│   └── services/           # À faire
├── providers/              # À faire
├── screens/                # À faire
│   ├── auth/              # Login, Register, Verify
│   ├── home/              # Accueil
│   ├── boutiques/         # Liste & Détails boutiques
│   ├── products/          # Détails produit
│   ├── cart/              # Panier
│   ├── orders/            # Commandes
│   ├── profile/           # Profil
│   └── support/           # Demandes SAV
└── widgets/                # À faire
```

### 3. Constantes Créées

**app_constants.dart:**
- URLs API: `https://api.example.invalid/api`
- Endpoints: auth, boutiques, produits, panier, commandes, demandes
- Limits: pagination (20/page), OTP (6 digits), demandes (5/jour)
- Storage keys: tokens, user data, cart

**app_colors.dart:**
- Palette principale: Dégradé violet (#667EEA → #764BA2)
- Statuts commandes: Jaune (en attente) → Vert (livrée)
- Priorités demandes: Gris (basse) → Rouge (urgente)
- Colors: success, error, warning, info

**app_styles.dart:**
- Typography: H1-H5 (Poppins), Body (Inter)
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Border radius: 8, 12, 16, 24
- Shadows: small, medium, large
- Input decoration factory

### 4. Modèles de Données

**user_model.dart:**
- id, nom, prenom, email, telephone, photo
- emailVerifie, statut, derniereConnexion
- Methods: fromJson, toJson, nomComplet, initiales, copyWith

**boutique_model.dart:**
- id, nom, slug, logo, banniere
- actif, featured, note, nombreAvis
- Methods: fromJson, toJson, copyWith

**produit_model.dart:**
- id, nom, slug, prix, prixPromo, imageUrl
- stock, disponible, nouveaute, coupDeCoeur
- boutique, categorie, marque
- Computed: prixEffectif, pourcentageReduction, enStock
- Methods: fromJson, toJson, copyWith

---

## 🔜 PROCHAINES ÉTAPES

### 5. Services API (À créer)

```dart
lib/data/services/
├── api_service.dart           # Service HTTP de base (Dio)
├── auth_service.dart          # Login, Register, Verify
├── boutique_service.dart      # GET boutiques
├── produit_service.dart       # GET produits
├── panier_service.dart        # Cart CRUD
├── commande_service.dart      # Orders CRUD
└── demande_service.dart       # Support CRUD
```

### 6. Providers (State Management)

```dart
lib/providers/
├── auth_provider.dart         # État authentification
├── boutique_provider.dart     # État boutiques
├── produit_provider.dart      # État produits
├── cart_provider.dart         # État panier
├── commande_provider.dart     # État commandes
└── theme_provider.dart        # Mode sombre
```

### 7. Écrans d'Authentification

```dart
lib/screens/auth/
├── splash_screen.dart         # Logo + animation
├── onboarding_screen.dart     # 3 slides
├── login_screen.dart          # Email + Password
├── register_screen.dart       # Formulaire inscription
├── verify_email_screen.dart   # OTP 6 chiffres
└── forgot_password_screen.dart # Reset password
```

### 8. Écrans Principaux

```dart
lib/screens/
├── home/
│   └── home_screen.dart       # Bannières, catégories, produits
├── boutiques/
│   ├── boutiques_screen.dart  # Liste boutiques
│   └── boutique_detail_screen.dart
├── products/
│   └── product_detail_screen.dart  # Galerie, description, ajout panier
├── cart/
│   ├── cart_screen.dart       # Liste articles
│   └── checkout_screen.dart   # 4 étapes (adresse, livraison, recap, paiement)
├── orders/
│   ├── orders_screen.dart     # Liste commandes
│   └── order_detail_screen.dart # Timeline statuts
├── profile/
│   ├── profile_screen.dart    # Menu profil
│   ├── edit_profile_screen.dart
│   └── addresses_screen.dart
└── support/
    ├── demandes_screen.dart   # Liste demandes
    ├── create_demande_screen.dart
    └── demande_detail_screen.dart
```

### 9. Navigation (GoRouter)

```dart
lib/core/config/
└── app_router.dart            # Routes + guards

Routes:
/                 → SplashScreen
/onboarding       → OnboardingScreen
/login            → LoginScreen
/register         → RegisterScreen
/verify-email     → VerifyEmailScreen
/home             → HomeScreen (Bottom Nav)
/boutiques        → BoutiquesScreen
/boutique/:slug   → BoutiqueDetailScreen
/product/:slug    → ProductDetailScreen
/cart             → CartScreen
/checkout         → CheckoutScreen
/orders           → OrdersScreen
/order/:numero    → OrderDetailScreen
/profile          → ProfileScreen
/demandes         → DemandesScreen
/demande/:numero  → DemandeDetailScreen
```

### 10. Widgets Réutilisables

```dart
lib/widgets/
├── common/
│   ├── custom_app_bar.dart
│   ├── loading_indicator.dart
│   ├── empty_state.dart
│   ├── error_widget.dart
│   └── bottom_nav_bar.dart
├── cards/
│   ├── boutique_card.dart
│   ├── product_card.dart
│   ├── order_card.dart
│   └── demande_card.dart
├── buttons/
│   ├── primary_button.dart
│   ├── secondary_button.dart
│   └── icon_button.dart
└── forms/
    ├── custom_text_field.dart
    ├── password_field.dart
    └── phone_field.dart
```

---

## 🎯 ORDRE DE DÉVELOPPEMENT RECOMMANDÉ

### Phase 1: Foundation (1-2 jours)
1. ✅ Configuration + Architecture
2. ✅ Constantes + Modèles
3. ⏳ Services API (auth, boutiques, produits)
4. ⏳ Providers de base (auth, boutiques)

### Phase 2: Authentification (1-2 jours)
5. ⏳ Splash + Onboarding screens
6. ⏳ Login + Register screens
7. ⏳ Email verification (OTP)
8. ⏳ Forgot password flow

### Phase 3: Core Features (3-4 jours)
9. ⏳ Home screen (bannières, catégories, produits)
10. ⏳ Boutiques (liste + détails)
11. ⏳ Produits (détails + galerie)
12. ⏳ Panier (CRUD)

### Phase 4: Orders & Profile (2-3 jours)
13. ⏳ Checkout flow (4 étapes)
14. ⏳ Commandes (liste + détails + tracking)
15. ⏳ Profil (infos, adresses, paramètres)

### Phase 5: Support & Polish (2-3 jours)
16. ⏳ Demandes SAV (création, liste, détails)
17. ⏳ Upload fichiers (images, PDF)
18. ⏳ Notifications push
19. ⏳ Animations & transitions
20. ⏳ Tests & debugging

---

## 📦 COMMANDES UTILES

```bash
# Installer les dépendances
cd /path/to/nivah-app/nivah_mobile_app
flutter pub get

# Lancer l'app
flutter run

# Build Android APK
flutter build apk --release

# Build iOS
flutter build ios --release

# Générer des icônes
flutter pub run flutter_launcher_icons:main

# Analyser le code
flutter analyze

# Formater le code
dart format lib/
```

---

## 🔗 INTÉGRATION BACKEND

**Base URL:** `https://api.example.invalid/api`

**Headers requis:**
```dart
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}', // Si authentifié
}
```

**Format des réponses:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## 🎨 DESIGN SYSTEM

**Couleurs:**
- Primary: #667EEA (Violet)
- Primary Dark: #764BA2 (Violet foncé)
- Success: #28A745 (Vert)
- Error: #DC3545 (Rouge)
- Warning: #FFC107 (Jaune)

**Fonts:**
- Headings: Poppins (Bold/SemiBold)
- Body: Inter (Regular)

**Spacing:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## 📝 TODO IMMÉDIAT

1. Créer ApiService (Dio avec interceptors)
2. Créer AuthService (login, register, verify)
3. Créer AuthProvider (state management)
4. Créer SplashScreen
5. Créer LoginScreen + RegisterScreen
6. Configurer GoRouter avec routes de base

Veux-tu que je continue avec la création des services API?
