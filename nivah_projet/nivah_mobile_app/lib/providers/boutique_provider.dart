import 'package:flutter/foundation.dart';
import '../data/models/boutique_model.dart';
import '../data/models/produit_model.dart';
import '../data/services/boutique_service.dart';

/// Provider pour la gestion des boutiques
class BoutiqueProvider with ChangeNotifier {
  final BoutiqueService _boutiqueService = BoutiqueService();

  // État
  List<BoutiqueModel> _boutiques = [];
  List<BoutiqueModel> _boutiquesFeatured = [];
  BoutiqueModel? _boutiqueActive;
  List<ProduitModel> _produitsBoutique = [];

  bool _isLoading = false;
  bool _isLoadingFeatured = false;
  bool _isLoadingProduits = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;

  // Getters
  List<BoutiqueModel> get boutiques => _boutiques;
  List<BoutiqueModel> get boutiquesFeatured => _boutiquesFeatured;
  BoutiqueModel? get boutiqueActive => _boutiqueActive;
  List<ProduitModel> get produitsBoutique => _produitsBoutique;

  bool get isLoading => _isLoading;
  bool get isLoadingFeatured => _isLoadingFeatured;
  bool get isLoadingProduits => _isLoadingProduits;
  String? get error => _error;

  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  bool get hasMore => _hasMore;

  // Setters privés
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setLoadingFeatured(bool value) {
    _isLoadingFeatured = value;
    notifyListeners();
  }

  void _setLoadingProduits(bool value) {
    _isLoadingProduits = value;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  /// Récupérer les boutiques (avec pagination)
  Future<void> getBoutiques({
    bool refresh = false,
    bool? actif,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _boutiques.clear();
      _hasMore = true;
    }

    if (!_hasMore || _isLoading) return;

    _setLoading(true);
    _setError(null);

    try {
      final result = await _boutiqueService.getBoutiques(
        page: _currentPage,
        actif: actif,
      );

      final newBoutiques = result['boutiques'] as List<BoutiqueModel>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      if (refresh) {
        _boutiques = newBoutiques;
      } else {
        _boutiques.addAll(newBoutiques);
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

  /// Charger plus de boutiques (pagination)
  Future<void> loadMoreBoutiques() async {
    if (_hasMore && !_isLoading) {
      _currentPage++;
      await getBoutiques();
    }
  }

  /// Récupérer les boutiques en vedette
  Future<void> getBoutiquesFeatured({int limit = 10}) async {
    _setLoadingFeatured(true);
    _setError(null);

    try {
      _boutiquesFeatured = await _boutiqueService.getBoutiquesFeatured(limit: limit);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoadingFeatured(false);
    }
  }

  /// Récupérer une boutique par son slug
  Future<void> getBoutiqueBySlug(String slug) async {
    _setLoading(true);
    _setError(null);
    _boutiqueActive = null;
    _produitsBoutique.clear();

    try {
      _boutiqueActive = await _boutiqueService.getBoutiqueBySlug(slug);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Récupérer les produits d'une boutique
  Future<void> getBoutiqueProduits(
    String slug, {
    bool refresh = false,
    bool? disponible,
  }) async {
    if (refresh) {
      _produitsBoutique.clear();
    }

    _setLoadingProduits(true);
    _setError(null);

    try {
      final result = await _boutiqueService.getBoutiqueProduits(
        slug,
        disponible: disponible,
      );

      _produitsBoutique = result['produits'] as List<ProduitModel>;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoadingProduits(false);
    }
  }

  /// Rechercher des boutiques
  Future<void> searchBoutiques(String query) async {
    if (query.trim().isEmpty) {
      await getBoutiques(refresh: true);
      return;
    }

    _setLoading(true);
    _setError(null);
    _boutiques.clear();

    try {
      final result = await _boutiqueService.searchBoutiques(query);
      _boutiques = result['boutiques'] as List<BoutiqueModel>;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Réinitialiser
  void reset() {
    _boutiques.clear();
    _boutiquesFeatured.clear();
    _boutiqueActive = null;
    _produitsBoutique.clear();
    _currentPage = 1;
    _totalPages = 1;
    _hasMore = true;
    _isLoading = false;
    _isLoadingFeatured = false;
    _isLoadingProduits = false;
    _error = null;
    notifyListeners();
  }
}
