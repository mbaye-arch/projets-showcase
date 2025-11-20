/// Constantes de l'application Nivah
class AppConstants {
  // Informations de l'app
  static const String appName = 'Nivah';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Marketplace Multi-Boutiques';

  // URLs API locales
  //
  // En web/desktop local: --dart-define=NIVAH_API_BASE_URL=http://127.0.0.1:8090/api
  // En émulateur Android: --dart-define=NIVAH_API_BASE_URL=http://10.0.2.2:8090/api
  static const String apiBaseUrl = String.fromEnvironment(
    'NIVAH_API_BASE_URL',
    defaultValue: 'http://127.0.0.1:8090/api',
  );

  // Endpoints
  static const String authEndpoint = '/auth';
  static const String boutiquesEndpoint = '/boutiques';
  static const String produitsEndpoint = '/produits';
  static const String categoriesEndpoint = '/categories';
  static const String marquesEndpoint = '/marques';
  static const String panierEndpoint = '/panier';
  static const String commandesEndpoint = '/commandes';
  static const String demandesEndpoint = '/demandes';
  static const String clientEndpoint = '/client';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String cartKey = 'cart_data';
  static const String isFirstLaunchKey = 'is_first_launch';
  static const String themeKey = 'theme_mode';
  static const String languageKey = 'language';

  // Pagination
  static const int pageSize = 20;
  static const int maxPageSize = 100;

  // Timeouts
  static const int connectionTimeout = 30000; // 30 secondes
  static const int receiveTimeout = 30000;

  // Validation
  static const int minPasswordLength = 6;
  static const int maxPasswordLength = 50;
  static const int otpLength = 6;
  static const int maxDemandesPerDay = 5;

  // Images
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageFormats = [
    'jpg',
    'jpeg',
    'png',
    'heic',
  ];
  static const List<String> allowedFileFormats = [
    'jpg',
    'jpeg',
    'png',
    'pdf',
    'heic',
  ];

  // Cache
  static const int cacheValidityDays = 7;
  static const int maxCacheSizeMB = 100;

  // Social Links
  static const String facebookUrl = 'https://facebook.com/nivah';
  static const String instagramUrl = 'https://instagram.com/nivah';
  static const String twitterUrl = 'https://twitter.com/nivah';

  // Support
  static const String supportEmail = 'support@example.invalid';
  static const String supportPhone = '+221 70 000 00 00';

  // Paydunya
  static const String paydunyaCheckoutUrl = 'https://app.paydunya.com/checkout';
}
