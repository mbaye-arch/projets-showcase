# SenTechCare One - Diff d'integration module par module

Date: 2026-03-20

## 1) Auth
Etat: OK

- Backend:
  - POST `/api/auth/login`
  - GET `/api/auth/me`
- Frontend:
  - `authApi.login()` -> `/auth/login`
  - `authApi.getCurrentUser()` -> `/auth/me`
  - `httpClient` ajoute `Authorization: Bearer <token>` automatiquement
  - `401` hors login -> nettoyage session + evenement `auth:unauthorized`
  - `AuthContext` charge session, login, logout, refresh user
  - `ProtectedRoute` / `PublicOnlyRoute` operationnels

## 2) Dashboard
Etat: OK

- Backend: GET `/api/dashboard` retourne
  - `totalClients`
  - `activeClients`
  - `activeSubscriptions`
  - `subscriptionsExpiringSoon`
  - `openTickets`
  - `interventionsToday`
  - `interventionsThisMonth`
  - `unpaidInvoices`
  - `totalRevenueCollected`
  - `expectedMonthlyRevenue`
- Frontend: `dashboardApi.getDashboardMetrics()` mappe 1:1 les champs backend

## 3) Clients
Etat: OK

- Endpoints backend alignes:
  - POST `/api/clients`
  - PUT `/api/clients/{id}`
  - GET `/api/clients/{id}`
  - GET `/api/clients`
  - DELETE `/api/clients/{id}`
- Filtres frontend alignes:
  - `search`, `active`, `clientType`, `page`, `size`, `sort`
- Onglets detail client relies:
  - abonnements, materiels, interventions, tickets, devis, factures, paiements

## 4) Subscription
Etat: OK

- Endpoints backend:
  - CRUD `/api/subscriptions`
  - GET `/api/subscriptions/active`
  - GET `/api/subscriptions/expired`
- Filtres frontend:
  - `clientId`, `status`, `planType`, `expired`
- Champs payload coherents:
  - `planType`, `monthlyPrice`, `startDate`, `endDate`, `billingFrequency`, `status`

## 5) Equipment
Etat: OK

- Endpoints backend:
  - CRUD `/api/equipments`
  - GET `/api/equipments/client/{clientId}`
  - GET `/api/equipments/by-serial`
- Filtres frontend:
  - `clientId`, `category`, `status`, `source`, `search`
- Champs et enums alignes:
  - `category`, `status`, `source`, `serialNumber`, dates garantie

## 6) Intervention
Etat: OK

- Endpoints backend:
  - CRUD `/api/interventions`
  - GET `/api/interventions/technician/{assignedTechnicianId}`
- Pagination/filtres frontend alignes:
  - `status`, `priority`, `type`, `clientId`, `assignedTechnicianId`, `plannedFrom/To`, `actualFrom/To`, `search`
- Assignation technicien et changement statut operationnels

## 7) Ticket
Etat: OK

- Endpoints backend:
  - CRUD `/api/tickets`
  - GET `/api/tickets/technician/{assignedTechnicianId}`
  - POST `/api/tickets/{id}/convert-to-intervention`
- Filtres frontend alignes:
  - `status`, `priority`, `channel`, `clientId`, `assignedTechnicianId`, `createdFrom/To`, `resolvedFrom/To`, `search`
- Conversion ticket -> intervention alignee avec `TicketToInterventionRequestDto`

## 8) Quote
Etat: OK (corrige)

- Endpoints backend:
  - CRUD `/api/quotes`
  - GET `/api/quotes/{id}/pdf`
  - POST `/api/quotes/{id}/convert-to-invoice`
- Correction appliquee:
  - `quoteApi.convertQuoteToInvoice(quoteId)` envoie maintenant un POST sans body (alignement backend)
- Calculs backend sources de verite:
  - `subtotal`, `discountAmount`, `totalAmount`
- Feature flag frontend conversion:
  - `VITE_ENABLE_QUOTE_CONVERSION=true`

## 9) Invoice
Etat: OK

- Endpoints backend:
  - CRUD `/api/invoices`
  - GET `/api/invoices/{id}/pdf`
- Filtres frontend alignes:
  - `status`, `clientId`, `issueFrom/To`, `dueFrom/To`, `search`
- Calculs backend alignes avec affichage frontend:
  - `totalAmount`, `paidAmount`, `remainingAmount`, `status` automatique

## 10) Payment
Etat: OK

- Endpoints backend:
  - CRUD `/api/payments`
  - GET `/api/payments/invoice/{invoiceId}`
  - GET `/api/payments/{id}/receipt/pdf`
- Filtres frontend alignes:
  - `invoiceId`, `clientId`, `method`, `paymentDateFrom/To`, `search`
- Logique metier alignee:
  - creation paiement -> mise a jour automatique de la facture associee

## 11) User
Etat: OK

- Endpoints backend:
  - CRUD `/api/users`
  - GET `/api/users/active`
  - GET `/api/users/role/{roleId}`
  - GET `/api/users/technicians`
  - GET `/api/users/by-email`
- Securite role frontend alignee backend:
  - lecture users: ADMIN/MANAGER/SUPPORT
  - creation/edition users: ADMIN/MANAGER
- Profil utilisateur connecte base sur `/api/auth/me`

## 12) PDF
Etat: OK

- Devis: `/api/quotes/{id}/pdf`
- Facture: `/api/invoices/{id}/pdf`
- Recu paiement: `/api/payments/{id}/receipt/pdf`
- Frontend: gestion blob + extraction nom de fichier depuis `Content-Disposition`

## 13) Erreurs
Etat: OK

- Backend standard:
  - `message`, `code`, `timestamp`, `details` (si validation)
- Frontend centralise:
  - normalisation erreurs dans `httpClient` + `apiError`
  - mapping field errors formulaires via `applyApiFieldErrors`

## 14) Correctif transverse date/fuseau
Etat: CORRIGE

- Probleme traite:
  - decallage potentiel des `LocalDate` (ex: `YYYY-MM-DD`) selon fuseau navigateur
- Solution appliquee:
  - utilitaire `src/utils/date.js` (`formatApiDate`, `formatApiDateTime`, `getLocalDateInputValue`)
  - migration des pages liste/detail concernees
  - migration valeurs par defaut formulaires devis/facture

## 15) Validation finale
Etat: OK

- Backend compile: `./mvnw -q -DskipTests compile` -> OK
- Backend tests: `./mvnw -q test` -> OK
- Frontend build: `npm run build` -> OK
