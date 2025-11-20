import 'package:flutter/foundation.dart';
import '../data/models/cart_item_model.dart';
import '../data/services/panier_service.dart';

/// Provider pour la gestion du panier
class CartProvider with ChangeNotifier {
  final PanierService _panierService = PanierService();

  // État
  List<CartItemModel> _items = [];
  bool _isLoading = false;
  bool _isSyncing = false;
  String? _error;

  // Totaux
  double _sousTotal = 0.0;
  double _fraisLivraison = 0.0;
  double _total = 0.0;
  int _nombreItems = 0;

  // Getters
  List<CartItemModel> get items => _items;
  bool get isLoading => _isLoading;
  bool get isSyncing => _isSyncing;
  String? get error => _error;

  double get sousTotal => _sousTotal;
  double get fraisLivraison => _fraisLivraison;
  double get total => _total;
  int get nombreItems => _nombreItems;

  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;

  // Setters privés
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setSyncing(bool value) {
    _isSyncing = value;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  /// Récupérer le panier depuis l'API
  Future<void> getPanier() async {
    _setLoading(true);
    _setError(null);

    try {
      _items = await _panierService.getPanier();
      await _calculerTotal();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Ajouter un produit au panier
  Future<bool> ajouterAuPanier({
    required int produitId,
    int quantite = 1,
  }) async {
    _setSyncing(true);
    _setError(null);

    try {
      final item = await _panierService.ajouterAuPanier(
        produitId: produitId,
        quantite: quantite,
      );

      // Mettre à jour la liste locale
      final index = _items.indexWhere((i) => i.produitId == produitId);
      if (index != -1) {
        _items[index] = item;
      } else {
        _items.add(item);
      }

      await _calculerTotal();
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setSyncing(false);
    }
  }

  /// Mettre à jour la quantité d'un item
  Future<bool> updateQuantite({
    required int itemId,
    required int quantite,
  }) async {
    if (quantite <= 0) {
      return await supprimerItem(itemId);
    }

    _setSyncing(true);
    _setError(null);

    try {
      final item = await _panierService.updateQuantite(
        itemId: itemId,
        quantite: quantite,
      );

      // Mettre à jour la liste locale
      final index = _items.indexWhere((i) => i.id == itemId);
      if (index != -1) {
        _items[index] = item;
      }

      await _calculerTotal();
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setSyncing(false);
    }
  }

  /// Incrémenter la quantité d'un item
  Future<bool> incrementerQuantite(int itemId) async {
    final item = _items.firstWhere((i) => i.id == itemId);
    return await updateQuantite(
      itemId: itemId,
      quantite: item.quantite + 1,
    );
  }

  /// Décrémenter la quantité d'un item
  Future<bool> decrementerQuantite(int itemId) async {
    final item = _items.firstWhere((i) => i.id == itemId);
    return await updateQuantite(
      itemId: itemId,
      quantite: item.quantite - 1,
    );
  }

  /// Supprimer un item du panier
  Future<bool> supprimerItem(int itemId) async {
    _setSyncing(true);
    _setError(null);

    try {
      await _panierService.supprimerItem(itemId);

      // Mettre à jour la liste locale
      _items.removeWhere((i) => i.id == itemId);

      await _calculerTotal();
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setSyncing(false);
    }
  }

  /// Vider le panier
  Future<bool> viderPanier() async {
    _setLoading(true);
    _setError(null);

    try {
      await _panierService.viderPanier();

      _items.clear();
      _sousTotal = 0.0;
      _fraisLivraison = 0.0;
      _total = 0.0;
      _nombreItems = 0;

      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Calculer le total du panier
  Future<void> _calculerTotal() async {
    try {
      final result = await _panierService.calculerTotal();
      _sousTotal = result['sousTotal'] as double;
      _fraisLivraison = result['fraisLivraison'] as double;
      _total = result['total'] as double;
      _nombreItems = result['nombreItems'] as int;
    } catch (e) {
      // En cas d'erreur, calculer localement
      _calculerTotalLocal();
    }
  }

  /// Calculer le total localement
  void _calculerTotalLocal() {
    _sousTotal = _items.fold(0.0, (sum, item) => sum + item.montantTotal);
    _nombreItems = _items.fold(0, (sum, item) => sum + item.quantite);

    // Frais de livraison fixes (peut être modifié selon la logique métier)
    _fraisLivraison = _sousTotal > 50000 ? 0.0 : 2000.0;
    _total = _sousTotal + _fraisLivraison;
  }

  /// Vérifier si un produit est dans le panier
  bool contientProduit(int produitId) {
    return _items.any((item) => item.produitId == produitId);
  }

  /// Obtenir la quantité d'un produit dans le panier
  int getQuantiteProduit(int produitId) {
    final item = _items.firstWhere(
      (i) => i.produitId == produitId,
      orElse: () => CartItemModel(
        id: 0,
        clientId: 0,
        produitId: produitId,
        quantite: 0,
        prixUnitaire: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    );
    return item.quantite;
  }

  /// Réinitialiser
  void reset() {
    _items.clear();
    _sousTotal = 0.0;
    _fraisLivraison = 0.0;
    _total = 0.0;
    _nombreItems = 0;
    _isLoading = false;
    _isSyncing = false;
    _error = null;
    notifyListeners();
  }
}
