import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

import '../data/models/user_model.dart';
import '../data/services/auth_service.dart';
import '../core/constants/app_constants.dart';

/// Provider pour gérer l'état d'authentification
class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _user;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;

  // Getters
  UserModel? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Initialiser - Vérifier si l'utilisateur est déjà connecté
  Future<void> initialize() async {
    _setLoading(true);
    try {
      final isAuth = await _authService.isAuthenticated();
      if (isAuth) {
        // Récupérer les données utilisateur stockées
        await _loadUserFromStorage();

        // Rafraîchir les données depuis le serveur
        try {
          _user = await _authService.getMe();
          await _saveUserToStorage(_user!);
          _isAuthenticated = true;
        } catch (e) {
          // Si l'erreur est 401, le token est invalide
          if (e.toString().contains('401') || e.toString().contains('Non authentifié')) {
            await logout();
          }
        }
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  /// Inscription
  Future<bool> register({
    required String nom,
    required String prenom,
    required String email,
    required String motDePasse,
    required String telephone,
    bool newsletterSubscribed = false,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final data = await _authService.register(
        nom: nom,
        prenom: prenom,
        email: email,
        motDePasse: motDePasse,
        telephone: telephone,
        newsletterSubscribed: newsletterSubscribed,
      );

      // L'inscription réussie retourne client_id et email
      // L'utilisateur doit maintenant vérifier son email
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Connexion
  Future<bool> login({
    required String email,
    required String motDePasse,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final data = await _authService.login(
        email: email,
        motDePasse: motDePasse,
      );

      // Extraire les données utilisateur
      _user = UserModel.fromJson(data['client']);
      _isAuthenticated = true;

      // Sauvegarder en local
      await _saveUserToStorage(_user!);

      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Vérification email
  Future<bool> verifyEmail({
    required String email,
    required String code,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      final data = await _authService.verifyEmail(
        email: email,
        code: code,
      );

      // Après vérification, l'utilisateur est automatiquement connecté
      _user = UserModel.fromJson(data['client']);
      _isAuthenticated = true;

      await _saveUserToStorage(_user!);

      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Renvoyer le code de vérification
  Future<bool> resendVerification({required String email}) async {
    _setLoading(true);
    _setError(null);

    try {
      await _authService.resendVerification(email: email);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Mot de passe oublié
  Future<bool> forgotPassword({required String email}) async {
    _setLoading(true);
    _setError(null);

    try {
      await _authService.forgotPassword(email: email);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Réinitialiser le mot de passe
  Future<bool> resetPassword(String email, String code, String newPassword) async {
    _setLoading(true);
    _setError(null);

    try {
      await _authService.resetPassword(
        email: email,
        code: code,
        newPassword: newPassword,
      );
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Rafraîchir le profil utilisateur
  Future<void> refreshUser() async {
    try {
      _user = await _authService.getMe();
      await _saveUserToStorage(_user!);
      notifyListeners();
    } catch (e) {
      print('Erreur rafraîchissement profil: $e');
    }
  }

  /// Déconnexion
  Future<void> logout() async {
    _setLoading(true);

    try {
      await _authService.logout();
    } catch (e) {
      print('Erreur déconnexion: $e');
    } finally {
      _user = null;
      _isAuthenticated = false;
      await _clearUserFromStorage();
      _setLoading(false);
      notifyListeners();
    }
  }

  /// Sauvegarder l'utilisateur en local
  Future<void> _saveUserToStorage(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, json.encode(user.toJson()));
  }

  /// Charger l'utilisateur depuis le stockage local
  Future<void> _loadUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(AppConstants.userKey);

    if (userJson != null) {
      _user = UserModel.fromJson(json.decode(userJson));
      _isAuthenticated = true;
      notifyListeners();
    }
  }

  /// Supprimer les données utilisateur du stockage
  Future<void> _clearUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userKey);
  }

  /// Définir l'état de chargement
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  /// Définir une erreur
  void _setError(String? value) {
    _error = value;
    notifyListeners();
  }

  /// Effacer l'erreur
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
