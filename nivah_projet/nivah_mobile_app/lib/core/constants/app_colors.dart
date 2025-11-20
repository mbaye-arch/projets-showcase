import 'package:flutter/material.dart';

/// Couleurs de l'application Nivah
class AppColors {
  // Couleurs principales (Dégradé violet)
  static const Color primary = Color(0xFF667EEA);
  static const Color primaryDark = Color(0xFF764BA2);
  static const Color primaryLight = Color(0xFF8B9EF5);

  // Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Couleurs secondaires
  static const Color secondary = Color(0xFFF093FB);
  static const Color accent = Color(0xFFFF6B9D);

  // Couleurs de fond
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFFAFAFA);

  // Couleurs de texte
  static const Color textPrimary = Color(0xFF333333);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textTertiary = Color(0xFF999999);
  static const Color textLight = Color(0xFFFFFFFF);

  // Couleurs de statut
  static const Color success = Color(0xFF28A745);
  static const Color successLight = Color(0xFFD4EDDA);
  static const Color error = Color(0xFFDC3545);
  static const Color errorLight = Color(0xFFF8D7DA);
  static const Color warning = Color(0xFFFFC107);
  static const Color warningLight = Color(0xFFFFF3CD);
  static const Color info = Color(0xFF17A2B8);
  static const Color infoLight = Color(0xFFD1ECF1);

  // Couleurs des statuts de commande
  static const Color statusEnAttente = Color(0xFFFFC107); // Jaune
  static const Color statusConfirmee = Color(0xFF28A745); // Vert
  static const Color statusEnPreparation = Color(0xFF17A2B8); // Bleu
  static const Color statusExpedie = Color(0xFF6F42C1); // Violet
  static const Color statusEnLivraison = Color(0xFF007BFF); // Bleu foncé
  static const Color statusLivree = Color(0xFF28A745); // Vert
  static const Color statusAnnulee = Color(0xFFDC3545); // Rouge

  // Couleurs des priorités de demandes
  static const Color prioriteBasse = Color(0xFF6C757D); // Gris
  static const Color prioriteNormale = Color(0xFF17A2B8); // Bleu
  static const Color prioriteHaute = Color(0xFFFD7E14); // Orange
  static const Color prioriteUrgente = Color(0xFFDC3545); // Rouge

  // Bordures et séparateurs
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFEEEEEE);

  // Couleurs d'overlay
  static const Color overlay = Color(0x80000000);
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  // Boutons
  static const Color buttonDisabled = Color(0xFFCCCCCC);
  static const Color buttonDisabledText = Color(0xFF999999);

  // Social media
  static const Color facebook = Color(0xFF1877F2);
  static const Color instagram = Color(0xFFE4405F);
  static const Color twitter = Color(0xFF1DA1F2);

  // Rating
  static const Color star = Color(0xFFFFC107);
  static const Color starEmpty = Color(0xFFE0E0E0);

  // Dark mode (pour future implémentation)
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkTextPrimary = Color(0xFFFFFFFF);
  static const Color darkTextSecondary = Color(0xFFCCCCCC);
}
