import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_styles.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../data/services/commande_service.dart';

/// Écran de checkout en 4 étapes
///
/// Étapes:
/// 1. Récapitulatif du panier
/// 2. Adresse de livraison
/// 3. Paiement avec Paydunya
/// 4. Confirmation
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _currentStep = 0;
  bool _isLoading = false;
  String? _error;

  // Données de livraison
  final TextEditingController _adresseController = TextEditingController();
  final TextEditingController _villeController = TextEditingController();
  final TextEditingController _telephoneController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  // Données de paiement
  String? _paydunyaToken;
  String? _paydunyaUrl;
  int? _commandeId;

  final CommandeService _commandeService = CommandeService();

  @override
  void dispose() {
    _adresseController.dispose();
    _villeController.dispose();
    _telephoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _validerEtape() async {
    switch (_currentStep) {
      case 0:
        // Étape 1: Vérifier le panier
        final cartProvider = context.read<CartProvider>();
        if (cartProvider.isEmpty) {
          _showError('Votre panier est vide');
          return;
        }
        setState(() => _currentStep = 1);
        break;

      case 1:
        // Étape 2: Valider l'adresse
        if (_adresseController.text.trim().isEmpty ||
            _villeController.text.trim().isEmpty ||
            _telephoneController.text.trim().isEmpty) {
          _showError('Veuillez remplir tous les champs obligatoires');
          return;
        }
        setState(() => _currentStep = 2);
        break;

      case 2:
        // Étape 3: Créer la commande et obtenir le lien Paydunya
        await _creerCommandeEtPayer();
        break;

      case 3:
        // Étape 4: Confirmation - naviguer vers les commandes
        if (mounted) {
          context.go('/orders');
        }
        break;
    }
  }

  Future<void> _creerCommandeEtPayer() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Créer la commande
      final result = await _commandeService.creerCommande(
        adresseLivraison: _adresseController.text.trim(),
        telephoneLivraison: _telephoneController.text.trim(),
      );

      _commandeId = result['commande_id'] as int;
      _paydunyaToken = result['paydunya_token'] as String?;
      _paydunyaUrl = result['paydunya_url'] as String?;

      if (_paydunyaUrl != null) {
        setState(() {
          _currentStep = 2;
          _isLoading = false;
        });
      } else {
        // Si pas de URL Paydunya, c'est qu'il n'y a pas besoin de payer
        setState(() {
          _currentStep = 3;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
      _showError(_error!);
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Finaliser la commande'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_currentStep > 0 && _currentStep < 2) {
              setState(() => _currentStep--);
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _buildStepContent(),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildEtape1Recap();
      case 1:
        return _buildEtape2Adresse();
      case 2:
        return _buildEtape3Paiement();
      case 3:
        return _buildEtape4Confirmation();
      default:
        return const SizedBox.shrink();
    }
  }

  /// Étape 1: Récapitulatif du panier
  Widget _buildEtape1Recap() {
    return Consumer<CartProvider>(
      builder: (context, cartProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête
              Text('Votre panier', style: AppStyles.h4),
              const SizedBox(height: 8),
              Text(
                '${cartProvider.nombreItems} article(s)',
                style: AppStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),

              // Liste des articles
              ...cartProvider.items.map((item) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          // Image
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: (item.produit?.images != null &&
                                    item.produit!.images!.isNotEmpty)
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      item.produit!.images!.first,
                                      fit: BoxFit.cover,
                                    ),
                                  )
                                : const Icon(Icons.image),
                          ),
                          const SizedBox(width: 12),
                          // Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.produit?.nom ?? 'Produit',
                                  style: AppStyles.h6,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Quantité: ${item.quantite}',
                                  style: AppStyles.bodySmall,
                                ),
                              ],
                            ),
                          ),
                          // Prix
                          Text(
                            '${(item.prixUnitaire * item.quantite).toStringAsFixed(0)} FCFA',
                            style: AppStyles.h6.copyWith(color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                  )),

              const SizedBox(height: 24),

              // Totaux
              _buildTotalCard(cartProvider),
            ],
          ),
        );
      },
    );
  }

  /// Étape 2: Adresse de livraison
  Widget _buildEtape2Adresse() {
    final authProvider = context.read<AuthProvider>();
    final user = authProvider.user;

    // Pré-remplir avec les données utilisateur si disponibles
    if (_telephoneController.text.isEmpty && user != null) {
      _telephoneController.text = user.telephone;
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Adresse de livraison', style: AppStyles.h4),
          const SizedBox(height: 24),

          // Adresse
          TextField(
            controller: _adresseController,
            decoration: InputDecoration(
              labelText: 'Adresse complète *',
              hintText: 'Ex: Rue 10, Immeuble ABC, Appartement 5',
              prefixIcon: const Icon(Icons.location_on),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            maxLines: 2,
          ),
          const SizedBox(height: 16),

          // Ville
          TextField(
            controller: _villeController,
            decoration: InputDecoration(
              labelText: 'Ville *',
              hintText: 'Ex: Dakar',
              prefixIcon: const Icon(Icons.location_city),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Téléphone
          TextField(
            controller: _telephoneController,
            decoration: InputDecoration(
              labelText: 'Téléphone *',
              hintText: 'Ex: +221 70 000 00 00',
              prefixIcon: const Icon(Icons.phone),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 16),

          // Notes
          TextField(
            controller: _notesController,
            decoration: InputDecoration(
              labelText: 'Instructions de livraison (optionnel)',
              hintText: 'Ex: Sonner à l\'interphone',
              prefixIcon: const Icon(Icons.note),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            maxLines: 3,
          ),

          const SizedBox(height: 16),

          // Info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.info.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline, color: AppColors.info),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Assurez-vous que votre numéro de téléphone est correct pour être contacté lors de la livraison.',
                    style: AppStyles.bodySmall.copyWith(color: AppColors.info),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Étape 3: Paiement avec Paydunya
  Widget _buildEtape3Paiement() {
    if (_paydunyaUrl == null) {
      return const Center(child: CircularProgressIndicator());
    }

    // TODO: Intégrer webview_flutter pour afficher le paiement Paydunya
    // Pour l'instant, on affiche un placeholder et on simule le paiement
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.payment,
              size: 80,
              color: AppColors.primary,
            ),
            const SizedBox(height: 24),
            Text(
              'Paiement Paydunya',
              style: AppStyles.h3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'URL de paiement générée',
              style: AppStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: SelectableText(
                _paydunyaUrl!,
                style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 32),
            Text(
              'Pour intégrer Paydunya WebView, ajoutez webview_flutter au pubspec.yaml',
              style: AppStyles.caption.copyWith(color: AppColors.textTertiary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _currentStep = 1),
                    child: const Text('Annuler'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() => _currentStep = 3),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Simuler paiement'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Étape 4: Confirmation
  Widget _buildEtape4Confirmation() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 60,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Commande confirmée!',
              style: AppStyles.h3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              'Votre commande #${_commandeId ?? 'XXXX'} a été créée avec succès.',
              style: AppStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Vous recevrez une notification lorsque votre commande sera en cours de préparation.',
              style: AppStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.go('/home'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Retour à l\'accueil'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => context.go('/orders'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Mes commandes'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTotalCard(CartProvider cartProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Sous-total:', style: AppStyles.bodyMedium),
                Text(
                  '${cartProvider.sousTotal.toStringAsFixed(0)} FCFA',
                  style: AppStyles.h6,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Frais de livraison:', style: AppStyles.bodyMedium),
                Text(
                  '${cartProvider.fraisLivraison.toStringAsFixed(0)} FCFA',
                  style: AppStyles.h6,
                ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total:', style: AppStyles.h5),
                Text(
                  '${cartProvider.total.toStringAsFixed(0)} FCFA',
                  style: AppStyles.h4.copyWith(color: AppColors.primary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    if (_currentStep == 3) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Indicateur d'étapes
            Row(
              children: List.generate(4, (index) {
                final isActive = index == _currentStep;
                final isCompleted = index < _currentStep;
                return Expanded(
                  child: Container(
                    height: 4,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: isActive || isCompleted
                          ? AppColors.primary
                          : AppColors.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                );
              }),
            ),
            const SizedBox(height: 16),

            // Bouton
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _validerEtape,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  disabledBackgroundColor: AppColors.textTertiary,
                ),
                child: Text(
                  _currentStep == 0
                      ? 'Continuer'
                      : _currentStep == 1
                          ? 'Valider l\'adresse'
                          : _currentStep == 2
                              ? 'Payer maintenant'
                              : 'Terminer',
                  style: AppStyles.h6.copyWith(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
