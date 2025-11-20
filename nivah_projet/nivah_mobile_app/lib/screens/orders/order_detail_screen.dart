import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_styles.dart';
import '../../providers/commande_provider.dart';
import '../../data/models/commande_model.dart';

/// Écran de détail d'une commande
///
/// Features:
/// - Informations complètes de la commande
/// - Timeline de tracking avec statuts
/// - Liste des produits commandés
/// - Adresse de livraison
/// - Informations de paiement
/// - Bouton d'annulation (si applicable)
class OrderDetailScreen extends StatefulWidget {
  final int orderId;

  const OrderDetailScreen({
    super.key,
    required this.orderId,
  });

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  bool _isLoading = false;
  CommandeModel? _commande;

  @override
  void initState() {
    super.initState();
    _loadCommande();
  }

  Future<void> _loadCommande() async {
    setState(() => _isLoading = true);
    try {
      final provider = context.read<CommandeProvider>();
      await provider.getCommandeById(widget.orderId);
      setState(() {
        _commande = provider.commandeActive;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  Future<void> _annulerCommande() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Annuler la commande'),
        content: const Text(
          'Êtes-vous sûr de vouloir annuler cette commande? Cette action est irréversible.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Non'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Oui, annuler'),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    try {
      final provider = context.read<CommandeProvider>();
      await provider.annulerCommande(widget.orderId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Commande annulée avec succès'),
            backgroundColor: AppColors.success,
          ),
        );
        _loadCommande();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_commande != null
            ? 'Commande #${_commande!.numeroCommande}'
            : 'Détails commande'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _commande == null
              ? _buildErrorState()
              : RefreshIndicator(
                  onRefresh: _loadCommande,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Statut et timeline
                        _buildStatusCard(),
                        const SizedBox(height: 16),

                        // Timeline de tracking
                        _buildTrackingTimeline(),
                        const SizedBox(height: 16),

                        // Produits commandés
                        _buildProduits(),
                        const SizedBox(height: 16),

                        // Adresse de livraison
                        _buildAdresseLivraison(),
                        const SizedBox(height: 16),

                        // Récapitulatif paiement
                        _buildRecapitulatifPaiement(),
                        const SizedBox(height: 24),

                        // Bouton annulation
                        if (_canCancelOrder()) _buildCancelButton(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 80, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            'Commande introuvable',
            style: AppStyles.h4.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.pop(),
            child: const Text('Retour'),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Statut de la commande', style: AppStyles.h6),
                _buildStatutBadge(_commande!.statut),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(
                  'Commandé le ${_formatDate(_commande!.createdAt)}',
                  style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
            if (_commande!.dateLivraison != null) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.local_shipping, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(
                    'Livraison prévue: ${_formatDate(_commande!.dateLivraison!)}',
                    style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTrackingTimeline() {
    final List<Map<String, dynamic>> steps = [
      {
        'label': 'Commande passée',
        'icon': Icons.shopping_cart,
        'statut': 'en_attente',
      },
      {
        'label': 'Commande confirmée',
        'icon': Icons.check_circle_outline,
        'statut': 'confirmee',
      },
      {
        'label': 'En cours de préparation',
        'icon': Icons.inventory,
        'statut': 'en_cours',
      },
      {
        'label': 'Livrée',
        'icon': Icons.done_all,
        'statut': 'livree',
      },
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Suivi de commande', style: AppStyles.h6),
            const SizedBox(height: 24),
            ...List.generate(steps.length, (index) {
              final step = steps[index];
              final isCompleted = _isStepCompleted(step['statut']);
              final isCurrent = _commande!.statut == step['statut'];
              final isLast = index == steps.length - 1;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Timeline indicator
                  Column(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isCompleted || isCurrent
                              ? AppColors.primary
                              : AppColors.surface,
                        ),
                        child: Icon(
                          step['icon'],
                          color: isCompleted || isCurrent
                              ? Colors.white
                              : AppColors.textTertiary,
                          size: 20,
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 40,
                          color: isCompleted
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                    ],
                  ),
                  const SizedBox(width: 16),

                  // Content
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 8, bottom: 24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            step['label'],
                            style: AppStyles.bodyMedium.copyWith(
                              fontWeight: isCurrent ? FontWeight.w600 : FontWeight.normal,
                              color: isCompleted || isCurrent
                                  ? AppColors.textPrimary
                                  : AppColors.textTertiary,
                            ),
                          ),
                          if (isCurrent) ...[
                            const SizedBox(height: 4),
                            Text(
                              'En cours',
                              style: AppStyles.caption.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildProduits() {
    if (_commande!.items == null || _commande!.items!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Produits commandés (${_commande!.items!.length})', style: AppStyles.h6),
            const SizedBox(height: 16),
            ...List.generate(_commande!.items!.length, (index) {
              final item = _commande!.items![index];
              return Padding(
                padding: EdgeInsets.only(bottom: index < _commande!.items!.length - 1 ? 12 : 0),
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
                      child: const Icon(Icons.image),
                    ),
                    const SizedBox(width: 12),

                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.produitNom ?? 'Produit',
                            style: AppStyles.bodyMedium,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Quantité: ${item.quantite}',
                            style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),

                    // Prix
                    Text(
                      '${item.montantTotal.toStringAsFixed(0)} FCFA',
                      style: AppStyles.h6.copyWith(color: AppColors.primary),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildAdresseLivraison() {
    if (_commande!.adresseLivraison == null) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Adresse de livraison', style: AppStyles.h6),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on, size: 20, color: AppColors.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _commande!.adresseLivraison!,
                    style: AppStyles.bodyMedium,
                  ),
                ),
              ],
            ),
            if (_commande!.telephoneLivraison != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.phone, size: 20, color: AppColors.primary),
                  const SizedBox(width: 12),
                  Text(
                    _commande!.telephoneLivraison!,
                    style: AppStyles.bodyMedium,
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecapitulatifPaiement() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Récapitulatif', style: AppStyles.h6),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Mode de paiement:', style: AppStyles.bodyMedium),
                Text(
                  _commande!.modePaiement.toUpperCase(),
                  style: AppStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Statut paiement:', style: AppStyles.bodyMedium),
                _buildStatutPaiementBadge(_commande!.statutPaiement),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total:', style: AppStyles.h5),
                Text(
                  '${_commande!.montantTotal.toStringAsFixed(0)} FCFA',
                  style: AppStyles.h4.copyWith(color: AppColors.primary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCancelButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _annulerCommande,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error,
          side: const BorderSide(color: AppColors.error),
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        icon: const Icon(Icons.cancel),
        label: const Text('Annuler la commande'),
      ),
    );
  }

  Widget _buildStatutBadge(String statut) {
    Color backgroundColor;
    Color textColor;
    IconData icon;
    String label;

    switch (statut) {
      case 'en_attente':
        backgroundColor = AppColors.warning.withOpacity(0.1);
        textColor = AppColors.warning;
        icon = Icons.hourglass_empty;
        label = 'En attente';
        break;
      case 'confirmee':
        backgroundColor = AppColors.info.withOpacity(0.1);
        textColor = AppColors.info;
        icon = Icons.check_circle_outline;
        label = 'Confirmée';
        break;
      case 'en_cours':
        backgroundColor = AppColors.primary.withOpacity(0.1);
        textColor = AppColors.primary;
        icon = Icons.local_shipping_outlined;
        label = 'En cours';
        break;
      case 'livree':
        backgroundColor = AppColors.success.withOpacity(0.1);
        textColor = AppColors.success;
        icon = Icons.check_circle;
        label = 'Livrée';
        break;
      case 'annulee':
        backgroundColor = AppColors.error.withOpacity(0.1);
        textColor = AppColors.error;
        icon = Icons.cancel;
        label = 'Annulée';
        break;
      default:
        backgroundColor = AppColors.surface;
        textColor = AppColors.textSecondary;
        icon = Icons.help_outline;
        label = statut;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppStyles.caption.copyWith(
              color: textColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatutPaiementBadge(String statut) {
    Color color;
    String label;

    switch (statut) {
      case 'en_attente':
        color = AppColors.warning;
        label = 'En attente';
        break;
      case 'paye':
        color = AppColors.success;
        label = 'Payé';
        break;
      case 'echoue':
        color = AppColors.error;
        label = 'Échoué';
        break;
      default:
        color = AppColors.textSecondary;
        label = statut;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: AppStyles.caption.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  bool _isStepCompleted(String stepStatut) {
    final order = ['en_attente', 'confirmee', 'en_cours', 'livree'];
    final currentIndex = order.indexOf(_commande!.statut);
    final stepIndex = order.indexOf(stepStatut);
    return currentIndex > stepIndex;
  }

  bool _canCancelOrder() {
    return _commande!.statut != 'livree' && _commande!.statut != 'annulee';
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}
