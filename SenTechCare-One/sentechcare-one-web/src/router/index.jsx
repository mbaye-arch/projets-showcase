import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';
import App from '@/app/App';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ProtectedRoute from '@/router/ProtectedRoute';
import PublicOnlyRoute from '@/router/PublicOnlyRoute';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ClientsPage = lazy(() => import('@/pages/ClientsPage'));
const ClientCreatePage = lazy(() => import('@/pages/ClientCreatePage'));
const ClientDetailsPage = lazy(() => import('@/pages/ClientDetailsPage'));
const ClientEditPage = lazy(() => import('@/pages/ClientEditPage'));
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage'));
const SubscriptionCreatePage = lazy(() => import('@/pages/SubscriptionCreatePage'));
const SubscriptionEditPage = lazy(() => import('@/pages/SubscriptionEditPage'));
const EquipmentsPage = lazy(() => import('@/pages/EquipmentsPage'));
const EquipmentCreatePage = lazy(() => import('@/pages/EquipmentCreatePage'));
const EquipmentDetailsPage = lazy(() => import('@/pages/EquipmentDetailsPage'));
const EquipmentEditPage = lazy(() => import('@/pages/EquipmentEditPage'));
const InterventionsPage = lazy(() => import('@/pages/InterventionsPage'));
const InterventionCreatePage = lazy(() => import('@/pages/InterventionCreatePage'));
const InterventionDetailsPage = lazy(() => import('@/pages/InterventionDetailsPage'));
const InterventionEditPage = lazy(() => import('@/pages/InterventionEditPage'));
const TicketsPage = lazy(() => import('@/pages/TicketsPage'));
const TicketCreatePage = lazy(() => import('@/pages/TicketCreatePage'));
const TicketDetailsPage = lazy(() => import('@/pages/TicketDetailsPage'));
const TicketEditPage = lazy(() => import('@/pages/TicketEditPage'));
const QuotesPage = lazy(() => import('@/pages/QuotesPage'));
const QuoteCreatePage = lazy(() => import('@/pages/QuoteCreatePage'));
const QuoteDetailsPage = lazy(() => import('@/pages/QuoteDetailsPage'));
const QuoteEditPage = lazy(() => import('@/pages/QuoteEditPage'));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'));
const InvoiceCreatePage = lazy(() => import('@/pages/InvoiceCreatePage'));
const InvoiceDetailsPage = lazy(() => import('@/pages/InvoiceDetailsPage'));
const InvoiceEditPage = lazy(() => import('@/pages/InvoiceEditPage'));
const PaymentsPage = lazy(() => import('@/pages/PaymentsPage'));
const PaymentCreatePage = lazy(() => import('@/pages/PaymentCreatePage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const UserCreatePage = lazy(() => import('@/pages/UserCreatePage'));
const UserEditPage = lazy(() => import('@/pages/UserEditPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-slate-500">
      Chargement de la page...
    </div>
  );
}

function withLazyPage(Component) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [{ path: '/login', element: withLazyPage(LoginPage) }]
          }
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: '/dashboard', element: withLazyPage(DashboardPage) },
              { path: '/clients', element: withLazyPage(ClientsPage) },
              { path: '/clients/new', element: withLazyPage(ClientCreatePage) },
              { path: '/clients/:id/edit', element: withLazyPage(ClientEditPage) },
              { path: '/clients/:id', element: withLazyPage(ClientDetailsPage) },
              { path: '/subscriptions', element: withLazyPage(SubscriptionsPage) },
              { path: '/subscriptions/new', element: withLazyPage(SubscriptionCreatePage) },
              { path: '/subscriptions/:id/edit', element: withLazyPage(SubscriptionEditPage) },
              { path: '/equipments', element: withLazyPage(EquipmentsPage) },
              { path: '/equipments/new', element: withLazyPage(EquipmentCreatePage) },
              { path: '/equipments/:id/edit', element: withLazyPage(EquipmentEditPage) },
              { path: '/equipments/:id', element: withLazyPage(EquipmentDetailsPage) },
              { path: '/interventions', element: withLazyPage(InterventionsPage) },
              { path: '/interventions/new', element: withLazyPage(InterventionCreatePage) },
              { path: '/interventions/:id/edit', element: withLazyPage(InterventionEditPage) },
              { path: '/interventions/:id', element: withLazyPage(InterventionDetailsPage) },
              { path: '/tickets', element: withLazyPage(TicketsPage) },
              { path: '/tickets/new', element: withLazyPage(TicketCreatePage) },
              { path: '/tickets/:id/edit', element: withLazyPage(TicketEditPage) },
              { path: '/tickets/:id', element: withLazyPage(TicketDetailsPage) },
              { path: '/quotes', element: withLazyPage(QuotesPage) },
              { path: '/quotes/new', element: withLazyPage(QuoteCreatePage) },
              { path: '/quotes/:id/edit', element: withLazyPage(QuoteEditPage) },
              { path: '/quotes/:id', element: withLazyPage(QuoteDetailsPage) },
              { path: '/invoices', element: withLazyPage(InvoicesPage) },
              { path: '/invoices/new', element: withLazyPage(InvoiceCreatePage) },
              { path: '/invoices/:id/edit', element: withLazyPage(InvoiceEditPage) },
              { path: '/invoices/:id', element: withLazyPage(InvoiceDetailsPage) },
              { path: '/payments', element: withLazyPage(PaymentsPage) },
              { path: '/payments/new', element: withLazyPage(PaymentCreatePage) },
              { path: '/users', element: withLazyPage(UsersPage) },
              { path: '/users/new', element: withLazyPage(UserCreatePage) },
              { path: '/users/:id/edit', element: withLazyPage(UserEditPage) },
              { path: '/profile', element: withLazyPage(ProfilePage) }
            ]
          }
        ]
      },
      { path: '*', element: withLazyPage(NotFoundPage) }
    ]
  }
]);
