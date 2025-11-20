# 📋 Module Demandes Clients - Support & SAV

## 📖 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Endpoints API](#endpoints-api)
5. [Modèles de données](#modèles-de-données)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Intégration Flutter](#intégration-flutter)
8. [Règles métier](#règles-métier)
9. [Tests](#tests)

---

## 🎯 Vue d'ensemble

Le module **Demandes Clients** permet aux utilisateurs de l'application Nivah de :
- Créer des demandes de support (réclamations, questions, remboursements)
- Communiquer avec le service client via un système de messagerie
- Upload des fichiers (photos, PDF)
- Suivre l'évolution de leurs demandes en temps réel
- Recevoir des notifications push

### Types de demandes supportés

| Type | Description | Priorité par défaut | SLA |
|------|-------------|-------------------|-----|
| 🆘 Support technique | Bugs, erreurs, problèmes connexion | Haute | 24-48h |
| 📢 Réclamation | Produit défectueux, service insatisfaisant | Haute | 24-48h |
| ❓ Question produit | Disponibilité, caractéristiques | Normale | 3-5 jours |
| 🚚 Question livraison | Suivi, adresse, délais | Normale | 3-5 jours |
| 💰 Remboursement | Demande de remboursement | Urgente | < 24h |
| 🔄 Retour/Échange | Retour ou échange produit | Haute | 24-48h |
| 📝 Autre | Toute autre demande | Basse | 7-14 jours |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│          Application Flutter (Client)           │
│  Écrans: Liste demandes, Détail, Création      │
└───────────────────┬─────────────────────────────┘
                    │
                    │ API REST (HTTPS + JWT)
                    │
┌───────────────────▼─────────────────────────────┐
│           Backend Laravel/Node.js               │
│  Controllers, Services, Validators              │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│              Base de données MySQL              │
│  - demandes_clients                             │
│  - demandes_messages                            │
│  - demandes_pieces_jointes                      │
└─────────────────────────────────────────────────┘
```

---

## 💾 Installation

### 1. Création des tables

Exécutez le script SQL fourni :

```bash
mysql -u votre_utilisateur -p nom_base_de_donnees < database_demandes_clients.sql
```

### 2. Vérification

```sql
-- Vérifier que les colonnes ont été ajoutées
DESCRIBE demandes_clients;

-- Devrait afficher les nouvelles colonnes :
-- numero, produit_id, sla_premiere_reponse, sla_resolution,
-- temps_premiere_reponse, temps_resolution, satisfaction_note, satisfaction_commentaire
```

### 3. Vérifier les triggers

```sql
SHOW TRIGGERS WHERE `Table` = 'demandes_clients';
```

---

## 🔌 Endpoints API

### 📋 Lister les demandes du client

```http
GET /api/demandes
Authorization: Bearer {token}
```

**Query Parameters:**
- `statut` (optionnel) : `nouveau`, `en_attente`, `en_cours`, `resolu`, `clos`, `annule`
- `type` (optionnel) : `support`, `reclamation`, `question_produit`, etc.
- `page` (optionnel, défaut: 1)
- `limit` (optionnel, défaut: 20)

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "numero": "DEM-20251222-000001",
      "type": "reclamation",
      "type_label": "Réclamation",
      "sujet": "Produit reçu endommagé",
      "statut": "en_cours",
      "statut_label": "En cours de traitement",
      "priorite": "haute",
      "messages_non_lus": 2,
      "created_at": "2025-12-22 10:30:00",
      "updated_at": "2025-12-22 14:15:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45
  }
}
```

---

### ➕ Créer une nouvelle demande

```http
POST /api/demandes
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "type": "reclamation",
  "sujet": "Produit reçu cassé",
  "message": "J'ai reçu mon colis aujourd'hui mais le produit est cassé...",
  "commande_numero": "CMD-20251220-000123",
  "produit_id": 456,
  "priorite": "haute",
  "pieces_jointes": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ]
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Demande créée avec succès",
  "data": {
    "numero": "DEM-20251222-000001",
    "statut": "en_attente",
    "sla_premiere_reponse": "2025-12-23 10:30:00"
  }
}
```

**Erreurs possibles:**
- `400` : Données invalides
- `429` : Limite de 5 demandes/jour atteinte
- `401` : Non authentifié

---

### 🔍 Détails d'une demande

```http
GET /api/demandes/{numero}
Authorization: Bearer {token}
```

**Exemple:** `GET /api/demandes/DEM-20251222-000001`

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "numero": "DEM-20251222-000001",
    "type": "reclamation",
    "sujet": "Produit reçu endommagé",
    "statut": "en_cours",
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
        "message": "Nous sommes désolés. Nous procédons à un échange...",
        "created_at": "2025-12-22 14:15:00"
      }
    ],
    "temps_ecoule": "3h45min",
    "sla_respecte": true,
    "created_at": "2025-12-22 10:30:00"
  }
}
```

---

### 💬 Ajouter un message

```http
POST /api/demandes/{id}/messages
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Quand vais-je recevoir le nouveau produit ?",
  "pieces_jointes": []
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Message ajouté",
  "data": {
    "id": 3,
    "created_at": "2025-12-23 09:00:00"
  }
}
```

---

### 📎 Upload fichier

```http
POST /api/demandes/{id}/pieces-jointes
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
- `fichier`: Le fichier (5MB max)
- `message_id` (optionnel): ID du message associé

**Types acceptés:** JPG, PNG, PDF, HEIC

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "produit_casse.jpg",
    "url": "https://cdn.nivah.com/demandes/1/produit_casse.jpg",
    "taille": 2457600
  }
}
```

---

### ❌ Annuler une demande

```http
PUT /api/demandes/{id}/annuler
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "raison": "Problème résolu par moi-même"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Demande annulée"
}
```

---

### 📊 Statistiques personnelles

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
    "temps_moyen_reponse": "4h30min",
    "taux_satisfaction": 4.5
  }
}
```

---

## 📦 Modèles de données

### Table: demandes_clients

| Colonne | Type | Description |
|---------|------|-------------|
| id | INT | Clé primaire |
| numero | VARCHAR(50) | Numéro unique (DEM-YYYYMMDD-XXXXXX) |
| client_id | INT | FK → clients.id |
| type | ENUM | Type de demande |
| sujet | VARCHAR(200) | Titre court |
| message | TEXT | Message initial |
| commande_id | INT | FK → commandes.id (optionnel) |
| produit_id | INT | FK → produits.id (optionnel) |
| statut | ENUM | Statut actuel |
| priorite | ENUM | Niveau de priorité |
| sla_premiere_reponse | DATETIME | Date limite 1ère réponse |
| sla_resolution | DATETIME | Date limite résolution |
| temps_premiere_reponse | INT | Temps en minutes |
| temps_resolution | INT | Temps en minutes |
| satisfaction_note | TINYINT | Note /5 |
| satisfaction_commentaire | TEXT | Commentaire satisfaction |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

### Colonnes ajoutées à demandes_clients

Les colonnes suivantes sont ajoutées à la table existante `demandes_clients`:

| Colonne | Type | Description |
|---------|------|-------------|
| numero | VARCHAR(50) | Numéro unique (DEM-YYYYMMDD-XXXXXX) |
| produit_id | INT | FK → produits.id (optionnel) |
| sla_premiere_reponse | DATETIME | Date limite première réponse |
| sla_resolution | DATETIME | Date limite résolution |
| temps_premiere_reponse | INT | Temps en minutes |
| temps_resolution | INT | Temps en minutes |
| satisfaction_note | TINYINT | Note /5 après résolution |
| satisfaction_commentaire | TEXT | Commentaire satisfaction |

**Note:** Pour la messagerie et les pièces jointes, elles sont stockées dans les colonnes existantes de la table `demandes_clients` (message initial, réponses via système externe, ou fichiers en base64/URL dans champs JSON).

---

## 🔐 Règles métier

### Limites et restrictions

1. **Limite de création** : 5 demandes maximum par jour et par client
2. **Taille fichiers** : 5 MB maximum par fichier
3. **Nombre fichiers** : 5 fichiers maximum par demande
4. **Types fichiers** : JPG, PNG, PDF, HEIC uniquement
5. **Auto-fermeture** : Demandes en attente client > 15 jours automatiquement fermées

### Workflow des statuts

```
nouveau
  ↓
en_attente (file d'attente)
  ↓
en_cours (pris en charge)
  ↓
en_attente_client (réponse fournie)
  ↓ (optionnel: boucle si client répond)
en_cours
  ↓
resolu
  ↓
clos
```

### SLA (Service Level Agreement)

| Priorité | Première réponse | Résolution |
|----------|-----------------|------------|
| Urgente | < 24h | < 1 jour |
| Haute | < 48h | < 2 jours |
| Normale | < 5 jours | < 5 jours |
| Basse | < 7 jours | < 14 jours |

### Sécurité

- ✅ Client voit uniquement ses propres demandes
- ✅ Validation JWT sur tous les endpoints
- ✅ Rate limiting : 20 requêtes/minute
- ✅ Scan antivirus des fichiers uploadés
- ✅ Sanitisation des inputs (XSS, SQL injection)
- ✅ URLs signées pour les fichiers (expiration 24h)

---

## 📱 Intégration Flutter

### Modèle Dart

```dart
class Demande {
  final int id;
  final String numero;
  final String type;
  final String typeLabel;
  final String sujet;
  final String statut;
  final String statutLabel;
  final String priorite;
  final int messagesNonLus;
  final DateTime createdAt;
  final DateTime updatedAt;

  Demande({
    required this.id,
    required this.numero,
    required this.type,
    required this.typeLabel,
    required this.sujet,
    required this.statut,
    required this.statutLabel,
    required this.priorite,
    required this.messagesNonLus,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Demande.fromJson(Map<String, dynamic> json) {
    return Demande(
      id: json['id'],
      numero: json['numero'],
      type: json['type'],
      typeLabel: json['type_label'],
      sujet: json['sujet'],
      statut: json['statut'],
      statutLabel: json['statut_label'],
      priorite: json['priorite'],
      messagesNonLus: json['messages_non_lus'] ?? 0,
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}
```

### Service API

```dart
class DemandeService {
  final Dio _dio;

  DemandeService(this._dio);

  Future<List<Demande>> getMesDemandes({String? statut}) async {
    try {
      final response = await _dio.get(
        '/api/demandes',
        queryParameters: statut != null ? {'statut': statut} : null,
      );

      return (response.data['data'] as List)
          .map((json) => Demande.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Erreur lors du chargement des demandes');
    }
  }

  Future<Demande> creerDemande({
    required String type,
    required String sujet,
    required String message,
    String? commandeNumero,
    int? produitId,
    List<File>? piecesJointes,
  }) async {
    try {
      final formData = FormData.fromMap({
        'type': type,
        'sujet': sujet,
        'message': message,
        if (commandeNumero != null) 'commande_numero': commandeNumero,
        if (produitId != null) 'produit_id': produitId,
      });

      if (piecesJointes != null) {
        for (var file in piecesJointes) {
          formData.files.add(MapEntry(
            'pieces_jointes[]',
            await MultipartFile.fromFile(file.path),
          ));
        }
      }

      final response = await _dio.post('/api/demandes', data: formData);
      return Demande.fromJson(response.data['data']);
    } catch (e) {
      throw Exception('Erreur lors de la création de la demande');
    }
  }

  Future<DemandeDetail> getDemandeDetail(String numero) async {
    try {
      final response = await _dio.get('/api/demandes/$numero');
      return DemandeDetail.fromJson(response.data['data']);
    } catch (e) {
      throw Exception('Erreur lors du chargement des détails');
    }
  }
}
```

---

## 🧪 Tests

### Tests unitaires (Backend)

```php
// Laravel Example
public function test_client_peut_creer_demande()
{
    $client = Client::factory()->create();
    $this->actingAs($client, 'api');

    $response = $this->postJson('/api/demandes', [
        'type' => 'support',
        'sujet' => 'Test demande',
        'message' => 'Ceci est un test',
        'priorite' => 'normale',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'success',
            'data' => ['numero', 'statut'],
        ]);

    $this->assertDatabaseHas('demandes_clients', [
        'client_id' => $client->id,
        'sujet' => 'Test demande',
    ]);
}

public function test_limite_5_demandes_par_jour()
{
    $client = Client::factory()->create();
    $this->actingAs($client, 'api');

    // Créer 5 demandes
    for ($i = 0; $i < 5; $i++) {
        Demande::factory()->create(['client_id' => $client->id]);
    }

    // La 6ème doit échouer
    $response = $this->postJson('/api/demandes', [
        'type' => 'support',
        'sujet' => '6ème demande',
        'message' => 'Devrait échouer',
    ]);

    $response->assertStatus(429); // Too Many Requests
}
```

### Tests d'intégration (Flutter)

```dart
void main() {
  group('DemandeService', () {
    late DemandeService service;
    late Dio mockDio;

    setUp(() {
      mockDio = MockDio();
      service = DemandeService(mockDio);
    });

    test('getMesDemandes retourne liste de demandes', () async {
      when(mockDio.get('/api/demandes'))
          .thenAnswer((_) async => Response(
                data: {
                  'success': true,
                  'data': [
                    {
                      'id': 1,
                      'numero': 'DEM-20251222-000001',
                      'type': 'support',
                      'sujet': 'Test',
                      // ...
                    }
                  ],
                },
                statusCode: 200,
              ));

      final demandes = await service.getMesDemandes();

      expect(demandes, isA<List<Demande>>());
      expect(demandes.length, 1);
      expect(demandes[0].numero, 'DEM-20251222-000001');
    });
  });
}
```

---

## 📝 Changelog

### Version 1.0 (22 Décembre 2025)
- ✅ Création module complet demandes clients
- ✅ Endpoints API CRUD
- ✅ Système de messagerie
- ✅ Upload fichiers
- ✅ Triggers auto-génération numéro
- ✅ Calcul SLA automatique
- ✅ Procédures stockées

---

## 📞 Support

Pour toute question ou problème :
- **Email :** dev@example.invalid
- **Documentation :** [CAHIER_DES_CHARGES_NIVAH.md](./CAHIER_DES_CHARGES_NIVAH.md)

---

**Nivah - Module Demandes Clients v1.0**
