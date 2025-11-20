import '../models/produit_model.dart';
import 'api_service.dart';

/// Service API pour les produits
class ProduitService {
  final ApiService _api = ApiService();

  /// Récupérer tous les produits
  ///
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [categorieId] - Filtrer par catégorie (optionnel)
  /// [marqueId] - Filtrer par marque (optionnel)
  /// [boutiqueId] - Filtrer par boutique (optionnel)
  /// [disponible] - Filtrer par disponibilité (optionnel)
  ///
  /// Retourne: Map avec 'produits' (List<ProduitModel>) et 'pagination'
  Future<Map<String, dynamic>> getProduits({
    int page = 1,
    int limit = 20,
    int? categorieId,
    int? marqueId,
    int? boutiqueId,
    bool? disponible,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (categorieId != null) queryParams['categorie_id'] = categorieId;
      if (marqueId != null) queryParams['marque_id'] = marqueId;
      if (boutiqueId != null) queryParams['boutique_id'] = boutiqueId;
      if (disponible != null) queryParams['disponible'] = disponible ? '1' : '0';

      final response = await _api.get('/produits', queryParameters: queryParams);

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final produits = (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'produits': produits,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des produits');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les nouveautés
  ///
  /// [limit] - Nombre maximum de produits (défaut: 20)
  ///
  /// Retourne: List<ProduitModel>
  Future<List<ProduitModel>> getNouveautes({int limit = 20}) async {
    try {
      final response = await _api.get(
        '/produits/nouveautes',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des nouveautés');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les coups de cœur
  ///
  /// [limit] - Nombre maximum de produits (défaut: 20)
  ///
  /// Retourne: List<ProduitModel>
  Future<List<ProduitModel>> getCoupsCoeur({int limit = 20}) async {
    try {
      final response = await _api.get(
        '/produits/coups-de-coeur',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des coups de cœur');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les produits en promotion
  ///
  /// [limit] - Nombre maximum de produits (défaut: 20)
  ///
  /// Retourne: List<ProduitModel>
  Future<List<ProduitModel>> getPromotions({int limit = 20}) async {
    try {
      final response = await _api.get(
        '/produits/promotions',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des promotions');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer un produit par son slug
  ///
  /// [slug] - Slug du produit
  ///
  /// Retourne: ProduitModel
  Future<ProduitModel> getProduitBySlug(String slug) async {
    try {
      final response = await _api.get('/produits/$slug');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return ProduitModel.fromJson(data['produit'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Produit non trouvé');
    } catch (e) {
      rethrow;
    }
  }

  /// Rechercher des produits
  ///
  /// [query] - Terme de recherche
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [categorieId] - Filtrer par catégorie (optionnel)
  /// [marqueId] - Filtrer par marque (optionnel)
  /// [prixMin] - Prix minimum (optionnel)
  /// [prixMax] - Prix maximum (optionnel)
  ///
  /// Retourne: Map avec 'produits' (List<ProduitModel>) et 'pagination'
  Future<Map<String, dynamic>> searchProduits(
    String query, {
    int page = 1,
    int limit = 20,
    int? categorieId,
    int? marqueId,
    double? prixMin,
    double? prixMax,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'q': query,
        'page': page,
        'limit': limit,
      };

      if (categorieId != null) queryParams['categorie_id'] = categorieId;
      if (marqueId != null) queryParams['marque_id'] = marqueId;
      if (prixMin != null) queryParams['prix_min'] = prixMin;
      if (prixMax != null) queryParams['prix_max'] = prixMax;

      final response = await _api.get(
        '/produits/search',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final produits = (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'produits': produits,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la recherche');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les produits similaires
  ///
  /// [produitId] - ID du produit de référence
  /// [limit] - Nombre maximum de produits (défaut: 10)
  ///
  /// Retourne: List<ProduitModel>
  Future<List<ProduitModel>> getProduitsSimilaires(
    int produitId, {
    int limit = 10,
  }) async {
    try {
      final response = await _api.get(
        '/produits/$produitId/similaires',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['produits'] as List)
            .map((json) => ProduitModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des produits similaires');
    } catch (e) {
      rethrow;
    }
  }
}
