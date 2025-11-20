import '../../core/constants/app_constants.dart';
import '../models/user_model.dart';
import 'api_service.dart';

/// Service d'authentification
/// Communique avec les endpoints /auth du backend PHP
class AuthService {
  final ApiService _api = ApiService();

  /// Inscription d'un nouveau client
  /// POST /auth/register
  Future<Map<String, dynamic>> register({
    required String nom,
    required String prenom,
    required String email,
    required String motDePasse,
    required String telephone,
    bool newsletterSubscribed = false,
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/register',
      data: {
        'nom': nom,
        'prenom': prenom,
        'email': email,
        'mot_de_passe': motDePasse,
        'telephone': telephone,
        'newsletter_subscribed': newsletterSubscribed ? 1 : 0,
      },
    );

    if (response.data['success'] == true) {
      return response.data['data'];
    } else {
      throw Exception(response.data['message'] ?? 'Erreur lors de l\'inscription');
    }
  }

  /// Connexion
  /// POST /auth/login
  Future<Map<String, dynamic>> login({
    required String email,
    required String motDePasse,
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/login',
      data: {
        'email': email,
        'mot_de_passe': motDePasse,
      },
    );

    if (response.data['success'] == true) {
      final data = response.data['data'];

      // Sauvegarder le token
      if (data['token'] != null) {
        await _api.saveToken(data['token']);
      }

      return data;
    } else {
      throw Exception(response.data['message'] ?? 'Email ou mot de passe incorrect');
    }
  }

  /// Vérification email avec code OTP
  /// POST /auth/verify-email
  Future<Map<String, dynamic>> verifyEmail({
    required String email,
    required String code,
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/verify-email',
      data: {
        'email': email,
        'code': code,
      },
    );

    if (response.data['success'] == true) {
      final data = response.data['data'];

      // Sauvegarder le token (connexion automatique après vérification)
      if (data['token'] != null) {
        await _api.saveToken(data['token']);
      }

      return data;
    } else {
      throw Exception(response.data['message'] ?? 'Code de vérification invalide');
    }
  }

  /// Renvoyer le code de vérification
  /// POST /auth/resend-verification
  Future<void> resendVerification({required String email}) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/resend-verification',
      data: {'email': email},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Erreur lors du renvoi du code');
    }
  }

  /// Mot de passe oublié
  /// POST /auth/forgot-password
  Future<void> forgotPassword({required String email}) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/forgot-password',
      data: {'email': email},
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Erreur lors de la réinitialisation');
    }
  }

  /// Réinitialiser le mot de passe
  /// POST /auth/reset-password
  Future<void> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    final response = await _api.post(
      '${AppConstants.authEndpoint}/reset-password',
      data: {
        'email': email,
        'code': code,
        'mot_de_passe': newPassword,
      },
    );

    if (response.data['success'] != true) {
      throw Exception(response.data['message'] ?? 'Erreur lors de la réinitialisation du mot de passe');
    }
  }

  /// Obtenir le profil de l'utilisateur connecté
  /// GET /auth/me
  Future<UserModel> getMe() async {
    final response = await _api.get('${AppConstants.authEndpoint}/me');

    if (response.data['success'] == true) {
      return UserModel.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Erreur lors de la récupération du profil');
    }
  }

  /// Déconnexion
  /// POST /auth/logout
  Future<void> logout() async {
    try {
      await _api.post('${AppConstants.authEndpoint}/logout');
    } finally {
      // Supprimer le token même si la requête échoue
      await _api.deleteToken();
    }
  }

  /// Vérifier si l'utilisateur est authentifié
  Future<bool> isAuthenticated() async {
    return await _api.isAuthenticated();
  }

  /// Obtenir le token stocké
  Future<String?> getToken() async {
    return await _api.getToken();
  }
}
