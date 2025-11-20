import 'package:flutter/foundation.dart';
import '../data/models/produit_model.dart';
import '../data/services/produit_service.dart';

/// Provider pour la gestion des produits
class ProduitProvider with ChangeNotifier {
  final ProduitService _produitService = ProduitService();

  // État
  List<ProduitModel> _produits = [];
  List<ProduitModel> _nouveautes = [];
  List<ProduitModel> _coupsCoeur = [];
  List<ProduitModel> _promotions = [];
  ProduitModel? _produitActif;
  List<ProduitModel> _produitsSimilaires = [];

  bool _isLoading = false;
  bool _isLoadingNouveautes = false;
  bool _isLoadingCoupsCoeur = false;
  bool _isLoadingPromotions = false;
  bool _isLoadingSimilaires = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _totalPages = 1;
  bool _hasMore = true;

  // Filtres
  int? _categorieFilter;
  int? _marqueFilter;
  int? _boutiqueFilter;

  // Getters
  List<ProduitModel> get produits => _produits;
  List<ProduitModel> get nouveautes => _nouveautes;
  List<ProduitModel> get coupsCoeur => _coupsCoeur;
  List<ProduitModel> get promotions => _promotions;
  ProduitModel? get produitActif => _produitActif;
  List<ProduitModel> get produitsSimilaires => _produitsSimilaires;

  bool get isLoading => _isLoading;
  bool get isLoadingNouveautes => _isLoadingNouveautes;
  bool get isLoadingCoupsCoeur => _isLoadingCoupsCoeur;
  bool get isLoadingPromotions => _isLoadingPromotions;
  bool get isLoadingSimilaires => _isLoadingSimilaires;
  String? get error => _error;

  int get currentPage => _currentPage;
  int get totalPages => _totalPages;
  bool get hasMore => _hasMore;

  int? get categorieFilter => _categorieFilter;
  int? get marqueFilter => _marqueFilter;
  int? get boutiqueFilter => _boutiqueFilter;

  // Setters privés
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setLoadingNouveautes(bool value) {
    _isLoadingNouveautes = value;
    notifyListeners();
  }

  void _setLoadingCoupsCoeur(bool value) {
    _isLoadingCoupsCoeur = value;
    notifyListeners();
  }

  void _setLoadingPromotions(bool value) {
    _isLoadingPromotions = value;
    notifyListeners();
  }

  void _setLoadingSimilaires(bool value) {
    _isLoadingSimilaires = value;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  /// Récupérer les produits (avec pagination et filtres)
  Future<void> getProduits({
    bool refresh = false,
    int? categorieId,
    int? marqueId,
    int? boutiqueId,
    bool? disponible,
  }) async {
    if (refresh) {
      _currentPage = 1;
      _produits.clear();
      _hasMore = true;
      _categorieFilter = categorieId;
      _marqueFilter = marqueId;
      _boutiqueFilter = boutiqueId;
    }

    if (!_hasMore || _isLoading) return;

    _setLoading(true);
    _setError(null);

    try {
      final result = await _produitService.getProduits(
        page: _currentPage,
        categorieId: categorieId ?? _categorieFilter,
        marqueId: marqueId ?? _marqueFilter,
        boutiqueId: boutiqueId ?? _boutiqueFilter,
        disponible: disponible,
      );

      final newProduits = result['produits'] as List<ProduitModel>;
      final pagination = result['pagination'] as Map<String, dynamic>;

      if (refresh) {
        _produits = newProduits;
      } else {
        _produits.addAll(newProduits);
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

  /// Charger plus de produits (pagination)
  Future<void> loadMoreProduits() async {
    if (_hasMore && !_isLoading) {
      _currentPage++;
      await getProduits();
    }
  }

  /// Récupérer les nouveautés
  Future<void> getNouveautes({int limit = 20}) async {
    _setLoadingNouveautes(true);
    _setError(null);

    try {
      _nouveautes = await _produitService.getNouveautes(limit: limit);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoadingNouveautes(false);
    }
  }

  /// Récupérer les coups de cœur
  Future<void> getCoupsCoeur({int limit = 20}) async {
    _setLoadingCoupsCoeur(true);
    _setError(null);

    try {
      _coupsCoeur = await _produitService.getCoupsCoeur(limit: limit);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoadingCoupsCoeur(false);
    }
  }

  /// Récupérer les promotions
  Future<void> getPromotions({int limit = 20}) async {
    _setLoadingPromotions(true);
    _setError(null);

    try {
      _promotions = await _produitService.getPromotions(limit: limit);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoadingPromotions(false);
    }
  }

  /// Récupérer un produit par son slug
  Future<ProduitModel?> getProduitBySlug(String slug) async {
    _setLoading(true);
    _setError(null);
    _produitActif = null;
    _produitsSimilaires.clear();

    try {
      _produitActif = await _produitService.getProduitBySlug(slug);
      notifyListeners();

      // Charger automatiquement les produits similaires
      if (_produitActif != null) {
        await getProduitsSimilaires(_produitActif!.id);
      }

      return _produitActif;
    } catch (e) {
      _setError(e.toString());
      return null;
    } finally {
      _setLoading(false);
    }
  }

  /// Récupérer les produits similaires
  Future<void> getProduitsSimilaires(int produitId, {int limit = 10}) async {
    _setLoadingSimilaires(true);

    try {
      _produitsSimilaires = await _produitService.getProduitsSimilaires(
        produitId,
        limit: limit,
      );
      notifyListeners();
    } catch (e) {
      // Ignorer l'erreur pour les similaires (non critique)
      _produitsSimilaires = [];
    } finally {
      _setLoadingSimilaires(false);
    }
  }

  /// Rechercher des produits
  Future<void> searchProduits(
    String query, {
    int? categorieId,
    int? marqueId,
    double? prixMin,
    double? prixMax,
  }) async {
    if (query.trim().isEmpty) {
      await getProduits(refresh: true);
      return;
    }

    _setLoading(true);
    _setError(null);
    _produits.clear();

    try {
      final result = await _produitService.searchProduits(
        query,
        categorieId: categorieId,
        marqueId: marqueId,
        prixMin: prixMin,
        prixMax: prixMax,
      );

      _produits = result['produits'] as List<ProduitModel>;
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Appliquer des filtres
  void applyFilters({
    int? categorieId,
    int? marqueId,
    int? boutiqueId,
  }) {
    _categorieFilter = categorieId;
    _marqueFilter = marqueId;
    _boutiqueFilter = boutiqueId;
    getProduits(refresh: true);
  }

  /// Effacer les filtres
  void clearFilters() {
    _categorieFilter = null;
    _marqueFilter = null;
    _boutiqueFilter = null;
    getProduits(refresh: true);
  }

  /// Réinitialiser
  void reset() {
    _produits.clear();
    _nouveautes.clear();
    _coupsCoeur.clear();
    _promotions.clear();
    _produitActif = null;
    _produitsSimilaires.clear();
    _currentPage = 1;
    _totalPages = 1;
    _hasMore = true;
    _categorieFilter = null;
    _marqueFilter = null;
    _boutiqueFilter = null;
    _isLoading = false;
    _isLoadingNouveautes = false;
    _isLoadingCoupsCoeur = false;
    _isLoadingPromotions = false;
    _isLoadingSimilaires = false;
    _error = null;
    notifyListeners();
  }
}
