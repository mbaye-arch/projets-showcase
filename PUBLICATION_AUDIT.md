# Audit de publication des projets showcase

Ce document sert de garde-fou avant de pousser un projet sur GitHub public.

## État global

Les projets showcase ont été nettoyés, documentés et enrichis avec des captures. Le dossier `showcase/README.md` sert maintenant d'index public.

Statut recommandé: pousser progressivement, avec un commit par projet ou par lot cohérent.

## Publier en priorité

### SenTechCare One

Projet full-stack Spring Boot / React très valorisant pour une alternance ingénieur. Il montre une architecture métier complète: clients, abonnements, équipements, tickets, interventions, devis, factures, paiements, PDF, dashboard KPI et JWT.

Statut: prêt pour publication après dernier `git diff` local.

Nettoyage déjà fait:
- suppression des artefacts lourds (`target`, `.tools`, `node_modules`, `dist`);
- suppression du `.env` frontend local;
- ajout d'un `.gitignore`;
- remplacement des valeurs sensibles par des placeholders.

### STC GEST 1

Projet React / Express / MySQL pour gestion de catalogue IT, fournisseurs, matériels, logiciels, sélection commerciale et PDF.

Statut: prêt pour publication.

Nettoyage déjà fait:
- suppression des `node_modules`, `dist` et `.env`;
- renforcement du `.gitignore`;
- remplacement des identifiants MySQL par un utilisateur local fictif.

### STC GEST 2

Projet React / Express / Prisma / MySQL pour gestion de stock, mouvements, inventaires et étiquettes QR/barcode/PDF.

Statut: prêt pour publication.

Nettoyage déjà fait:
- suppression des `node_modules`, `dist` et `.env`;
- renforcement du `.gitignore`;
- remplacement de l'URL MySQL root par une URL locale fictive.

### Nivah Mobile Commerce

Projet Flutter / Dart / PHP / MySQL intéressant pour montrer un profil mobile + backend. Il couvre l'authentification, un catalogue, des boutiques, un panier, SQLite côté mobile et un backend PHP documenté.

Statut: prêt pour publication, avec captures intégrées et backend local documenté.

Nettoyage déjà fait:
- remplacement des emails personnels par des adresses de démonstration;
- remplacement des numéros de téléphone par des valeurs fictives;
- remplacement des credentials, secrets, hashes et API keys par des placeholders;
- retrait de la configuration Firebase/FCM publique;
- ajout de seed local et images produits de démonstration.

## Projets complémentaires prêts

### Scripting Bash

Projet utile pour montrer Linux, automatisation et DevOps junior.

Statut: prêt pour publication.

Nettoyage déjà fait:
- mode démonstration `demo.sh` sans modification système;
- confirmation avant actions système;
- documentation des scripts et captures.

### Crosswords C

Projet algorithmique intéressant en C.

Statut: prêt pour publication.

### Serveur Web Python

Projet académique utile pour montrer réseau, HTTP et refactoring Python.

Statut: prêt pour publication.

### Data / IA / API / Frontend / DevOps

Statut: prêts pour publication:
- Data KPI Dashboard;
- AI Data Assistant;
- Django Flask API Lab;
- Next.js TypeScript Dashboard;
- Docker Kubernetes Lab;
- Symfony Business Manager;
- JEE Management App.

## Règle avant push

- Ne jamais pousser `.env`, secrets, dumps SQL réels, logs, `node_modules`, `vendor`, `target`, `dist`, `.next`, `.tools`.
- Vérifier `rg -n "password|secret|token|api_key|private|BEGIN|root"`.
- Préférer un commit par projet pour donner une chronologie propre.
