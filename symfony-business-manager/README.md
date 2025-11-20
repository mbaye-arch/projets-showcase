# Symfony Business Manager

Projet vitrine Symfony : application métier fictive avec back-office, entités Doctrine, dashboard, pages de gestion et données de démonstration.

## Objectif

Montrer une structure Symfony professionnelle sans exposer de projet privé :

- architecture MVC ;
- entités Doctrine ;
- contrôleurs ;
- templates Twig ;
- dashboard métier ;
- données fictives ;
- code lisible et documenté.

## Stack

- PHP 8.2+
- Symfony
- Doctrine ORM
- Twig
- MySQL ou SQLite

## Fonctionnalités

- Dashboard avec KPI calculés depuis Doctrine
- Gestion de clients fictifs
- Catalogue de prestations fictives
- Suivi de factures fictives
- Statuts et montants
- Templates Twig responsive pour captures portfolio

## Routes principales

- `/` : dashboard métier
- `/clients` : liste des clients
- `/prestations` : offres de services
- `/factures` : suivi des factures

## Données de démonstration

Le projet contient des fixtures Symfony dans `src/DataFixtures/AppFixtures.php`.

La démo locale actuellement chargée contient :

- 4 clients fictifs
- 3 prestations
- 4 factures
- KPI de chiffre d'affaires simulé

## Installation

```bash
composer install
cp .env.example .env
php bin/console doctrine:database:create
php bin/console doctrine:schema:update --force
php bin/console doctrine:fixtures:load
symfony server:start
```

Alternative avec le serveur PHP :

```bash
php -S 127.0.0.1:8060 -t public
```

Pour l'environnement local de capture, l'application est configurée avec MySQL dans `.env` et Doctrine est limité aux tables `client`, `invoice` et `service_offer` afin de ne pas toucher aux tables des autres showcases.

## Structure

```text
bin/
public/
src/
  Controller/
  Entity/
  Repository/
  DataFixtures/
templates/
  dashboard/
  client/
  service_offer/
  invoice/
docs/
screenshots/
```

## Captures recommandées

- `screenshots/dashboard.png` : vue KPI et dernières factures
- `screenshots/clients.png` : liste des clients
- `screenshots/prestations.png` : catalogue des prestations
- `screenshots/factures.png` : suivi des factures

## Données

Toutes les données sont fictives. Ce projet ne contient aucun client réel, aucune donnée privée, aucun secret et aucun dump de base de données.

## Améliorations prévues

- ajouter authentification ;
- ajouter rôles administrateur/utilisateur ;
- ajouter formulaires Symfony ;
- ajouter migrations Doctrine ;
- ajouter tests fonctionnels ;
- ajouter Docker Compose.
