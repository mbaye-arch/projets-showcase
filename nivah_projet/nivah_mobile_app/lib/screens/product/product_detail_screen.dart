import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_styles.dart';
import '../../providers/produit_provider.dart';
import '../../providers/cart_provider.dart';
import '../../data/models/produit_model.dart';

/// Écran de détail d'un produit
///
/// Features:
/// - Galerie d'images avec PageView
/// - Détails produit (nom, prix, description)
/// - Sélection de variantes (taille, couleur)
/// - Ajout au panier avec quantité
/// - Produits similaires
class ProductDetailScreen extends StatefulWidget {
  final String slug;

  const ProductDetailScreen({
    super.key,
    required this.slug,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _currentImageIndex = 0;
  int _quantity = 1;
  String? _selectedSize;
  String? _selectedColor;
  bool _isLoading = false;
  ProduitModel? _produit;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    setState(() => _isLoading = true);
    try {
      final provider = context.read<ProduitProvider>();
      final produit = await provider.getProduitBySlug(widget.slug);
      setState(() {
        _produit = produit;
        _isLoading = false;
      });

      // Charger les produits similaires
      if (produit != null) {
        provider.getProduitsSimilaires(produit.id, limit: 10);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  Future<void> _addToCart() async {
    if (_produit == null) return;

    final cartProvider = context.read<CartProvider>();

    try {
      await cartProvider.ajouterAuPanier(
        produitId: _produit!.id,
        quantite: _quantity,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Produit ajouté au panier'),
            backgroundColor: AppColors.success,
            action: SnackBarAction(
              label: 'Voir',
              textColor: Colors.white,
              onPressed: () {
                // Naviguer vers l'onglet panier (index 3 dans HomeScreen)
                context.pop();
              },
            ),
          ),
        );
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
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_produit == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 80, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                'Produit non trouvé',
                style: AppStyles.h4.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Retour'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // AppBar avec image
          _buildSliverAppBar(),

          // Contenu
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info produit
                _buildProductInfo(),

                // Description
                if (_produit!.description != null && _produit!.description!.isNotEmpty)
                  _buildDescription(),

                // Variantes (si disponibles)
                // TODO: Ajouter variantes quand le backend sera prêt
                // _buildVariants(),

                // Produits similaires
                _buildSimilarProducts(),

                // Espacement pour le footer
                const SizedBox(height: 100),
              ],
            ),
          ),
        ],
      ),
      // Footer avec ajout au panier
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildSliverAppBar() {
    final List<String> images = (_produit?.images != null && _produit!.images!.isNotEmpty)
        ? _produit!.images!
        : ['https://via.placeholder.com/400'];

    return SliverAppBar(
      expandedHeight: 400,
      pinned: true,
      backgroundColor: AppColors.surface,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Galerie d'images
            PageView.builder(
              itemCount: images.length,
              onPageChanged: (index) {
                setState(() => _currentImageIndex = index);
              },
              itemBuilder: (context, index) {
                return Image.network(
                  images[index],
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: AppColors.surface,
                      child: const Center(
                        child: Icon(Icons.image, size: 80, color: AppColors.textTertiary),
                      ),
                    );
                  },
                );
              },
            ),

            // Indicateur de pages
            if (images.length > 1)
              Positioned(
                bottom: 16,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    images.length,
                    (index) => Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _currentImageIndex == index
                            ? Colors.white
                            : Colors.white.withOpacity(0.5),
                      ),
                    ),
                  ),
                ),
              ),

            // Badge promo si applicable
            if (_produit!.pourcentageReduction != null)
              Positioned(
                top: 60,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.error,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '-${_produit!.pourcentageReduction}%',
                    style: AppStyles.h6.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () {
            // TODO: Partager le produit
          },
        ),
        IconButton(
          icon: const Icon(Icons.favorite_border),
          onPressed: () {
            // TODO: Ajouter aux favoris
          },
        ),
      ],
    );
  }

  Widget _buildProductInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Nom
          Text(
            _produit!.nom,
            style: AppStyles.h3,
          ),
          const SizedBox(height: 8),

          // Prix
          Row(
            children: [
              if (_produit!.prixPromo != null) ...[
                Text(
                  '${_produit!.prix.toStringAsFixed(0)} FCFA',
                  style: AppStyles.h5.copyWith(
                    decoration: TextDecoration.lineThrough,
                    color: AppColors.textTertiary,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              Text(
                '${_produit!.prixEffectif.toStringAsFixed(0)} FCFA',
                style: AppStyles.h3.copyWith(
                  color: _produit!.prixPromo != null
                      ? AppColors.error
                      : AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Stock
          Row(
            children: [
              Icon(
                _produit!.stock > 0 ? Icons.check_circle : Icons.cancel,
                color: _produit!.stock > 0 ? AppColors.success : AppColors.error,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                _produit!.stock > 0
                    ? 'En stock (${_produit!.stock} disponible${_produit!.stock > 1 ? 's' : ''})'
                    : 'Rupture de stock',
                style: AppStyles.bodyMedium.copyWith(
                  color: _produit!.stock > 0 ? AppColors.success : AppColors.error,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Description', style: AppStyles.h5),
          const SizedBox(height: 12),
          Text(
            _produit!.description ?? '',
            style: AppStyles.bodyMedium.copyWith(height: 1.6),
          ),
        ],
      ),
    );
  }

  Widget _buildSimilarProducts() {
    return Consumer<ProduitProvider>(
      builder: (context, provider, child) {
        if (provider.isLoadingSimilaires || provider.produitsSimilaires.isEmpty) {
          return const SizedBox.shrink();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Text('Produits similaires', style: AppStyles.h5),
            ),
            SizedBox(
              height: 240,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: provider.produitsSimilaires.length,
                itemBuilder: (context, index) {
                  final produit = provider.produitsSimilaires[index];
                  return GestureDetector(
                    onTap: () {
                      // Naviguer vers ce produit
                      context.pushReplacement('/products/${produit.slug}');
                    },
                    child: Container(
                      width: 160,
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Image
                          Container(
                            height: 140,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(12),
                              ),
                            ),
                            child: (produit.images != null && produit.images!.isNotEmpty)
                                ? ClipRRect(
                                    borderRadius: const BorderRadius.vertical(
                                      top: Radius.circular(12),
                                    ),
                                    child: Image.network(
                                      produit.images!.first,
                                      fit: BoxFit.cover,
                                      width: double.infinity,
                                    ),
                                  )
                                : const Center(
                                    child: Icon(Icons.image, size: 40),
                                  ),
                          ),
                          // Info
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  produit.nom,
                                  style: AppStyles.bodyMedium,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${produit.prixEffectif.toStringAsFixed(0)} FCFA',
                                  style: AppStyles.h6.copyWith(
                                    color: AppColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildBottomBar() {
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
        child: Row(
          children: [
            // Sélecteur de quantité
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.border),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: _quantity > 1
                        ? () => setState(() => _quantity--)
                        : null,
                    iconSize: 20,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      '$_quantity',
                      style: AppStyles.h5,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: _quantity < _produit!.stock
                        ? () => setState(() => _quantity++)
                        : null,
                    iconSize: 20,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),

            // Bouton ajouter au panier
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _produit!.stock > 0 ? _addToCart : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  disabledBackgroundColor: AppColors.textTertiary,
                ),
                icon: const Icon(Icons.shopping_cart),
                label: Text(
                  _produit!.stock > 0 ? 'Ajouter au panier' : 'Indisponible',
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
