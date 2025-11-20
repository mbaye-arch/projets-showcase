import 'package:flutter/foundation.dart';
import '../data/models/commande_model.dart';
import '../data/services/commande_service.dart';

/// Provider pour la gestion des commandes
class CommandeProvider with ChangeNotifier {
  final CommandeService _commandeService = CommandeService();

  // État
  List<CommandeModel> _commandes = [];
  CommandeModel? _commandeActive;
  Map<String, dynamic>? _trackingInfo;

  bool _isLoading = false;
  bool _isCreating = false;
  bool _isCancelling = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;

  // Statistiques
  int _totalCommandes = 0;
  int _commandesEnCours = 0;
  int _commandesLivrees = 0;
  int _commandesAnnulees = 0;
  double _montantTotal = 0.0;

  // Getters
  List<CommandeModel> get commandes => _commandes;
  CommandeModel? get commandeActive => _commandeActive;
  Map<String, dynamic>? get trackingInfo => _trackingInfo;

  bool get isLoading => _isLoading;
  bool get isCreating => _isCreating;
  bool get isCancelling => _isCancelling;
  String? get error => _error;

  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  bool get hasMore => _hasMore;

  int get totalCommandes => _totalCommandes;
  int get commandesEnCours => _commandesEnCours;
  int get commandesLivrees => _commandesLivrees;
  int get commandesAnnulees => _commandesAnnulees;
  double get montantTotal => _montantTotal;

  // Setters privés
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setCreating(bool value) {
    _isCreating = value;
    notifyListeners();
  }

  void _setCancelling(bool value) {
    _isCancelling = value;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  /// Récupérer les commandes (avec pagination)
  Future<void> getCommandes({
    bool refresh = false,
    String? statut,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _commandes.clear();
      _hasMore = true;
    }

    if (!_hasMore || _isLoading) return;

    _setLoading(true);
    _setError(null);

    try {
      final result = await _commandeService.getCommandes(
        page: _currentPage,
        statut: statut,
      );

      final newCommandes = result['commandes'] as List<CommandeModel>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      if (refresh) {
        _commandes = newCommandes;
      } else {
        _commandes.addAll(newCommandes);
      }

      _currentPage = pagination['current_page'] as int;
      _totalPages = pagination['total_pages'] as int;
      _hasMore = _currentPage < _totalPages;

      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Charger plus de commandes (pagination)
  Future<void> loadMoreCommandes() async {
    if (_hasMore && !_isLoading) {
      _currentPage++;
      await getCommandes();
    }
  }

  /// Récupérer une commande par son ID
  Future<void> getCommandeById(int commandeId) async {
    _setLoading(true);
    _setError(null);
    _commandeActive = null;

    try {
      _commandeActive = await _commandeService.getCommandeById(commandeId);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Créer une nouvelle commande
  ///
  /// Retourne: Map avec 'commande' et 'payment_url' (si Paydunya)
  Future<Map<String, dynamic>?> creerCommande({
    required String adresseLivraison,
    required String telephoneLivraison,
    String? notesLivraison,
    String modePaiement = 'paydunya',
  }) async {
    _setCreating(true);
    _setError(null);

    try {
      final result = await _commandeService.creerCommande(
        adresseLivraison: adresseLivraison,
        telephoneLivraison: telephoneLivraison,
        notesLivraison: notesLivraison,
        modePaiement: modePaiement,
      );

      _commandeActive = result['commande'] as CommandeModel;

      // Ajouter à la liste locale
      _commandes.insert(0, _commandeActive!);

      notifyListeners();
      return result;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setCreating(false);
    }
  }

  /// Annuler une commande
  Future<bool> annulerCommande(int commandeId) async {
    _setCancelling(true);
    _setError(null);

    try {
      final commande = await _commandeService.annulerCommande(commandeId);

      // Mettre à jour la liste locale
      final index = _commandes.indexWhere((c) => c.id == commandeId);
      if (index != -1) {
        _commandes[index] = commande;
      }

      // Mettre à jour la commande active si c'est celle-ci
      if (_commandeActive?.id == commandeId) {
        _commandeActive = commande;
      }

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setCancelling(false);
    }
  }

  /// Vérifier le statut de paiement
  Future<Map<String, dynamic>?> verifierPaiement(int commandeId) async {
    try {
      final result = await _commandeService.verifierPaiement(commandeId);

      // Mettre à jour la commande active si nécessaire
      if (_commandeActive?.id == commandeId) {
        await getCommandeById(commandeId);
      }

      return result;
    } catch (e) {
      _setError(e.toString());
      return null;
    }
  }

  /// Suivre une commande (tracking)
  Future<void> suivreCommande(int commandeId) async {
    _setLoading(true);
    _setError(null);

    try {
      _trackingInfo = await _commandeService.suivreCommande(commandeId);
      _commandeActive = _trackingInfo!['commande'] as CommandeModel;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Récupérer les statistiques
  Future<void> getStatistiques() async {
    try {
      final stats = await _commandeService.getStatistiques();
      _totalCommandes = stats['total'] as int;
      _commandesEnCours = stats['en_cours'] as int;
      _commandesLivrees = stats['livrees'] as int;
      _commandesAnnulees = stats['annulees'] as int;
      _montantTotal = stats['montant_total'] as double;
      notifyListeners();
    } catch (e) {
      // Ignorer les erreurs pour les stats (non critique)
    }
  }

  /// Filtrer les commandes par statut
  List<CommandeModel> getCommandesByStatut(String statut) {
    return _commandes.where((c) => c.statut == statut).toList();
  }

  /// Réinitialiser
  void reset() {
    _commandes.clear();
    _commandeActive = null;
    _trackingInfo = null;
    _currentPage = 1;
    _totalPages = 1;
    _hasMore = true;
    _totalCommandes = 0;
    _commandesEnCours = 0;
    _commandesLivrees = 0;
    _commandesAnnulees = 0;
    _montantTotal = 0.0;
    _isLoading = false;
    _isCreating = false;
    _isCancelling = false;
    _error = null;
    notifyListeners();
  }
}
