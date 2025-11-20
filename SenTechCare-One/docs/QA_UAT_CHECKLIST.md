# SenTechCare One - Checklist QA/UAT

Date: 2026-03-20
Version cible: integration finale frontend + backend

## 1. Pre-requis

- [ ] MySQL actif avec schema charge (`bdd/base.sql`) et donnees mini (`bdd/insert.sql`).
- [ ] Backend lance sur `http://localhost:8080`.
- [ ] Frontend lance sur `http://localhost:5173`.
- [ ] Compte admin de demonstration disponible selon le seed local.
- [ ] Navigateur avec cache vide pour demarrer la recette.

## 2. Smoke technique

- [ ] `POST /api/auth/login` retourne `200` avec `accessToken`.
- [ ] `GET /api/auth/me` retourne `200` avec user connecte apres login.
- [ ] `GET /api/dashboard` retourne `200` avec KPI numeriques.
- [ ] `npm run build` frontend passe sans erreur.
- [ ] `./mvnw -q test` backend passe sans echec.

## 3. Auth (Login/JWT/Routing)

- [ ] Login valide: redirection vers `/dashboard`.
- [ ] Login invalide: message erreur propre affiche.
- [ ] Refresh navigateur: session conservee (token + user courant).
- [ ] Route privee sans token: redirection vers `/login`.
- [ ] Logout: token supprime, retour login, routes privees bloquees.

## 4. Dashboard

- [ ] Page `/dashboard` charge les KPI sans erreur.
- [ ] Bouton actualiser recharge les donnees.
- [ ] Etat loading visible pendant appel API.
- [ ] Etat erreur propre si API indisponible.
- [ ] Champs verifies: `totalClients`, `activeSubscriptions`, `openTickets`, `unpaidInvoices`, `totalRevenueCollected`.

## 5. Clients

- [ ] Liste clients paginee chargee.
- [ ] Filtre `clientType` fonctionnel.
- [ ] Filtre `active` fonctionnel.
- [ ] Recherche texte fonctionnelle.
- [ ] Creation client valide enregistre.
- [ ] Edition client valide met a jour.
- [ ] Detail client affiche onglets: infos, abonnements, materiels, interventions, tickets, devis, factures, paiements.
- [ ] Suppression logique client (desactivation) fonctionnelle.

## 6. Subscriptions

- [ ] Liste abonnements paginee chargee.
- [ ] Filtres `status`, `planType`, `clientId`, `expired` fonctionnels.
- [ ] Creation abonnement valide.
- [ ] Validation date: `endDate >= startDate`.
- [ ] Edition abonnement valide.
- [ ] Route `GET /api/subscriptions/active` exploitable depuis frontend.
- [ ] Route `GET /api/subscriptions/expired` exploitable depuis frontend.

## 7. Equipments

- [ ] Liste materiels paginee chargee.
- [ ] Filtres `clientId`, `category`, `status`, `source`, `search` fonctionnels.
- [ ] Creation materiel valide.
- [ ] Edition materiel valide.
- [ ] Detail materiel affiche serie, statut, source, garantie debut/fin.
- [ ] Recherche par numero de serie backend (`/by-serial`) fonctionnelle.

## 8. Interventions

- [ ] Liste interventions paginee chargee.
- [ ] Filtres `status`, `priority`, `type`, `clientId`, `assignedTechnicianId` fonctionnels.
- [ ] Filtres dates `plannedFrom/To` et `actualFrom/To` fonctionnels.
- [ ] Creation intervention valide.
- [ ] Edition intervention valide.
- [ ] Changement de statut depuis detail fonctionnel.
- [ ] Assignation technicien depuis detail fonctionnelle.

## 9. Tickets

- [ ] Liste tickets paginee chargee.
- [ ] Filtres `status`, `priority`, `channel`, `clientId`, `assignedTechnicianId` fonctionnels.
- [ ] Creation ticket valide.
- [ ] Edition ticket valide.
- [ ] Changement de statut ticket depuis detail fonctionnel.
- [ ] Assignation technicien ticket depuis detail fonctionnelle.
- [ ] Conversion ticket vers intervention fonctionne et retourne `interventionId`.

## 10. Quotes

- [ ] Liste devis paginee chargee.
- [ ] Filtres `status`, `clientId`, `dateFrom`, `dateTo`, `search` fonctionnels.
- [ ] Creation devis avec lignes (quantite > 0) valide.
- [ ] Calculs backend verifies: `subtotal`, `discountAmount`, `totalAmount`.
- [ ] Edition devis + lignes valide.
- [ ] Conversion devis -> facture fonctionne (`/convert-to-invoice`).
- [ ] Telechargement PDF devis fonctionne (`/quotes/{id}/pdf`).

## 11. Invoices

- [ ] Liste factures paginee chargee.
- [ ] Filtres `status`, `clientId`, `issueFrom/To`, `dueFrom/To` fonctionnels.
- [ ] Creation facture avec lignes valide.
- [ ] Calcul backend verifie: `totalAmount`.
- [ ] Paiements recalculent automatiquement `paidAmount`, `remainingAmount`, `status`.
- [ ] Edition facture valide.
- [ ] Telechargement PDF facture fonctionne (`/invoices/{id}/pdf`).

## 12. Payments

- [ ] Liste paiements paginee chargee.
- [ ] Filtres `invoiceId`, `clientId`, `method`, `paymentDateFrom/To`, `search` fonctionnels.
- [ ] Creation paiement valide (amount > 0).
- [ ] Paiement met a jour la facture associee.
- [ ] Controle metier: pas de paiement sur facture `CANCELLED`.
- [ ] Telechargement recu PDF fonctionne (`/payments/{id}/receipt/pdf`).

## 13. Users & Profile

- [ ] Liste users accessible selon role (`ADMIN`, `MANAGER`, `SUPPORT`).
- [ ] Creation user autorisee pour `ADMIN` et `MANAGER`.
- [ ] Edition user autorisee pour `ADMIN` et `MANAGER`.
- [ ] Role et statut actif correctement affiches.
- [ ] Profil utilisateur connecte (`/profile`) affiche les bonnes infos.

## 14. Erreurs et UX

- [ ] Erreur validation backend remonte sur les champs formulaire.
- [ ] Erreur 401 force logout et retour login.
- [ ] Erreur 403 affiche message droit insuffisant.
- [ ] Erreur 404 affiche etat vide/erreur propre.
- [ ] Erreur 500 affiche message generique propre.

## 15. Dates et fuseau

- [ ] Les dates `LocalDate` (ex: facture/devis/garantie) ne sont pas decalees d'un jour dans l'UI.
- [ ] Les dates par defaut des formulaires devis/facture correspondent bien a la date locale du poste.
- [ ] Les dates/horaires `LocalDateTime` restent coherentes apres sauvegarde/relecture.

## 16. Validation finale avant livraison

- [ ] Aucun endpoint frontend n'appelle une route backend inexistante.
- [ ] Tous les enums affiches correspondent aux enums backend.
- [ ] Toutes les pages principales sont navigables depuis le menu.
- [ ] Toutes les routes protegees sont effectivement protegees.
- [ ] Build frontend et tests backend passes sur la meme revision.

## 17. Verdict recette

- [ ] GO
- [ ] GO avec reserves
- [ ] NO GO

Commentaires recette:

................................................................................

................................................................................

................................................................................
