# SenTechCare One - Frontend/Backend Integration Contract

Date de verification: 2026-03-20

## 1. Security et JWT

- Backend base path: `/api`
- Frontend axios baseURL: `VITE_API_BASE_URL` (par defaut `/api`)
- Proxy Vite dev: `/api` -> `VITE_BACKEND_PROXY_TARGET` (par defaut `http://localhost:8080`)
- Endpoint public: `POST /api/auth/login`
- Endpoint session: `GET /api/auth/me`
- Header JWT attendu pour routes protegees:
  - `Authorization: Bearer <token>`
- Intercepteur frontend:
  - ajoute automatiquement le bearer token
  - si `401` (hors `/auth/login`), supprime la session locale et declenche `auth:unauthorized`

## 2. Contrats de reponse communs

### 2.1 Pagination (Spring `Page<T>`)

Les endpoints listes retournent un objet de type page:

```json
{
  "content": [ ... ],
  "totalElements": 0,
  "totalPages": 0,
  "size": 10,
  "number": 0,
  "first": true,
  "last": true,
  "empty": true
}
```

Params standard acceptes: `page`, `size`, `sort`.

### 2.2 Erreurs API (backend)

Format harmonise:

```json
{
  "message": "...",
  "code": 400,
  "timestamp": "2026-03-20T17:00:00",
  "details": {
    "field": "validation message"
  }
}
```

`details` est present pour les erreurs de validation de champs.

### 2.3 Telechargement fichiers PDF

- Quotes: `GET /api/quotes/{id}/pdf`
- Invoices: `GET /api/invoices/{id}/pdf`
- Payment receipt: `GET /api/payments/{id}/receipt/pdf`

Contrat:
- content type: `application/pdf`
- `Content-Disposition` contient le nom du fichier
- Frontend appelle avec `responseType: 'blob'`

## 3. Enums metier synchronises

| Enum | Valeurs backend | Utilisation frontend |
|---|---|---|
| `ClientType` | `HOUSE, SHOP, SCHOOL, SME, INSTITUTION` | `features/clients/*` |
| `PlanType` | `BASIC, BUSINESS, PREMIUM` | `features/subscriptions/*` |
| `SubscriptionStatus` | `ACTIVE, SUSPENDED, EXPIRED, CANCELLED` | `features/subscriptions/*` |
| `EquipmentCategory` | `PC, LAPTOP, PRINTER, ROUTER, SWITCH, CAMERA, TV, SERVER, OTHER` | `features/equipments/*` |
| `EquipmentStatus` | `ACTIVE, BROKEN, REPLACED, OUT_OF_SERVICE` | `features/equipments/*` |
| `EquipmentSource` | `SENTECHCARE, CLIENT` | `features/equipments/*` |
| `InterventionType` | `INSTALLATION, TROUBLESHOOTING, MAINTENANCE, UPDATE, VISIT, OTHER` | `features/interventions/*`, conversion ticket |
| `InterventionStatus` | `PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED` | `features/interventions/*` |
| `PriorityLevel` | `LOW, NORMAL, HIGH, URGENT` | `features/interventions/*`, `features/tickets/*` |
| `TicketChannel` | `PHONE, WHATSAPP, EMAIL, VISIT` | `features/tickets/*` |
| `TicketStatus` | `OPEN, IN_PROGRESS, RESOLVED, CLOSED` | `features/tickets/*` |
| `QuoteStatus` | `DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED` | `features/quotes/*` |
| `InvoiceStatus` | `DRAFT, ISSUED, PAID, PARTIALLY_PAID, UNPAID, CANCELLED` | `features/invoices/*` |
| `PaymentMethod` | `CASH, BANK_TRANSFER, MOBILE_MONEY, CHECK, OTHER` | `features/payments/*` |

## 4. Mapping endpoints backend <-> frontend

## 4.1 Auth

| Method | Endpoint | Frontend | Request | Response |
|---|---|---|---|---|
| POST | `/api/auth/login` | `authApi.login(payload)` | `{ email, password }` | `{ accessToken, tokenType, expiresInSeconds, user }` |
| GET | `/api/auth/me` | `authApi.getCurrentUser()` | header bearer | `AuthUserDto` |

`AuthUserDto`:
`{ id, firstName, lastName, email, phone, active, roleId, roleName }`

## 4.2 Roles

| Method | Endpoint | Frontend | Query | Response |
|---|---|---|---|---|
| GET | `/api/roles` | `roleApi.getRoles()` | - | `RoleResponseDto[]` |

`RoleResponseDto`: `{ id, name }`

## 4.3 Dashboard

| Method | Endpoint | Frontend | Query | Response |
|---|---|---|---|---|
| GET | `/api/dashboard` | `dashboardApi.getDashboardMetrics()` | - | `DashboardResponseDto` |

`DashboardResponseDto`:
`{ totalClients, activeClients, activeSubscriptions, subscriptionsExpiringSoon, openTickets, interventionsToday, interventionsThisMonth, unpaidInvoices, totalRevenueCollected, expectedMonthlyRevenue }`

## 4.4 Clients

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/clients` | `clientApi.getClients(params)` | `page,size,sort,active,clientType,search` | - | `Page<ClientResponseDto>` |
| GET | `/api/clients/{id}` | `clientApi.getClientById(id)` | - | - | `ClientResponseDto` |
| POST | `/api/clients` | `clientApi.createClient(payload)` | - | `ClientRequestDto` | `ClientResponseDto` |
| PUT | `/api/clients/{id}` | `clientApi.updateClient(id,payload)` | - | `ClientRequestDto` | `ClientResponseDto` |
| DELETE | `/api/clients/{id}` | `clientApi.deleteClient(id)` | - | - | `204` |
| GET | `/api/clients/active` | non utilise direct | `page,size,sort` | - | `Page<ClientResponseDto>` |
| GET | `/api/clients/by-email` | non utilise direct | `email` | - | `ClientResponseDto` |

`ClientRequestDto`:
`{ clientType, companyName, firstName, lastName, phone, email, address, city, country, contactPerson, notes, active }`

`ClientResponseDto`:
`{ id, clientType, companyName, firstName, lastName, phone, email, address, city, country, contactPerson, notes, active, createdAt, updatedAt }`

## 4.5 Subscriptions

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/subscriptions` | `subscriptionApi.getSubscriptions(params)` | `page,size,sort,clientId,status,planType,expired` | - | `Page<SubscriptionResponseDto>` |
| GET | `/api/subscriptions/{id}` | `subscriptionApi.getSubscriptionById(id)` | - | - | `SubscriptionResponseDto` |
| POST | `/api/subscriptions` | `subscriptionApi.createSubscription(payload)` | - | `SubscriptionRequestDto` | `SubscriptionResponseDto` |
| PUT | `/api/subscriptions/{id}` | `subscriptionApi.updateSubscription(id,payload)` | - | `SubscriptionRequestDto` | `SubscriptionResponseDto` |
| DELETE | `/api/subscriptions/{id}` | `subscriptionApi.deleteSubscription(id)` | - | - | `204` |
| GET | `/api/subscriptions/active` | `subscriptionApi.getActiveSubscriptions(params)` | `page,size,sort` | - | `Page<SubscriptionResponseDto>` |
| GET | `/api/subscriptions/expired` | `subscriptionApi.getExpiredSubscriptions(params)` | `page,size,sort` | - | `Page<SubscriptionResponseDto>` |

`SubscriptionRequestDto`:
`{ clientId, planType, monthlyPrice, startDate, endDate, billingFrequency, status, description, notes }`

## 4.6 Equipments

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/equipments` | `equipmentApi.getEquipments(params)` | `page,size,sort,clientId,status,category,source,search` | - | `Page<EquipmentResponseDto>` |
| GET | `/api/equipments/{id}` | `equipmentApi.getEquipmentById(id)` | - | - | `EquipmentResponseDto` |
| POST | `/api/equipments` | `equipmentApi.createEquipment(payload)` | - | `EquipmentRequestDto` | `EquipmentResponseDto` |
| PUT | `/api/equipments/{id}` | `equipmentApi.updateEquipment(id,payload)` | - | `EquipmentRequestDto` | `EquipmentResponseDto` |
| DELETE | `/api/equipments/{id}` | `equipmentApi.deleteEquipment(id)` | - | - | `204` |
| GET | `/api/equipments/client/{clientId}` | `equipmentApi.getEquipmentsByClient(clientId, params)` | `page,size,sort` | - | `Page<EquipmentResponseDto>` |
| GET | `/api/equipments/by-serial` | `equipmentApi.getEquipmentBySerialNumber(serialNumber)` | `serialNumber` | - | `EquipmentResponseDto` |

## 4.7 Interventions

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/interventions` | `interventionApi.getInterventions(params)` | `page,size,sort,clientId,assignedTechnicianId,status,priority,type,plannedFrom,plannedTo,actualFrom,actualTo,search` | - | `Page<InterventionResponseDto>` |
| GET | `/api/interventions/{id}` | `interventionApi.getInterventionById(id)` | - | - | `InterventionResponseDto` |
| POST | `/api/interventions` | `interventionApi.createIntervention(payload)` | - | `InterventionRequestDto` | `InterventionResponseDto` |
| PUT | `/api/interventions/{id}` | `interventionApi.updateIntervention(id,payload)` | - | `InterventionRequestDto` | `InterventionResponseDto` |
| DELETE | `/api/interventions/{id}` | `interventionApi.deleteIntervention(id)` | - | - | `204` |
| GET | `/api/interventions/technician/{assignedTechnicianId}` | `interventionApi.getInterventionsByTechnician(id, params)` | `page,size,sort` | - | `Page<InterventionResponseDto>` |

Note date filters:
- backend attend `LocalDateTime` ISO (`YYYY-MM-DDTHH:mm[:ss]`)
- frontend envoie `datetime-local`, compatible avec `LocalDateTime`

## 4.8 Tickets

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/tickets` | `ticketApi.getTickets(params)` | `page,size,sort,clientId,assignedTechnicianId,status,priority,channel,createdFrom,createdTo,resolvedFrom,resolvedTo,search` | - | `Page<TicketResponseDto>` |
| GET | `/api/tickets/{id}` | `ticketApi.getTicketById(id)` | - | - | `TicketResponseDto` |
| POST | `/api/tickets` | `ticketApi.createTicket(payload)` | - | `TicketRequestDto` | `TicketResponseDto` |
| PUT | `/api/tickets/{id}` | `ticketApi.updateTicket(id,payload)` | - | `TicketRequestDto` | `TicketResponseDto` |
| DELETE | `/api/tickets/{id}` | `ticketApi.deleteTicket(id)` | - | - | `204` |
| GET | `/api/tickets/technician/{assignedTechnicianId}` | `ticketApi.getTicketsByTechnician(id, params)` | `page,size,sort` | - | `Page<TicketResponseDto>` |
| POST | `/api/tickets/{id}/convert-to-intervention` | `ticketApi.convertTicketToIntervention(id,payload)` | - | `TicketToInterventionRequestDto` | `TicketToInterventionResponseDto` |

`TicketToInterventionRequestDto`:
`{ interventionType, assignedTechnicianId, plannedDate, closeTicket, resolutionComment }`

## 4.9 Quotes

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/quotes` | `quoteApi.getQuotes(params)` | `page,size,sort,clientId,status,dateFrom,dateTo,search` | - | `Page<QuoteResponseDto>` |
| GET | `/api/quotes/{id}` | `quoteApi.getQuoteById(id)` | - | - | `QuoteResponseDto` |
| POST | `/api/quotes` | `quoteApi.createQuote(payload)` | - | `QuoteRequestDto` | `QuoteResponseDto` |
| PUT | `/api/quotes/{id}` | `quoteApi.updateQuote(id,payload)` | - | `QuoteRequestDto` | `QuoteResponseDto` |
| DELETE | `/api/quotes/{id}` | `quoteApi.deleteQuote(id)` | - | - | `204` |
| GET | `/api/quotes/by-reference` | non utilise direct | `reference` | - | `QuoteResponseDto` |
| GET | `/api/quotes/{id}/pdf` | `quoteApi.downloadQuotePdf(id)` | - | - | `application/pdf` |
| POST | `/api/quotes/{id}/convert-to-invoice` | `quoteApi.convertQuoteToInvoice(id)` | - | aucun body | `QuoteToInvoiceResponseDto` |

`QuoteRequestDto`:
`{ reference, clientId, quoteDate, status, discountAmount, notes, items[] }`

`items[]`: `{ description, quantity, unitPrice }`

## 4.10 Invoices

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/invoices` | `invoiceApi.getInvoices(params)` | `page,size,sort,clientId,status,issueFrom,issueTo,dueFrom,dueTo,search` | - | `Page<InvoiceResponseDto>` |
| GET | `/api/invoices/{id}` | `invoiceApi.getInvoiceById(id)` | - | - | `InvoiceResponseDto` |
| POST | `/api/invoices` | `invoiceApi.createInvoice(payload)` | - | `InvoiceRequestDto` | `InvoiceResponseDto` |
| PUT | `/api/invoices/{id}` | `invoiceApi.updateInvoice(id,payload)` | - | `InvoiceRequestDto` | `InvoiceResponseDto` |
| DELETE | `/api/invoices/{id}` | `invoiceApi.deleteInvoice(id)` | - | - | `204` |
| GET | `/api/invoices/by-reference` | non utilise direct | `reference` | - | `InvoiceResponseDto` |
| GET | `/api/invoices/{id}/pdf` | `invoiceApi.downloadInvoicePdf(id)` | - | - | `application/pdf` |

`InvoiceRequestDto`:
`{ reference, clientId, issueDate, dueDate, status, paymentMethodNote, notes, items[] }`

`items[]`: `{ description, quantity, unitPrice }`

## 4.11 Payments

| Method | Endpoint | Frontend | Query | Request | Response |
|---|---|---|---|---|---|
| GET | `/api/payments` | `paymentApi.getPayments(params)` | `page,size,sort,invoiceId,clientId,method,paymentDateFrom,paymentDateTo,search` | - | `Page<PaymentResponseDto>` |
| GET | `/api/payments/{id}` | `paymentApi.getPaymentById(id)` | - | - | `PaymentResponseDto` |
| POST | `/api/payments` | `paymentApi.createPayment(payload)` | - | `PaymentRequestDto` | `PaymentResponseDto` |
| PUT | `/api/payments/{id}` | `paymentApi.updatePayment(id,payload)` | - | `PaymentRequestDto` | `PaymentResponseDto` |
| DELETE | `/api/payments/{id}` | `paymentApi.deletePayment(id)` | - | - | `204` |
| GET | `/api/payments/invoice/{invoiceId}` | non utilise direct | `page,size,sort` | - | `Page<PaymentResponseDto>` |
| GET | `/api/payments/{id}/receipt/pdf` | `paymentApi.downloadPaymentReceiptPdf(id)` | - | - | `application/pdf` |

`PaymentRequestDto`:
`{ invoiceId, paymentDate, amount, method, paymentReference, notes }`

`PaymentResponseDto`:
`{ id, invoiceId, clientId, paymentDate, amount, method, paymentReference, notes, createdAt, updatedAt }`

`clientId` est fourni par backend via la facture associee.

## 4.12 Users

| Method | Endpoint | Frontend | Query | Request | Response | Restriction role |
|---|---|---|---|---|---|---|
| GET | `/api/users` | `userApi.getUsers(params)` | `page,size,sort,active,roleId,search` | - | `Page<UserResponseDto>` | ADMIN/MANAGER/SUPPORT |
| GET | `/api/users/{id}` | `userApi.getUserById(id)` | - | - | `UserResponseDto` | ADMIN/MANAGER/SUPPORT |
| POST | `/api/users` | `userApi.createUser(payload)` | - | `UserRequestDto` | `UserResponseDto` | ADMIN/MANAGER |
| PUT | `/api/users/{id}` | `userApi.updateUser(id,payload)` | - | `UserRequestDto` | `UserResponseDto` | ADMIN/MANAGER |
| DELETE | `/api/users/{id}` | `userApi.deleteUser(id)` | - | - | `204` | ADMIN |
| GET | `/api/users/active` | non utilise direct | `page,size,sort` | - | `Page<UserResponseDto>` | ADMIN/MANAGER/SUPPORT |
| GET | `/api/users/role/{roleId}` | non utilise direct | `page,size,sort` | - | `Page<UserResponseDto>` | ADMIN/MANAGER/SUPPORT |
| GET | `/api/users/technicians` | `interventionApi.getTechnicians()`, `ticketApi.getTicketTechnicians()` | `page,size,sort,activeOnly` | - | `Page<UserResponseDto>` | ADMIN/MANAGER/SUPPORT |
| GET | `/api/users/by-email` | `userApi.getUserByEmail(email)` | `email` | - | `UserResponseDto` | ADMIN/MANAGER/SUPPORT ou owner |

## 5. Routes frontend principales

| Route frontend | Page | API principale |
|---|---|---|
| `/login` | LoginPage | `POST /api/auth/login`, `GET /api/auth/me` |
| `/dashboard` | DashboardPage | `GET /api/dashboard` |
| `/clients` | ClientsPage | `GET /api/clients` |
| `/clients/:id` | ClientDetailsPage | `GET /api/clients/{id}` + onglets via subscriptions/equipments/interventions/tickets/quotes/invoices/payments |
| `/subscriptions` | SubscriptionsPage | `GET /api/subscriptions` |
| `/equipments` | EquipmentsPage | `GET /api/equipments` |
| `/interventions` | InterventionsPage | `GET /api/interventions` |
| `/tickets` | TicketsPage | `GET /api/tickets` |
| `/tickets/:id` | TicketDetailsPage | `GET/PUT /api/tickets/{id}` + `POST /api/tickets/{id}/convert-to-intervention` |
| `/quotes` | QuotesPage | `GET /api/quotes` |
| `/quotes/:id` | QuoteDetailsPage | `GET/PUT /api/quotes/{id}` + PDF + conversion facture |
| `/invoices` | InvoicesPage | `GET /api/invoices` |
| `/invoices/:id` | InvoiceDetailsPage | `GET/PUT /api/invoices/{id}` + PDF |
| `/payments` | PaymentsPage | `GET /api/payments` |
| `/users` | UsersPage | `GET /api/users`, `GET /api/roles` |
| `/profile` | ProfilePage | `GET /api/auth/me` |

## 6. Corrections appliquees lors de cet audit

1. Activation de la conversion devis -> facture cote frontend:
   - `.env`: `VITE_ENABLE_QUOTE_CONVERSION=true`
   - `.env.example`: `VITE_ENABLE_QUOTE_CONVERSION=true`
2. Alignement strict de l'appel de conversion sur le controller backend:
   - `quoteApi.convertQuoteToInvoice(quoteId)` en `POST` sans body

## 7. Validation finale

- Backend compile: `./mvnw -q -DskipTests compile` OK
- Backend tests: `./mvnw -q test` OK
- Frontend build: `npm run build` OK

