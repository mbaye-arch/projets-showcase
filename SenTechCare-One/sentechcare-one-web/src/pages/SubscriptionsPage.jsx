import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { getSubscriptions } from '@/api/subscriptionApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getBillingFrequencyLabel,
  getPlanTypeLabel,
  getSubscriptionStatusBadgeVariant,
  getSubscriptionStatusLabel,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_EXPIRATION_FILTER_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS
} from '@/features/subscriptions/subscriptionConstants';
import { Badge, Button, Card, PageHeader, Pagination, Select, Table } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDate } from '@/utils/date';

const DEFAULT_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0
};

function parseErrorMessage(error, fallback) {
  return extractApiErrorMessage(error, fallback || 'Une erreur est survenue.');
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function SubscriptionsPage() {
  const [subscriptionsPage, setSubscriptionsPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    status: '',
    clientId: '',
    planType: '',
    expired: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    clientId: '',
    planType: '',
    expired: ''
  });

  const loadClients = useCallback(async () => {
    try {
      const response = await getClients({
        page: 0,
        size: 300,
        sort: 'createdAt,desc'
      });

      const content = response?.content ?? [];
      const options = content.map((client) => ({
        value: String(client.id),
        label: getClientDisplayName(client)
      }));
      const map = content.reduce((acc, client) => {
        acc[client.id] = getClientDisplayName(client);
        return acc;
      }, {});

      setClientsOptions(options);
      setClientsMap(map);
    } catch {
      setClientsOptions([]);
      setClientsMap({});
    }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getSubscriptions({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        status: appliedFilters.status || undefined,
        clientId: appliedFilters.clientId || undefined,
        planType: appliedFilters.planType || undefined,
        expired:
          appliedFilters.expired === ''
            ? undefined
            : appliedFilters.expired === 'expired'
      });

      setSubscriptionsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des abonnements.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const columns = useMemo(
    () => [
      {
        key: 'clientId',
        header: 'Client',
        render: (value) => clientsMap[value] || `Client #${value}`
      },
      {
        key: 'planType',
        header: 'Formule',
        render: (value) => getPlanTypeLabel(value)
      },
      {
        key: 'monthlyPrice',
        header: 'Prix mensuel',
        render: (value) => formatAmount(value)
      },
      {
        key: 'billingFrequency',
        header: 'Facturation',
        render: (value) => getBillingFrequencyLabel(value)
      },
      {
        key: 'startDate',
        header: 'Debut',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'endDate',
        header: 'Fin',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getSubscriptionStatusBadgeVariant(value)}>
            {getSubscriptionStatusLabel(value)}
          </Badge>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/clients/${row.clientId}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir client
            </Link>
            <Link
              to={`/subscriptions/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
          </div>
        )
      }
    ],
    [clientsMap]
  );

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPageIndex(0);
    setAppliedFilters({ ...pendingFilters });
  };

  const clearFilters = () => {
    const empty = { status: '', clientId: '', planType: '', expired: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        subtitle="Suivi des contrats et formules de maintenance."
        actions={
          <Link to="/subscriptions/new">
            <Button>Ajouter un abonnement</Button>
          </Link>
        }
      />

      <Card title="Filtres" subtitle="Filtrer les abonnements par client, statut ou formule." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-5" onSubmit={handleFilterSubmit}>
          <Select
            label="Statut"
            options={[{ value: '', label: 'Tous les statuts' }, ...SUBSCRIPTION_STATUS_OPTIONS]}
            value={pendingFilters.status}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, status: event.target.value }))}
          />

          <Select
            label="Client"
            options={[{ value: '', label: 'Tous les clients' }, ...clientsOptions]}
            value={pendingFilters.clientId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientId: event.target.value }))}
          />

          <Select
            label="Formule"
            options={[{ value: '', label: 'Toutes les formules' }, ...PLAN_TYPE_OPTIONS]}
            value={pendingFilters.planType}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, planType: event.target.value }))}
          />

          <Select
            label="Echeance"
            options={SUBSCRIPTION_EXPIRATION_FILTER_OPTIONS}
            value={pendingFilters.expired}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, expired: event.target.value }))}
          />

          <div className="flex items-end gap-2">
            <Button type="submit">Filtrer</Button>
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Reinitialiser
            </Button>
          </div>
        </form>
      </Card>

      {errorMessage ? (
        <Card padding="md">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        </Card>
      ) : null}

      <Table
        columns={columns}
        data={subscriptionsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun abonnement trouve"
        emptyDescription="Aucun abonnement ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={subscriptionsPage.number}
          totalPages={subscriptionsPage.totalPages}
          totalElements={subscriptionsPage.totalElements}
          pageSize={subscriptionsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
