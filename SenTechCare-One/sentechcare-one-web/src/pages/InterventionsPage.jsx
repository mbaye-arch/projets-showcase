import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { getInterventions, getTechnicians } from '@/api/interventionApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getInterventionStatusBadgeVariant,
  getInterventionStatusLabel,
  getInterventionTypeLabel,
  getPriorityBadgeVariant,
  getPriorityLevelLabel,
  getTechnicianDisplayName,
  INTERVENTION_STATUS_OPTIONS,
  INTERVENTION_TYPE_OPTIONS,
  PRIORITY_LEVEL_OPTIONS
} from '@/features/interventions/interventionConstants';
import { Badge, Button, Card, Input, PageHeader, Pagination, Select, Table } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

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

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default function InterventionsPage() {
  const [interventionsPage, setInterventionsPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [techniciansOptions, setTechniciansOptions] = useState([]);
  const [techniciansMap, setTechniciansMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: '',
    clientId: '',
    assignedTechnicianId: '',
    plannedFrom: '',
    plannedTo: '',
    actualFrom: '',
    actualTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    priority: '',
    type: '',
    clientId: '',
    assignedTechnicianId: '',
    plannedFrom: '',
    plannedTo: '',
    actualFrom: '',
    actualTo: ''
  });

  const loadReferences = useCallback(async () => {
    try {
      const [clientsResponse, techniciansResponse] = await Promise.all([
        getClients({ page: 0, size: 300, sort: 'createdAt,desc' }),
        getTechnicians({ page: 0, size: 300, activeOnly: true, sort: 'createdAt,desc' })
      ]);

      const clientsContent = clientsResponse?.content ?? [];
      const techniciansContent = techniciansResponse?.content ?? [];

      setClientsOptions(
        clientsContent.map((client) => ({
          value: String(client.id),
          label: getClientDisplayName(client)
        }))
      );
      setClientsMap(
        clientsContent.reduce((acc, client) => {
          acc[client.id] = getClientDisplayName(client);
          return acc;
        }, {})
      );

      setTechniciansOptions(
        techniciansContent.map((user) => ({
          value: String(user.id),
          label: getTechnicianDisplayName(user)
        }))
      );
      setTechniciansMap(
        techniciansContent.reduce((acc, user) => {
          acc[user.id] = getTechnicianDisplayName(user);
          return acc;
        }, {})
      );
    } catch {
      setClientsOptions([]);
      setClientsMap({});
      setTechniciansOptions([]);
      setTechniciansMap({});
    }
  }, []);

  const loadInterventions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInterventions({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        status: appliedFilters.status || undefined,
        priority: appliedFilters.priority || undefined,
        type: appliedFilters.type || undefined,
        clientId: appliedFilters.clientId || undefined,
        assignedTechnicianId: appliedFilters.assignedTechnicianId || undefined,
        plannedFrom: appliedFilters.plannedFrom || undefined,
        plannedTo: appliedFilters.plannedTo || undefined,
        actualFrom: appliedFilters.actualFrom || undefined,
        actualTo: appliedFilters.actualTo || undefined
      });
      setInterventionsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des interventions.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  const columns = useMemo(
    () => [
      {
        key: 'clientId',
        header: 'Client',
        render: (value) => clientsMap[value] || `Client #${value}`
      },
      {
        key: 'assignedTechnicianId',
        header: 'Technicien',
        render: (_, row) => {
          const fullName = [row.assignedTechnicianFirstName, row.assignedTechnicianLastName]
            .filter(Boolean)
            .join(' ')
            .trim();
          if (fullName) {
            return fullName;
          }
          if (row.assignedTechnicianId) {
            return techniciansMap[row.assignedTechnicianId] || `Technicien #${row.assignedTechnicianId}`;
          }
          return 'Non assigne';
        }
      },
      { key: 'type', header: 'Type', render: (value) => getInterventionTypeLabel(value) },
      { key: 'plannedDate', header: 'Date prevue', render: (value) => formatDateTime(value) },
      { key: 'actualDate', header: 'Date reelle', render: (value) => formatDateTime(value) },
      {
        key: 'priority',
        header: 'Priorite',
        render: (value) => (
          <Badge variant={getPriorityBadgeVariant(value)}>{getPriorityLevelLabel(value)}</Badge>
        )
      },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getInterventionStatusBadgeVariant(value)}>
            {getInterventionStatusLabel(value)}
          </Badge>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/interventions/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/interventions/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
          </div>
        )
      }
    ],
    [clientsMap, techniciansMap]
  );

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPageIndex(0);
    setAppliedFilters({ ...pendingFilters });
  };

  const clearFilters = () => {
    const empty = {
      search: '',
      status: '',
      priority: '',
      type: '',
      clientId: '',
      assignedTechnicianId: '',
      plannedFrom: '',
      plannedTo: '',
      actualFrom: '',
      actualTo: ''
    };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interventions"
        subtitle="Suivi des interventions techniques clients."
        actions={
          <Link to="/interventions/new">
            <Button>Ajouter une intervention</Button>
          </Link>
        }
      />

      <Card
        title="Filtres"
        subtitle="Filtrer par statut, priorite, technicien, client, type, periode planifiee/reelle et recherche."
        padding="md"
      >
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Probleme, diagnostic, solution..."
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Statut"
            options={[{ value: '', label: 'Tous les statuts' }, ...INTERVENTION_STATUS_OPTIONS]}
            value={pendingFilters.status}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, status: event.target.value }))}
          />

          <Select
            label="Priorite"
            options={[{ value: '', label: 'Toutes les priorites' }, ...PRIORITY_LEVEL_OPTIONS]}
            value={pendingFilters.priority}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, priority: event.target.value }))}
          />

          <Select
            label="Type"
            options={[{ value: '', label: 'Tous les types' }, ...INTERVENTION_TYPE_OPTIONS]}
            value={pendingFilters.type}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, type: event.target.value }))}
          />

          <Select
            label="Client"
            options={[{ value: '', label: 'Tous les clients' }, ...clientsOptions]}
            value={pendingFilters.clientId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientId: event.target.value }))}
          />

          <Select
            label="Technicien"
            options={[{ value: '', label: 'Tous les techniciens' }, ...techniciansOptions]}
            value={pendingFilters.assignedTechnicianId}
            onChange={(event) =>
              setPendingFilters((prev) => ({ ...prev, assignedTechnicianId: event.target.value }))
            }
          />

          <Input
            label="Date prevue du"
            type="datetime-local"
            value={pendingFilters.plannedFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, plannedFrom: event.target.value }))}
          />

          <Input
            label="Date prevue au"
            type="datetime-local"
            value={pendingFilters.plannedTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, plannedTo: event.target.value }))}
          />

          <Input
            label="Date reelle du"
            type="datetime-local"
            value={pendingFilters.actualFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, actualFrom: event.target.value }))}
          />

          <Input
            label="Date reelle au"
            type="datetime-local"
            value={pendingFilters.actualTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, actualTo: event.target.value }))}
          />

          <div className="col-span-1 flex items-end gap-2 xl:col-span-6">
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
        data={interventionsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucune intervention trouvee"
        emptyDescription="Aucune intervention ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={interventionsPage.number}
          totalPages={interventionsPage.totalPages}
          totalElements={interventionsPage.totalElements}
          pageSize={interventionsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
