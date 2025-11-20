import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_styles.dart';
import '../../providers/commande_provider.dart';
import '../../data/models/commande_model.dart';

/// Écran de liste des commandes
///
/// Features:
/// - Liste des commandes avec filtres par statut
/// - Cards avec infos commande (numéro, date, montant, statut)
/// - Navigation vers détails commande
/// - Pull-to-refresh
/// - États vides et chargement
class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  String? _selectedStatut;

  @override
  void initState() {
    super.initState();
    _loadCommandes();
  }

  Future<void> _loadCommandes() async {
    final provider = context.read<CommandeProvider>();
    await provider.getCommandes(statut: _selectedStatut);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mes commandes'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadCommandes,
        child: Consumer<CommandeProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading && provider.commandes.isEmpty) {
              return const Center(child: CircularProgressIndicator());
            }

            if (provider.commandes.isEmpty) {
              return _buildEmptyState();
            }

            return Column(
              children: [
                // Filtres
                _buildFilters(),

                // Liste des commandes
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: provider.commandes.length,
                    itemBuilder: (context, index) {
                      final commande = provider.commandes[index];
                      return _buildCommandeCard(commande);
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildFilterChip('Toutes', null),
            const SizedBox(width: 8),
            _buildFilterChip('En attente', 'en_attente'),
            const SizedBox(width: 8),
            _buildFilterChip('Confirmée', 'confirmee'),
            const SizedBox(width: 8),
            _buildFilterChip('En cours', 'en_cours'),
            const SizedBox(width: 8),
            _buildFilterChip('Livrée', 'livree'),
            const SizedBox(width: 8),
            _buildFilterChip('Annulée', 'annulee'),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, String? statut) {
    final isSelected = _selectedStatut == statut;

    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedStatut = selected ? statut : null;
        });
        _loadCommandes();
      },
      backgroundColor: Colors.white,
      selectedColor: AppColors.primary.withOpacity(0.2),
      labelStyle: TextStyle(
        color: isSelected ? AppColors.primary : AppColors.textSecondary,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Widget _buildCommandeCard(CommandeModel commande) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.push('/orders/${commande.id}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // En-tête: Numéro et statut
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Commande #${commande.numeroCommande}',
                    style: AppStyles.h6,
                  ),
                  _buildStatutBadge(commande.statut),
                ],
              ),
              const SizedBox(height: 12),

              // Date
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(
                    _formatDate(commande.createdAt),
                    style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Nombre d'articles
              Row(
                children: [
                  const Icon(Icons.shopping_bag, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Text(
                    '${commande.items?.length ?? 0} article(s)',
                    style: AppStyles.bodySmall.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Divider
              const Divider(),

              // Montant total
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Total:',
                    style: AppStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  ),
                  Text(
                    '${commande.montantTotal.toStringAsFixed(0)} FCFA',
                    style: AppStyles.h5.copyWith(color: AppColors.primary),
                  ),
                ],
              ),
            ],
          ),
        ),
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.shopping_bag_outlined,
            size: 100,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 24),
          Text(
            'Aucune commande',
            style: AppStyles.h4.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Text(
            _selectedStatut == null
                ? 'Vous n\'avez pas encore passé de commande'
                : 'Aucune commande avec ce statut',
            style: AppStyles.bodyMedium.copyWith(color: AppColors.textTertiary),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.go('/home'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: const Text('Commencer mes achats'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    return '${date.day} ${months[date.month - 1]} ${date.year} à ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }
}
