import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../screens/splash_screen.dart';
import '../../screens/auth/login_screen.dart';
import '../../screens/auth/register_screen.dart';
import '../../screens/auth/verify_email_screen.dart';
import '../../screens/auth/forgot_password_screen.dart';
import '../../screens/auth/reset_password_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/product/product_detail_screen.dart';
import '../../screens/checkout/checkout_screen.dart';
import '../../screens/orders/orders_screen.dart';
import '../../screens/orders/order_detail_screen.dart';

/// Configuration des routes de l'application avec GoRouter
class AppRouter {
  /// Singleton
  static final AppRouter _instance = AppRouter._internal();
  factory AppRouter() => _instance;
  AppRouter._internal();

  /// Clé pour le navigator
  static final navigatorKey = GlobalKey<NavigatorState>();

  /// Routes de l'application
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String verifyEmail = '/verify-email';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';

  static const String home = '/home';
  static const String boutiques = '/boutiques';
  static const String boutiqueDetail = '/boutiques/:slug';
  static const String products = '/products';
  static const String productDetail = '/products/:slug';
  static const String search = '/search';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String orderDetail = '/orders/:id';
  static const String favorites = '/favorites';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String addresses = '/profile/addresses';
  static const String support = '/support';
  static const String createDemande = '/support/create';

  /// Configuration du router
  late final GoRouter router = GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: splash,
    debugLogDiagnostics: true,

    routes: [
      // Splash
      GoRoute(
        path: splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth Routes
      GoRoute(
        path: login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: register,
        name: 'register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: verifyEmail,
        name: 'verify-email',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return VerifyEmailScreen(email: email);
        },
      ),
      GoRoute(
        path: forgotPassword,
        name: 'forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: resetPassword,
        name: 'reset-password',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return ResetPasswordScreen(email: email);
        },
      ),

      // Main Routes
      GoRoute(
        path: home,
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),

      // Boutiques (à créer)
      // GoRoute(
      //   path: boutiques,
      //   name: 'boutiques',
      //   builder: (context, state) => const BoutiquesScreen(),
      // ),
      // GoRoute(
      //   path: boutiqueDetail,
      //   name: 'boutique-detail',
      //   builder: (context, state) {
      //     final slug = state.pathParameters['slug']!;
      //     return BoutiqueDetailScreen(slug: slug);
      //   },
      // ),

      // Products
      // TODO: Créer ProductsScreen (liste complète avec filtres)
      // GoRoute(
      //   path: products,
      //   name: 'products',
      //   builder: (context, state) => const ProductsScreen(),
      // ),
      GoRoute(
        path: productDetail,
        name: 'product-detail',
        builder: (context, state) {
          final slug = state.pathParameters['slug']!;
          return ProductDetailScreen(slug: slug);
        },
      ),

      // Cart & Checkout
      // Note: Cart est dans HomeScreen (tab index 3)
      GoRoute(
        path: checkout,
        name: 'checkout',
        builder: (context, state) => const CheckoutScreen(),
      ),

      // Orders
      GoRoute(
        path: orders,
        name: 'orders',
        builder: (context, state) => const OrdersScreen(),
      ),
      GoRoute(
        path: orderDetail,
        name: 'order-detail',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return OrderDetailScreen(orderId: id);
        },
      ),

      // Profile (à créer)
      // GoRoute(
      //   path: profile,
      //   name: 'profile',
      //   builder: (context, state) => const ProfileScreen(),
      // ),
    ],

    // Gestion des erreurs
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 80, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page non trouvée',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.uri.toString(),
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(login),
              child: const Text('Retour à la connexion'),
            ),
          ],
        ),
      ),
    ),

    // Redirection selon l'état d'authentification (optionnel)
    // redirect: (context, state) {
    //   final isAuthenticated = false; // TODO: Vérifier avec AuthProvider
    //   final isAuthRoute = state.matchedLocation.startsWith('/login') ||
    //       state.matchedLocation.startsWith('/register') ||
    //       state.matchedLocation.startsWith('/verify-email');
    //
    //   if (!isAuthenticated && !isAuthRoute) {
    //     return login;
    //   }
    //   if (isAuthenticated && isAuthRoute) {
    //     return home;
    //   }
    //   return null;
    // },
  );
}
