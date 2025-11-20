import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadQuotePdf, getQuotes } from '@/api/quoteApi';
import { getClients } from '@/api/clientApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getQuoteStatusBadgeVariant,
  getQuoteStatusLabel,
  QUOTE_STATUS_OPTIONS
} from '@/features/quotes/quoteConstants';
import { downloadBlob } from '@/utils/fileDownload';
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

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function QuotesPage() {
  const [quotesPage, setQuotesPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [downloadingQuoteId, setDownloadingQuoteId] = useState(null);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: '',
    clientId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    clientId: '',
    dateFrom: '',
    dateTo: ''
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

  const loadQuotes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getQuotes({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        status: appliedFilters.status || undefined,
        clientId: appliedFilters.clientId || undefined,
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined
      });

      setQuotesPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des devis.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  const handleDownloadPdf = async (quoteId) => {
    setDownloadingQuoteId(quoteId);

    try {
      const file = await downloadQuotePdf(quoteId);
      downloadBlob(file.blob, file.filename);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de telecharger le PDF du devis.'));
    } finally {
      setDownloadingQuoteId(null);
    }
  };

  const columns = useMemo(
    () => [
      { key: 'reference', header: 'Reference' },
      {
        key: 'clientId',
        header: 'Client',
        render: (value) => clientsMap[value] || `Client #${value}`
      },
      {
        key: 'quoteDate',
        header: 'Date',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getQuoteStatusBadgeVariant(value)}>
            {getQuoteStatusLabel(value)}
          </Badge>
        )
      },
      {
        key: 'subtotal',
        header: 'Sous-total',
        render: (value) => formatAmount(value)
      },
      {
        key: 'discountAmount',
        header: 'Remise',
        render: (value) => formatAmount(value)
      },
      {
        key: 'totalAmount',
        header: 'Total',
        render: (value) => formatAmount(value)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/quotes/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/quotes/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleDownloadPdf(row.id)}
              loading={downloadingQuoteId === row.id}
            >
              PDF
            </Button>
          </div>
        )
      }
    ],
    [clientsMap, downloadingQuoteId]
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
      clientId: '',
      dateFrom: '',
      dateTo: ''
    };

    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Devis"
        subtitle="Gestion des devis clients et suivi commercial."
        actions={
          <Link to="/quotes/new">
            <Button>Nouveau devis</Button>
          </Link>
        }
      />

      <Card title="Filtres" subtitle="Recherche par reference, client, statut et periode." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Reference ou notes"
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Statut"
            options={[{ value: '', label: 'Tous les statuts' }, ...QUOTE_STATUS_OPTIONS]}
            value={pendingFilters.status}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, status: event.target.value }))}
          />

          <Select
            label="Client"
            options={[{ value: '', label: 'Tous les clients' }, ...clientsOptions]}
            value={pendingFilters.clientId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientId: event.target.value }))}
          />

          <Input
            label="Date debut"
            type="date"
            value={pendingFilters.dateFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
          />

          <Input
            label="Date fin"
            type="date"
            value={pendingFilters.dateTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
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
        data={quotesPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun devis trouve"
        emptyDescription="Aucun devis ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={quotesPage.number}
          totalPages={quotesPage.totalPages}
          totalElements={quotesPage.totalElements}
          pageSize={quotesPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
