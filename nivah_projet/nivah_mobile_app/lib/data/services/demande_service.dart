import 'dart:io';
import '../models/demande_model.dart';
import 'api_service.dart';

/// Service API pour les demandes de support
class DemandeService {
  final ApiService _api = ApiService();

  /// Récupérer toutes les demandes de l'utilisateur
  ///
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [statut] - Filtrer par statut (optionnel)
  /// [type] - Filtrer par type (optionnel)
  ///
  /// Retourne: Map avec 'demandes' (List<DemandeModel>) et 'pagination'
  Future<Map<String, dynamic>> getDemandes({
    int page = 1,
    int limit = 20,
    String? statut,
    String? type,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (statut != null) queryParams['statut'] = statut;
      if (type != null) queryParams['type'] = type;

      final response = await _api.get('/demandes', queryParameters: queryParams);

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final demandes = (data['demandes'] as List)
            .map((json) => DemandeModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'demandes': demandes,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des demandes');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer une demande par son ID
  ///
  /// [demandeId] - ID de la demande
  ///
  /// Retourne: DemandeModel
  Future<DemandeModel> getDemandeById(int demandeId) async {
    try {
      final response = await _api.get('/demandes/$demandeId');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return DemandeModel.fromJson(data['demande'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Demande non trouvée');
    } catch (e) {
      rethrow;
    }
  }

  /// Créer une nouvelle demande de support
  ///
  /// [type] - Type de demande (question, reclamation, suggestion, probleme_technique, autre)
  /// [sujet] - Sujet de la demande
  /// [description] - Description détaillée
  /// [pieceJointe] - Fichier joint (optionnel)
  ///
  /// Retourne: DemandeModel (la demande créée)
  Future<DemandeModel> creerDemande({
    required String type,
    required String sujet,
    required String description,
    File? pieceJointe,
  }) async {
    try {
      // Vérifier les types valides
      final typesValides = [
        'question',
        'reclamation',
        'suggestion',
        'probleme_technique',
        'autre'
      ];

      if (!typesValides.contains(type)) {
        throw Exception('Type de demande invalide');
      }

      // Préparer les données
      final data = {
        'type': type,
        'sujet': sujet,
        'description': description,
      };

      // Si une pièce jointe est fournie, utiliser uploadFile
      if (pieceJointe != null) {
        final response = await _api.uploadFile(
          '/demandes',
          pieceJointe.path,
          fieldName: 'piece_jointe',
          additionalData: data,
        );

        if (response.data['success'] == true) {
          final responseData = response.data['data'];
          return DemandeModel.fromJson(responseData['demande'] as Map<String, dynamic>);
        }

        throw Exception(response.data['message'] ?? 'Erreur lors de la création de la demande');
      } else {
        // Sinon, simple POST
        final response = await _api.post('/demandes', data: data);

        if (response.data['success'] == true) {
          final responseData = response.data['data'];
          return DemandeModel.fromJson(responseData['demande'] as Map<String, dynamic>);
        }

        throw Exception(response.data['message'] ?? 'Erreur lors de la création de la demande');
      }
    } catch (e) {
      rethrow;
    }
  }

  /// Mettre à jour une demande
  ///
  /// [demandeId] - ID de la demande à mettre à jour
  /// [sujet] - Nouveau sujet (optionnel)
  /// [description] - Nouvelle description (optionnel)
  ///
  /// Retourne: DemandeModel (la demande mise à jour)
  Future<DemandeModel> updateDemande(
    int demandeId, {
    String? sujet,
    String? description,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (sujet != null) data['sujet'] = sujet;
      if (description != null) data['description'] = description;

      if (data.isEmpty) {
        throw Exception('Aucune donnée à mettre à jour');
      }

      final response = await _api.put('/demandes/$demandeId', data: data);

      if (response.data['success'] == true) {
        final responseData = response.data['data'];
        return DemandeModel.fromJson(responseData['demande'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la mise à jour');
    } catch (e) {
      rethrow;
    }
  }

  /// Fermer une demande
  ///
  /// [demandeId] - ID de la demande à fermer
  ///
  /// Retourne: DemandeModel (la demande fermée)
  Future<DemandeModel> fermerDemande(int demandeId) async {
    try {
      final response = await _api.post('/demandes/$demandeId/close');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return DemandeModel.fromJson(data['demande'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la fermeture');
    } catch (e) {
      rethrow;
    }
  }

  /// Supprimer une demande
  ///
  /// [demandeId] - ID de la demande à supprimer
  ///
  /// Retourne: bool (true si suppression réussie)
  Future<bool> supprimerDemande(int demandeId) async {
    try {
      final response = await _api.delete('/demandes/$demandeId');

      if (response.data['success'] == true) {
        return true;
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la suppression');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les statistiques des demandes
  ///
  /// Retourne: Map avec nombre total, ouvertes, en_cours, fermées
  Future<Map<String, dynamic>> getStatistiques() async {
    try {
      final response = await _api.get('/demandes/stats');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return {
          'total': data['total'] as int,
          'ouvertes': data['ouvertes'] as int,
          'en_cours': data['en_cours'] as int,
          'fermees': data['fermees'] as int,
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des statistiques');
    } catch (e) {
      rethrow;
    }
  }
}
