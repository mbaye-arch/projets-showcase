import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { getEquipments } from '@/api/equipmentApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_SOURCE_OPTIONS,
  EQUIPMENT_STATUS_OPTIONS,
  getEquipmentCategoryBadgeVariant,
  getEquipmentCategoryLabel,
  getEquipmentSourceLabel,
  getEquipmentStatusBadgeVariant,
  getEquipmentStatusLabel
} from '@/features/equipments/equipmentConstants';
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

function parseErrorMessage(error, fallback) {
  return extractApiErrorMessage(error, fallback || 'Une erreur est survenue.');
}

export default function EquipmentsPage() {
  const [equipmentsPage, setEquipmentsPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    clientId: '',
    category: '',
    status: '',
    source: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    clientId: '',
    category: '',
    status: '',
    source: ''
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

  const loadEquipments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getEquipments({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        clientId: appliedFilters.clientId || undefined,
        category: appliedFilters.category || undefined,
        status: appliedFilters.status || undefined,
        source: appliedFilters.source || undefined
      });
      setEquipmentsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des materiels.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  const columns = useMemo(
    () => [
      {
        key: 'clientId',
        header: 'Client',
        render: (value) => clientsMap[value] || `Client #${value}`
      },
      {
        key: 'category',
        header: 'Categorie',
        render: (value) => (
          <Badge variant={getEquipmentCategoryBadgeVariant(value)}>
            {getEquipmentCategoryLabel(value)}
          </Badge>
        )
      },
      { key: 'brand', header: 'Marque', render: (value) => value || '-' },
      { key: 'model', header: 'Modele', render: (value) => value || '-' },
      { key: 'serialNumber', header: 'Numero de serie', render: (value) => value || '-' },
      { key: 'installationDate', header: 'Installation', render: (value) => formatApiDate(value) },
      { key: 'warrantyStartDate', header: 'Garantie debut', render: (value) => formatApiDate(value) },
      { key: 'warrantyEndDate', header: 'Garantie fin', render: (value) => formatApiDate(value) },
      {
        key: 'status',
        header: 'Etat',
        render: (value) => (
          <Badge variant={getEquipmentStatusBadgeVariant(value)}>
            {getEquipmentStatusLabel(value)}
          </Badge>
        )
      },
      { key: 'source', header: 'Source', render: (value) => getEquipmentSourceLabel(value) },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/equipments/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/equipments/${row.id}/edit`}
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
    const empty = { search: '', clientId: '', category: '', status: '', source: '' };
    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Materiels installes"
        subtitle="Gestion des equipements installes chez les clients."
        actions={
          <Link to="/equipments/new">
            <Button>Ajouter un materiel</Button>
          </Link>
        }
      />

      <Card title="Filtres" subtitle="Filtrer par client, categorie, etat ou recherche libre." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-6" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Marque, modele, numero de serie..."
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Client"
            options={[{ value: '', label: 'Tous les clients' }, ...clientsOptions]}
            value={pendingFilters.clientId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientId: event.target.value }))}
          />

          <Select
            label="Categorie"
            options={[{ value: '', label: 'Toutes les categories' }, ...EQUIPMENT_CATEGORY_OPTIONS]}
            value={pendingFilters.category}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, category: event.target.value }))}
          />

          <Select
            label="Etat"
            options={[{ value: '', label: 'Tous les etats' }, ...EQUIPMENT_STATUS_OPTIONS]}
            value={pendingFilters.status}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, status: event.target.value }))}
          />

          <Select
            label="Source"
            options={[{ value: '', label: 'Toutes les sources' }, ...EQUIPMENT_SOURCE_OPTIONS]}
            value={pendingFilters.source}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, source: event.target.value }))}
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
        data={equipmentsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun materiel trouve"
        emptyDescription="Aucun materiel ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={equipmentsPage.number}
          totalPages={equipmentsPage.totalPages}
          totalElements={equipmentsPage.totalElements}
          pageSize={equipmentsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
