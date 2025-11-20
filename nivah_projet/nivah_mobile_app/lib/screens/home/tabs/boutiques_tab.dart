import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../providers/boutique_provider.dart';

class BoutiquesTab extends StatefulWidget {
  const BoutiquesTab({super.key});

  @override
  State<BoutiquesTab> createState() => _BoutiquesTabState();
}

class _BoutiquesTabState extends State<BoutiquesTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BoutiqueProvider>().getBoutiques(refresh: true);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Boutiques'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Recherche boutiques
            },
          ),
        ],
      ),
      body: Consumer<BoutiqueProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.boutiques.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.boutiques.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.store_outlined, size: 80, color: AppColors.textTertiary),
                  const SizedBox(height: 16),
                  Text(
                    'Aucune boutique disponible',
                    style: AppStyles.bodyLarge.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => provider.getBoutiques(refresh: true),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.boutiques.length + (provider.hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == provider.boutiques.length) {
                  provider.loadMoreBoutiques();
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: CircularProgressIndicator(),
                    ),
                  );
                }

                final boutique = provider.boutiques[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: boutique.logo != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Image.network(
                                boutique.logo!,
                                fit: BoxFit.cover,
                              ),
                            )
                          : const Icon(Icons.store, size: 30),
                    ),
                    title: Text(boutique.nom, style: AppStyles.h6),
                    subtitle: Text(
                      boutique.description ?? 'Découvrez nos produits',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      // TODO: Navigation vers détails boutique
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
