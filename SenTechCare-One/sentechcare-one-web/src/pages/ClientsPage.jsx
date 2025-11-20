import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import {
  ACTIVE_FILTER_OPTIONS,
  CLIENT_TYPE_OPTIONS,
  getClientDisplayName,
  getClientTypeLabel
} from '@/features/clients/clientConstants';
import { Badge, Button, Card, Input, PageHeader, Pagination, Select, Table } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDate } from '@/utils/date';

const DEFAULT_PAGE = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0
};

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function ClientsPage() {
  const [clientsPage, setClientsPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    active: '',
    clientType: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    active: '',
    clientType: ''
  });

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getClients({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        clientType: appliedFilters.clientType || undefined,
        active: appliedFilters.active === '' ? undefined : appliedFilters.active === 'true'
      });
      setClientsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const columns = useMemo(
    () => [
      {
        key: 'displayName',
        header: 'Client',
        render: (_, row) => (
          <div>
            <p className="font-medium text-slate-900">{getClientDisplayName(row)}</p>
            <p className="text-xs text-slate-500">{row.contactPerson || '-'}</p>
          </div>
        )
      },
      {
        key: 'clientType',
        header: 'Type',
        render: (value) => getClientTypeLabel(value)
      },
      { key: 'phone', header: 'Telephone' },
      { key: 'email', header: 'E-mail', render: (value) => value || '-' },
      {
        key: 'active',
        header: 'Statut',
        render: (value) => (
          <Badge variant={value ? 'success' : 'warning'}>{value ? 'Actif' : 'Inactif'}</Badge>
        )
      },
      {
        key: 'createdAt',
        header: 'Creation',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/clients/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/clients/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
          </div>
        )
      }
    ],
    []
  );

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPageIndex(0);
    setAppliedFilters({ ...pendingFilters });
  };

  const clearFilters = () => {
    const empty = { search: '', active: '', clientType: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        subtitle="Gestion complete des clients de SenTechCare One."
        actions={
          <Link to="/clients/new">
            <Button>Ajouter un client</Button>
          </Link>
        }
      />

      <Card title="Recherche et filtres" padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Nom, entreprise, telephone, e-mail..."
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Type de client"
            options={[{ value: '', label: 'Tous les types' }, ...CLIENT_TYPE_OPTIONS]}
            value={pendingFilters.clientType}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientType: event.target.value }))}
          />

          <Select
            label="Statut"
            options={ACTIVE_FILTER_OPTIONS}
            value={pendingFilters.active}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, active: event.target.value }))}
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
        data={clientsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun client trouve"
        emptyDescription="Aucun client ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={clientsPage.number}
          totalPages={clientsPage.totalPages}
          totalElements={clientsPage.totalElements}
          pageSize={clientsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
