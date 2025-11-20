# 🗄️ Migrations Base de Données Nivah

## 📋 Vue d'ensemble

Ce dossier contient les migrations SQL nécessaires pour corriger les incohérences entre le schéma de base de données initial et le code backend PHP.

## ⚠️ IMPORTANT

Ces migrations doivent être exécutées **APRÈS** avoir importé `nivah_database_complete.sql`.

## 📂 Fichiers de Migration

### Migration 001: Réinitialisation Mot de Passe
**Fichier**: `001_add_password_reset_fields.sql`

**Objectif**: Ajouter les colonnes pour la fonctionnalité de réinitialisation de mot de passe.

**Colonnes ajoutées**:
- `code_reinitialisation` VARCHAR(6)
- `code_reinitialisation_expire` DATETIME

**Utilisé par**:
- `AuthController.php::forgotPassword()`
- `AuthController.php::resetPassword()`

---

### Migration 002: Colonnes Commandes Manquantes
**Fichier**: `002_add_missing_commandes_columns.sql`

**Objectif**: Ajouter les colonnes optionnelles utilisées par le système de commandes.

**Colonnes ajoutées**:
- `paydunya_token` VARCHAR(255) - Token de paiement Paydunya
- `raison_annulation` TEXT - Raison d'annulation de commande

**Utilisé par**:
- `CommandeController.php::create()` (Paydunya)
- `Commande.php::cancel()` (Annulation)

---

### Migration 003: Table Adresses de Livraison
**Fichier**: `003_create_adresses_livraison_table.sql`

**Objectif**: Créer la table pour stocker les adresses de livraison multiples des clients.

**Fonctionnalités**:
- Adresses multiples par client
- Adresse par défaut
- Informations complètes (région, département, commune, quartier)
- Instructions de livraison

**Utilisé par**:
- `ClientController.php::adresses()`
- `ClientController.php::ajouterAdresse()`
- `ClientController.php::updateAdresse()`
- `ClientController.php::supprimerAdresse()`

---

### Fichier Consolidé
**Fichier**: `EXECUTE_ALL_MIGRATIONS.sql`

**Objectif**: Exécuter toutes les migrations en une seule fois.

Ce fichier combine toutes les migrations avec des vérifications `IF NOT EXISTS` pour éviter les erreurs si certaines modifications ont déjà été appliquées.

---

## 🚀 Instructions d'Exécution

### Option 1: Exécution Complète (Recommandée)

```bash
mysql -u votre_utilisateur -p nivah_database < EXECUTE_ALL_MIGRATIONS.sql
```

### Option 2: Exécution Individuelle

Si vous préférez exécuter les migrations une par une:

```bash
# Migration 001
mysql -u votre_utilisateur -p nivah_database < 001_add_password_reset_fields.sql

# Migration 002
mysql -u votre_utilisateur -p nivah_database < 002_add_missing_commandes_columns.sql

# Migration 003
mysql -u votre_utilisateur -p nivah_database < 003_create_adresses_livraison_table.sql
```

### Option 3: Via phpMyAdmin

1. Connectez-vous à phpMyAdmin
2. Sélectionnez la base de données `nivah_database`
3. Allez dans l'onglet "SQL"
4. Copiez-collez le contenu de `EXECUTE_ALL_MIGRATIONS.sql`
5. Cliquez sur "Exécuter"

---

## ✅ Vérification Post-Migration

Après avoir exécuté les migrations, vérifiez:

### 1. Colonnes ajoutées à `clients`
```sql
DESCRIBE clients;
-- Vérifier la présence de:
-- - code_reinitialisation
-- - code_reinitialisation_expire
```

### 2. Colonnes ajoutées à `commandes`
```sql
DESCRIBE commandes;
-- Vérifier la présence de:
-- - paydunya_token
-- - raison_annulation
```

### 3. Table `adresses_livraison` créée
```sql
SHOW TABLES LIKE 'adresses_livraison';
-- Doit retourner: adresses_livraison

DESCRIBE adresses_livraison;
-- Vérifier la structure complète
```

### 4. Index créés
```sql
SHOW INDEX FROM clients WHERE Key_name = 'idx_code_reinitialisation';
SHOW INDEX FROM commandes WHERE Key_name = 'idx_paydunya_token';
SHOW INDEX FROM adresses_livraison;
```

---

## 🔄 Rollback (Annulation)

Si vous devez annuler les migrations:

```sql
-- Rollback Migration 003
DROP TABLE IF EXISTS adresses_livraison;

-- Rollback Migration 002
ALTER TABLE commandes
DROP COLUMN IF EXISTS paydunya_token,
DROP COLUMN IF EXISTS raison_annulation;

-- Rollback Migration 001
ALTER TABLE clients
DROP COLUMN IF EXISTS code_reinitialisation,
DROP COLUMN IF EXISTS code_reinitialisation_expire;
```

---

## 📊 Dépendances

### Ordre de création initial
1. `nivah_database_complete.sql` (schéma de base)
2. `EXECUTE_ALL_MIGRATIONS.sql` (corrections)

### Ordre de suppression (si nécessaire)
1. Migrations (rollback)
2. Schema de base

---

## 🐛 Problèmes Connus

### Erreur: "Table already exists"
**Solution**: Les migrations utilisent `IF NOT EXISTS`, donc cette erreur ne devrait pas se produire. Si elle apparaît, la table existe déjà et vous pouvez ignorer l'erreur.

### Erreur: "Duplicate column name"
**Solution**: Les migrations utilisent `ADD COLUMN IF NOT EXISTS`. Sur MySQL < 5.7, remplacez par un simple `ADD COLUMN` et ignorez l'erreur si la colonne existe.

### Erreur: "Cannot add foreign key constraint"
**Solution**: Assurez-vous que la table `clients` existe avant de créer `adresses_livraison`.

---

## 📝 Notes de Version

### Version 1.0 (2025-12-24)
- ✅ Migration 001: Champs réinitialisation mot de passe
- ✅ Migration 002: Colonnes optionnelles commandes
- ✅ Migration 003: Table adresses de livraison
- ✅ Fichier consolidé pour exécution groupée
- ✅ Support MySQL 5.7+

---

## 📞 Support

Pour toute question ou problème:
1. Consultez le fichier `RAPPORT_CORRECTIONS_BDD_BACKEND.md`
2. Vérifiez les logs MySQL/MariaDB
3. Contactez l'équipe de développement

---

**Dernière mise à jour**: 2025-12-24
**Compatibilité**: MySQL 5.7+, MariaDB 10.2+
