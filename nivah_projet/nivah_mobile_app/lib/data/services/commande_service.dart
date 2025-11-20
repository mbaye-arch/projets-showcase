import '../models/commande_model.dart';
import 'api_service.dart';

/// Service API pour les commandes
class CommandeService {
  final ApiService _api = ApiService();

  /// Récupérer toutes les commandes de l'utilisateur
  ///
  /// [page] - Numéro de la page (défaut: 1)
  /// [limit] - Nombre d'items par page (défaut: 20)
  /// [statut] - Filtrer par statut (optionnel)
  ///
  /// Retourne: Map avec 'commandes' (List<CommandeModel>) et 'pagination'
  Future<Map<String, dynamic>> getCommandes({
    int page = 1,
    int limit = 20,
    String? statut,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (statut != null) {
        queryParams['statut'] = statut;
      }

      final response = await _api.get('/commandes', queryParameters: queryParams);

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final commandes = (data['commandes'] as List)
            .map((json) => CommandeModel.fromJson(json as Map<String, dynamic>))
            .toList();

        return {
          'commandes': commandes,
          'pagination': data['pagination'],
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des commandes');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer une commande par son ID
  ///
  /// [commandeId] - ID de la commande
  ///
  /// Retourne: CommandeModel
  Future<CommandeModel> getCommandeById(int commandeId) async {
    try {
      final response = await _api.get('/commandes/$commandeId');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return CommandeModel.fromJson(data['commande'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Commande non trouvée');
    } catch (e) {
      rethrow;
    }
  }

  /// Créer une nouvelle commande
  ///
  /// [adresseLivraison] - Adresse de livraison
  /// [telephoneLivraison] - Téléphone de livraison
  /// [notesLivraison] - Notes pour la livraison (optionnel)
  /// [modePaiement] - Mode de paiement (défaut: 'paydunya')
  ///
  /// Retourne: Map avec 'commande' (CommandeModel) et 'payment_url' (si Paydunya)
  Future<Map<String, dynamic>> creerCommande({
    required String adresseLivraison,
    required String telephoneLivraison,
    String? notesLivraison,
    String modePaiement = 'paydunya',
  }) async {
    try {
      final response = await _api.post(
        '/commandes',
        data: {
          'adresse_livraison': adresseLivraison,
          'telephone_livraison': telephoneLivraison,
          'notes_livraison': notesLivraison,
          'mode_paiement': modePaiement,
        },
      );

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final commande = CommandeModel.fromJson(data['commande'] as Map<String, dynamic>);

        return {
          'commande': commande,
          'payment_url': data['payment_url'] as String?,
          'message': data['message'] as String?,
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la création de la commande');
    } catch (e) {
      rethrow;
    }
  }

  /// Annuler une commande
  ///
  /// [commandeId] - ID de la commande à annuler
  ///
  /// Retourne: CommandeModel (la commande annulée)
  Future<CommandeModel> annulerCommande(int commandeId) async {
    try {
      final response = await _api.post('/commandes/$commandeId/cancel');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return CommandeModel.fromJson(data['commande'] as Map<String, dynamic>);
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de l\'annulation');
    } catch (e) {
      rethrow;
    }
  }

  /// Vérifier le statut de paiement d'une commande
  ///
  /// [commandeId] - ID de la commande
  ///
  /// Retourne: Map avec 'statut_paiement', 'statut_commande', 'transaction_id'
  Future<Map<String, dynamic>> verifierPaiement(int commandeId) async {
    try {
      final response = await _api.get('/commandes/$commandeId/payment-status');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return {
          'statut_paiement': data['statut_paiement'] as String,
          'statut_commande': data['statut_commande'] as String,
          'transaction_id': data['transaction_id'] as String?,
          'message': data['message'] as String?,
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la vérification du paiement');
    } catch (e) {
      rethrow;
    }
  }

  /// Suivre le statut d'une commande (tracking)
  ///
  /// [commandeId] - ID de la commande
  ///
  /// Retourne: Map avec 'commande', 'historique' (timeline des changements de statut)
  Future<Map<String, dynamic>> suivreCommande(int commandeId) async {
    try {
      final response = await _api.get('/commandes/$commandeId/tracking');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        final commande = CommandeModel.fromJson(data['commande'] as Map<String, dynamic>);

        return {
          'commande': commande,
          'historique': data['historique'] as List?,
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors du suivi de la commande');
    } catch (e) {
      rethrow;
    }
  }

  /// Récupérer les statistiques de commandes
  ///
  /// Retourne: Map avec nombre total, en cours, livrées, annulées, montant total
  Future<Map<String, dynamic>> getStatistiques() async {
    try {
      final response = await _api.get('/commandes/stats');

      if (response.data['success'] == true) {
        final data = response.data['data'];
        return {
          'total': data['total'] as int,
          'en_cours': data['en_cours'] as int,
          'livrees': data['livrees'] as int,
          'annulees': data['annulees'] as int,
          'montant_total': double.parse(data['montant_total'].toString()),
        };
      }

      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération des statistiques');
    } catch (e) {
      rethrow;
    }
  }
}
