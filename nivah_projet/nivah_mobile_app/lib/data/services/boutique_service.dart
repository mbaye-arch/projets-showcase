import '../models/boutique_model.dart';
import '../models/produit_model.dart';
import 'api_service.dart';

/// Service API pour les boutiques
class BoutiqueService {
  final ApiService _api = ApiService();

  /// Récupérer toutes les boutiques
  ///
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [actif] - Filtrer par statut actif (optionnel)
  ///
  /// Retourne: Map avec 'boutiques' (List<BoutiqueModel>) et 'pagination'
  Future<Map<String, dynamic>> getBoutiques({
    int page = 1,
    int limit = 20,
    bool? actif,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (actif != null) {
        queryParams['actif'] = actif ? '1' : '0';
      }

      final response = await _api.get('/boutiques', queryParameters: queryParams);

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final boutiques = (data['boutiques'] as List)
            .map((json) => BoutiqueModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'boutiques': boutiques,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des boutiques');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les boutiques en vedette (featured)
  ///
  /// [limit] - Nombre maximum de boutiques (défaut: 10)
  ///
  /// Retourne: List<BoutiqueModel>
  Future<List<BoutiqueModel>> getBoutiquesFeatured({int limit = 10}) async {
    try {
      final response = await _api.get(
        '/boutiques/featured',
        queryParameters: {'limit': limit},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['boutiques'] as List)
            .map((json) => BoutiqueModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des boutiques featured');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer une boutique par son slug
  ///
  /// [slug] - Slug de la boutique
  ///
  /// Retourne: BoutiqueModel
  Future<BoutiqueModel> getBoutiqueBySlug(String slug) async {
    try {
      final response = await _api.get('/boutiques/$slug');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return BoutiqueModel.fromJson(data['boutique'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Boutique non trouvée');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les produits d'une boutique
  ///
  /// [slug] - Slug de la boutique
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [disponible] - Filtrer par disponibilité (optionnel)
  ///
  /// Retourne: Map avec 'produits' (List<ProduitModel>) et 'pagination'
  Future<Map<String, dynamic>> getBoutiqueProduits(
    String slug, {
    int page = 1,
    int limit = 20,
    bool? disponible,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (disponible != null) {
        queryParams['disponible'] = disponible ? '1' : '0';
      }

      final response = await _api.get(
        '/boutiques/$slug/produits',
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

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des produits');
    } catch (e) {
      rethrow;
    }
  }

  /// Rechercher des boutiques
  ///
  /// [query] - Terme de recherche
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  ///
  /// Retourne: Map avec 'boutiques' (List<BoutiqueModel>) et 'pagination'
  Future<Map<String, dynamic>> searchBoutiques(
    String query, {
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _api.get(
        '/boutiques/search',
        queryParameters: {
          'q': query,
          'page': page,
          'limit': limit,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final boutiques = (data['boutiques'] as List)
            .map((json) => BoutiqueModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'boutiques': boutiques,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la recherche');
    } catch (e) {
      rethrow;
    }
  }
}
