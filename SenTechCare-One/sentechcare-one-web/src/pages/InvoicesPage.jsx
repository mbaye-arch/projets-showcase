import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { downloadInvoicePdf, getInvoices } from '@/api/invoiceApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getInvoiceStatusBadgeVariant,
  getInvoiceStatusLabel,
  INVOICE_STATUS_OPTIONS
} from '@/features/invoices/invoiceConstants';
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

export default function InvoicesPage() {
  const [invoicesPage, setInvoicesPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    status: '',
    clientId: '',
    issueFrom: '',
    issueTo: '',
    dueFrom: '',
    dueTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    status: '',
    clientId: '',
    issueFrom: '',
    issueTo: '',
    dueFrom: '',
    dueTo: ''
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

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInvoices({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        status: appliedFilters.status || undefined,
        clientId: appliedFilters.clientId || undefined,
        issueFrom: appliedFilters.issueFrom || undefined,
        issueTo: appliedFilters.issueTo || undefined,
        dueFrom: appliedFilters.dueFrom || undefined,
        dueTo: appliedFilters.dueTo || undefined
      });

      setInvoicesPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des factures.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleDownloadPdf = async (invoiceId) => {
    setDownloadingInvoiceId(invoiceId);

    try {
      const file = await downloadInvoicePdf(invoiceId);
      downloadBlob(file.blob, file.filename);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de telecharger le PDF de la facture.'));
    } finally {
      setDownloadingInvoiceId(null);
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
        key: 'issueDate',
        header: 'Emission',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'dueDate',
        header: 'Echeance',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'status',
        header: 'Statut',
        render: (value) => (
          <Badge variant={getInvoiceStatusBadgeVariant(value)}>
            {getInvoiceStatusLabel(value)}
          </Badge>
        )
      },
      {
        key: 'totalAmount',
        header: 'Total',
        render: (value) => formatAmount(value)
      },
      {
        key: 'paidAmount',
        header: 'Paye',
        render: (value) => formatAmount(value)
      },
      {
        key: 'remainingAmount',
        header: 'Reste',
        render: (value) => formatAmount(value)
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/invoices/${row.id}`}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voir
            </Link>
            <Link
              to={`/invoices/${row.id}/edit`}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"
            >
              Modifier
            </Link>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleDownloadPdf(row.id)}
              loading={downloadingInvoiceId === row.id}
            >
              PDF
            </Button>
          </div>
        )
      }
    ],
    [clientsMap, downloadingInvoiceId]
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
      issueFrom: '',
      issueTo: '',
      dueFrom: '',
      dueTo: ''
    };

    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        subtitle="Suivi des factures, paiements et reste a payer."
        actions={
          <Link to="/invoices/new">
            <Button>Nouvelle facture</Button>
          </Link>
        }
      />

      <Card title="Filtres" subtitle="Filtrer par reference, client, statut et dates." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-7" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Reference ou notes"
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Statut"
            options={[{ value: '', label: 'Tous les statuts' }, ...INVOICE_STATUS_OPTIONS]}
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
            label="Emission du"
            type="date"
            value={pendingFilters.issueFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, issueFrom: event.target.value }))}
          />

          <Input
            label="Emission au"
            type="date"
            value={pendingFilters.issueTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, issueTo: event.target.value }))}
          />

          <Input
            label="Echeance du"
            type="date"
            value={pendingFilters.dueFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, dueFrom: event.target.value }))}
          />

          <Input
            label="Echeance au"
            type="date"
            value={pendingFilters.dueTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, dueTo: event.target.value }))}
          />

          <div className="col-span-1 flex items-end gap-2 xl:col-span-7">
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
        data={invoicesPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucune facture trouvee"
        emptyDescription="Aucune facture ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={invoicesPage.number}
          totalPages={invoicesPage.totalPages}
          totalElements={invoicesPage.totalElements}
          pageSize={invoicesPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
