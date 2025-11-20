import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';

/// Service API de base utilisant Dio
/// Communique avec le backend PHP Nivah
class ApiService {
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Singleton
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(milliseconds: AppConstants.connectionTimeout),
      receiveTimeout: const Duration(milliseconds: AppConstants.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    // Intercepteurs
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Ajouter le token JWT si disponible
          final token = await _storage.read(key: AppConstants.tokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          print('📤 REQUEST: ${options.method} ${options.path}');
          print('📦 DATA: ${options.data}');

          return handler.next(options);
        },
        onResponse: (response, handler) {
          print('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (error, handler) {
          print('❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.path}');
          print('❌ MESSAGE: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  /// GET request
  Future<Response> get(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// POST request
  Future<Response> post(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// PUT request
  Future<Response> put(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// DELETE request
  Future<Response> delete(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Upload de fichiers
  Future<Response> uploadFile(
    String endpoint,
    String filePath, {
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
  }) async {
    try {
      FormData formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(filePath),
        ...?additionalData,
      });

      final response = await _dio.post(
        endpoint,
        data: formData,
      );
      return response;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Gestion des erreurs
  String _handleError(DioException error) {
    String errorMessage = 'Une erreur est survenue';

    if (error.response != null) {
      // Erreur avec réponse du serveur
      final data = error.response!.data;

      if (data is Map<String, dynamic>) {
        errorMessage = data['message'] ?? errorMessage;
      } else if (data is String) {
        errorMessage = data;
      }

      // Erreurs spécifiques selon le code HTTP
      switch (error.response!.statusCode) {
        case 400:
          errorMessage = data['message'] ?? 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non authentifié. Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès interdit';
          break;
        case 404:
          errorMessage = 'Ressource introuvable';
          break;
        case 422:
          // Erreurs de validation
          if (data['errors'] != null) {
            final errors = data['errors'] as Map<String, dynamic>;
            errorMessage = errors.values.first.toString();
          }
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez patienter';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard';
          break;
      }
    } else if (error.type == DioExceptionType.connectionTimeout) {
      errorMessage = 'Délai de connexion dépassé';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      errorMessage = 'Délai de réception dépassé';
    } else if (error.type == DioExceptionType.badResponse) {
      errorMessage = 'Réponse invalide du serveur';
    } else if (error.type == DioExceptionType.cancel) {
      errorMessage = 'Requête annulée';
    } else {
      errorMessage = 'Erreur de connexion. Vérifiez votre internet';
    }

    return errorMessage;
  }

  /// Sauvegarder le token
  Future<void> saveToken(String token) async {
    await _storage.write(key: AppConstants.tokenKey, value: token);
  }

  /// Récupérer le token
  Future<String?> getToken() async {
    return await _storage.read(key: AppConstants.tokenKey);
  }

  /// Supprimer le token (déconnexion)
  Future<void> deleteToken() async {
    await _storage.delete(key: AppConstants.tokenKey);
  }

  /// Vérifier si authentifié
  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }
}
