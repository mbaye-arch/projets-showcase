import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_styles.dart';
import '../../../core/config/app_router.dart';
import '../../../providers/auth_provider.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Mon Profil'),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;

          if (user == null) {
            return const Center(child: CircularProgressIndicator());
          }

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Header profil
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 3),
                      ),
                      child: Center(
                        child: Text(
                          user.initiales,
                          style: AppStyles.h3.copyWith(color: AppColors.primary),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.nomComplet,
                            style: AppStyles.h5.copyWith(color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user.email,
                            style: AppStyles.bodyMedium.copyWith(
                              color: Colors.white.withOpacity(0.9),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            user.telephone,
                            style: AppStyles.bodySmall.copyWith(
                              color: Colors.white.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Menu items
              _buildMenuItem(
                icon: Icons.receipt_long_outlined,
                title: 'Mes commandes',
                onTap: () {
                  context.push(AppRouter.orders);
                },
              ),

              _buildMenuItem(
                icon: Icons.location_on_outlined,
                title: 'Mes adresses',
                onTap: () {
                  // TODO: Navigation vers adresses
                },
              ),

              _buildMenuItem(
                icon: Icons.person_outline,
                title: 'Modifier mon profil',
                onTap: () {
                  // TODO: Navigation vers édition profil
                },
              ),

              _buildMenuItem(
                icon: Icons.lock_outline,
                title: 'Changer mot de passe',
                onTap: () {
                  // TODO: Navigation vers changement mot de passe
                },
              ),

              _buildMenuItem(
                icon: Icons.help_outline,
                title: 'Support',
                onTap: () {
                  // TODO: Navigation vers support
                },
              ),

              _buildMenuItem(
                icon: Icons.info_outline,
                title: 'À propos',
                onTap: () {
                  // TODO: À propos
                },
              ),

              const SizedBox(height: 24),

              // Bouton déconnexion
              Card(
                child: ListTile(
                  leading: const Icon(Icons.logout, color: AppColors.error),
                  title: Text(
                    'Déconnexion',
                    style: AppStyles.h6.copyWith(color: AppColors.error),
                  ),
                  trailing: authProvider.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.chevron_right, color: AppColors.error),
                  onTap: authProvider.isLoading
                      ? null
                      : () async {
                          final confirm = await showDialog<bool>(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Déconnexion'),
                              content: const Text('Voulez-vous vraiment vous déconnecter?'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context, false),
                                  child: const Text('Annuler'),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: const Text('Déconnexion'),
                                ),
                              ],
                            ),
                          );

                          if (confirm == true && context.mounted) {
                            await authProvider.logout();
                            if (context.mounted) {
                              context.go(AppRouter.login);
                            }
                          }
                        },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(title, style: AppStyles.h6),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
