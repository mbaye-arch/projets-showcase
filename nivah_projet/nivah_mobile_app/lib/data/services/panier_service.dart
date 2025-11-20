import '../models/cart_item_model.dart';
import 'api_service.dart';

/// Service API pour le panier
class PanierService {
  final ApiService _api = ApiService();

  /// Récupérer le panier de l'utilisateur connecté
  ///
  /// Retourne: List<CartItemModel>
  Future<List<CartItemModel>> getPanier() async {
    try {
      final response = await _api.get('/panier');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return (data['items'] as List)
            .map((json) => CartItemModel.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération du panier');
    } catch (e) {
      rethrow;
    }
  }

  /// Ajouter un produit au panier
  ///
  /// [produitId] - ID du produit
  /// [quantite] - Quantité à ajouter (défaut: 1)
  ///
  /// Retourne: CartItemModel (l'item ajouté ou mis à jour)
  Future<CartItemModel> ajouterAuPanier({
    required int produitId,
    int quantite = 1,
  }) async {
    try {
      final response = await _api.post(
        '/panier/add',
        data: {
          'produit_id': produitId,
          'quantite': quantite,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return CartItemModel.fromJson(data['item'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de l\'ajout au panier');
    } catch (e) {
      rethrow;
    }
  }

  /// Mettre à jour la quantité d'un item du panier
  ///
  /// [itemId] - ID de l'item dans le panier
  /// [quantite] - Nouvelle quantité
  ///
  /// Retourne: CartItemModel (l'item mis à jour)
  Future<CartItemModel> updateQuantite({
    required int itemId,
    required int quantite,
  }) async {
    try {
      if (quantite <= 0) {
        throw Exception('La quantité doit être supérieure à 0');
      }

      final response = await _api.put(
        '/panier/$itemId',
        data: {'quantite': quantite},
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return CartItemModel.fromJson(data['item'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la mise à jour');
    } catch (e) {
      rethrow;
    }
  }

  /// Supprimer un item du panier
  ///
  /// [itemId] - ID de l'item à supprimer
  ///
  /// Retourne: bool (true si suppression réussie)
  Future<bool> supprimerItem(int itemId) async {
    try {
      final response = await _api.delete('/panier/$itemId');

      if (response.data['success'] == true) {
        return true;
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la suppression');
    } catch (e) {
      rethrow;
    }
  }

  /// Vider le panier
  ///
  /// Retourne: bool (true si vidage réussi)
  Future<bool> viderPanier() async {
    try {
      final response = await _api.delete('/panier/clear');

      if (response.data['success'] == true) {
        return true;
      }

      throw Exception(response.data['message'] ?? 'Erreur lors du vidage du panier');
    } catch (e) {
      rethrow;
    }
  }

  /// Calculer le total du panier
  ///
  /// Retourne: Map avec 'total', 'sousTotal', 'fraisLivraison', 'nombreItems'
  Future<Map<String, dynamic>> calculerTotal() async {
    try {
      final response = await _api.get('/panier/total');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return {
          'total': double.parse(data['total'].toString()),
          'sousTotal': double.parse(data['sous_total'].toString()),
          'fraisLivraison': double.parse(data['frais_livraison'].toString()),
          'nombreItems': data['nombre_items'] as int,
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors du calcul du total');
    } catch (e) {
      rethrow;
    }
  }
}
