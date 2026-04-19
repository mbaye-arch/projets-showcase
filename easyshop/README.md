# EasyShop

Prototype academique PHP/MySQL pour une plateforme locale de commerce et livraison.

## Objectif

EasyShop separe trois parcours utilisateurs :

- client : inscription, connexion et consultation de boutiques ;
- commercant : inscription d'une entreprise et presentation commerciale ;
- livreur : inscription, connexion et espace de suivi.

Le projet montre une premiere architecture web multi-profils avec formulaires HTML, styles CSS, scripts JavaScript et persistance MySQL via PDO.

## Stack

- HTML, CSS, JavaScript
- PHP avec PDO
- MySQL

## Structure

```text
frontend/
  conexion/       pages et traitement de connexion
  inscription/    formulaires et traitements d'inscription
  espace client/  pages client
  espace commercant/
  espace livreur/
database/
  schema.sql      schema MySQL de demonstration
```

## Lancement local

1. Creer la base :

```bash
mysql -u easyshop_user -p < database/schema.sql
```

2. Configurer les variables d'environnement, par exemple :

```bash
export EASYSHOP_DB_HOST=127.0.0.1
export EASYSHOP_DB_NAME=easyshop
export EASYSHOP_DB_USER=easyshop_user
export EASYSHOP_DB_PASSWORD=change_me_locally
```

3. Servir le projet avec PHP :

```bash
php -S 127.0.0.1:8080 -t frontend
```

## Points valorisables

- separation des espaces client, commercant et livreur ;
- formulaires complets avec hashage des mots de passe ;
- connexion PDO avec requetes preparees ;
- schema SQL reproductible pour une demonstration locale.

## Note publication

Les identifiants reels ne sont pas inclus. Le dossier d'uploads est ignore afin d'eviter de publier des fichiers personnels ou generes localement.
