import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { getTicketTechnicians, getTickets } from '@/api/ticketApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  TICKET_CHANNEL_OPTIONS,
  getTechnicianDisplayName,
  getTicketChannelBadgeVariant,
  getTicketChannelLabel,
  getTicketPriorityBadgeVariant,
  getTicketPriorityLabel,
  getTicketStatusBadgeVariant,
  getTicketStatusLabel,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS
} from '@/features/tickets/ticketConstants';
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

export default function TicketsPage() {
  const [ticketsPage, setTicketsPage] = useState(DEFAULT_PAGE);
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
    channel: '',
    clientId: '',
    assignedTechnicianId: '',
    createdFrom: '',
    createdTo: '',
    resolvedFrom: '',
    resolvedTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    priority: '',
    channel: '',
    clientId: '',
    assignedTechnicianId: '',
    createdFrom: '',
    createdTo: '',
    resolvedFrom: '',
    resolvedTo: ''
  });

  const loadReferences = useCallback(async () => {
    try {
      const [clientsResponse, techniciansResponse] = await Promise.all([
        getClients({ page: 0, size: 300, sort: 'createdAt,desc' }),
        getTicketTechnicians({ page: 0, size: 300, activeOnly: true, sort: 'createdAt,desc' })
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

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getTickets({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        status: appliedFilters.status || undefined,
        priority: appliedFilters.priority || undefined,
        channel: appliedFilters.channel || undefined,
        clientId: appliedFilters.clientId || undefined,
        assignedTechnicianId: appliedFilters.assignedTechnicianId || undefined,
        createdFrom: appliedFilters.createdFrom || undefined,
        createdTo: appliedFilters.createdTo || undefined,
        resolvedFrom: appliedFilters.resolvedFrom || undefined,
        resolvedTo: appliedFilters.resolvedTo || undefined
      });
      setTicketsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des tickets.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

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
      { key: 'subject', header: 'Sujet' },
      {
        key: 'channel',
        header: 'Canal',
        render: (value) => (
          <Badge variant={getTicketChannelBadgeVariant(value)}>{getTicketChannelLabel(value)}</Badge>
        )
      },
      {
        key: 'priority',
        header: 'Priorite',
        render: (value) => (
          <Badge variant={getTicketPriorityBadgeVariant(value)}>{getTicketPriorityLabel(value)}</Badge>
        )
      },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getTicketStatusBadgeVariant(value)}>{getTicketStatusLabel(value)}</Badge>
        )
      },
      {
        key: 'createdAt',
        header: 'Date creation',
        render: (value) => formatDateTime(value)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/tickets/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/tickets/${row.id}/edit`}
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
      channel: '',
      clientId: '',
      assignedTechnicianId: '',
      createdFrom: '',
      createdTo: '',
      resolvedFrom: '',
      resolvedTo: ''
    };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tickets support"
        subtitle="Suivi des demandes support clients."
        actions={
          <Link to="/tickets/new">
            <Button>Ajouter un ticket</Button>
          </Link>
        }
      />

      <Card
        title="Filtres"
        subtitle="Filtrer par statut, priorite, canal, client, technicien, periodes et recherche."
        padding="md"
      >
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Sujet, description, commentaire..."
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Statut"
            options={[{ value: '', label: 'Tous les statuts' }, ...TICKET_STATUS_OPTIONS]}
            value={pendingFilters.status}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, status: event.target.value }))}
          />

          <Select
            label="Priorite"
            options={[{ value: '', label: 'Toutes les priorites' }, ...TICKET_PRIORITY_OPTIONS]}
            value={pendingFilters.priority}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, priority: event.target.value }))}
          />

          <Select
            label="Canal"
            options={[{ value: '', label: 'Tous les canaux' }, ...TICKET_CHANNEL_OPTIONS]}
            value={pendingFilters.channel}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, channel: event.target.value }))}
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
            label="Cree du"
            type="datetime-local"
            value={pendingFilters.createdFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, createdFrom: event.target.value }))}
          />

          <Input
            label="Cree au"
            type="datetime-local"
            value={pendingFilters.createdTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, createdTo: event.target.value }))}
          />

          <Input
            label="Resolus du"
            type="datetime-local"
            value={pendingFilters.resolvedFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, resolvedFrom: event.target.value }))}
          />

          <Input
            label="Resolus au"
            type="datetime-local"
            value={pendingFilters.resolvedTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, resolvedTo: event.target.value }))}
          />

          <div className="col-span-1 flex items-end gap-2 xl:col-span-5">
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
        data={ticketsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun ticket trouve"
        emptyDescription="Aucun ticket ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={ticketsPage.number}
          totalPages={ticketsPage.totalPages}
          totalElements={ticketsPage.totalElements}
          pageSize={ticketsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
