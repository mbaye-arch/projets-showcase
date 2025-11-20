import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClients } from '@/api/clientApi';
import { getInvoices } from '@/api/invoiceApi';
import {
  downloadPaymentReceiptPdf,
  getPayments
} from '@/api/paymentApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getPaymentMethodBadgeVariant,
  getPaymentMethodLabel,
  PAYMENT_METHOD_OPTIONS
} from '@/features/payments/paymentConstants';
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

export default function PaymentsPage() {
  const [paymentsPage, setPaymentsPage] = useState(DEFAULT_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [downloadingPaymentId, setDownloadingPaymentId] = useState(null);

  const [clientsOptions, setClientsOptions] = useState([]);
  const [invoicesOptions, setInvoicesOptions] = useState([]);
  const [clientsMap, setClientsMap] = useState({});
  const [invoicesMap, setInvoicesMap] = useState({});

  const [pendingFilters, setPendingFilters] = useState({
    search: '',
    invoiceId: '',
    clientId: '',
    method: '',
    paymentDateFrom: '',
    paymentDateTo: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    invoiceId: '',
    clientId: '',
    method: '',
    paymentDateFrom: '',
    paymentDateTo: ''
  });

  const loadReferences = useCallback(async () => {
    try {
      const [clientsResponse, invoicesResponse] = await Promise.all([
        getClients({
          page: 0,
          size: 300,
          sort: 'createdAt,desc'
        }),
        getInvoices({
          page: 0,
          size: 300,
          sort: 'createdAt,desc'
        })
      ]);

      const clientsContent = clientsResponse?.content ?? [];
      const invoicesContent = invoicesResponse?.content ?? [];

      const nextClientsMap = clientsContent.reduce((acc, client) => {
        acc[client.id] = getClientDisplayName(client);
        return acc;
      }, {});
      const nextInvoicesMap = invoicesContent.reduce((acc, invoice) => {
        acc[invoice.id] = invoice.reference || `Facture #${invoice.id}`;
        return acc;
      }, {});

      setClientsOptions(
        clientsContent.map((client) => ({
          value: String(client.id),
          label: getClientDisplayName(client)
        }))
      );
      setInvoicesOptions(
        invoicesContent.map((invoice) => ({
          value: String(invoice.id),
          label: invoice.reference || `Facture #${invoice.id}`
        }))
      );
      setClientsMap(nextClientsMap);
      setInvoicesMap(nextInvoicesMap);
    } catch {
      setClientsOptions([]);
      setInvoicesOptions([]);
      setClientsMap({});
      setInvoicesMap({});
    }
  }, []);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getPayments({
        page: pageIndex,
        size: 10,
        sort: 'createdAt,desc',
        search: appliedFilters.search || undefined,
        invoiceId: appliedFilters.invoiceId || undefined,
        clientId: appliedFilters.clientId || undefined,
        method: appliedFilters.method || undefined,
        paymentDateFrom: appliedFilters.paymentDateFrom || undefined,
        paymentDateTo: appliedFilters.paymentDateTo || undefined
      });

      setPaymentsPage({ ...DEFAULT_PAGE, ...response });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de recuperer la liste des paiements.'));
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, appliedFilters]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleDownloadReceipt = async (paymentId) => {
    setDownloadingPaymentId(paymentId);

    try {
      const file = await downloadPaymentReceiptPdf(paymentId);
      downloadBlob(file.blob, file.filename);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error, 'Impossible de telecharger le recu de paiement.'));
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'paymentDate',
        header: 'Date',
        render: (value) => formatApiDate(value)
      },
      {
        key: 'amount',
        header: 'Montant',
        render: (value) => formatAmount(value)
      },
      {
        key: 'method',
        header: 'Mode',
        render: (value) => (
          <Badge variant={getPaymentMethodBadgeVariant(value)}>
            {getPaymentMethodLabel(value)}
          </Badge>
        )
      },
      {
        key: 'paymentReference',
        header: 'Reference',
        render: (value) => value || '-'
      },
      {
        key: 'clientId',
        header: 'Client',
        render: (value) => clientsMap[value] || `Client #${value}`
      },
      {
        key: 'invoiceId',
        header: 'Facture',
        render: (value) => (
          <Link to={`/invoices/${value}`} className="text-brand-700 hover:underline">
            {invoicesMap[value] || `Facture #${value}`}
          </Link>
        )
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (_, row) => (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => handleDownloadReceipt(row.id)}
            loading={downloadingPaymentId === row.id}
          >
            Recu PDF
          </Button>
        )
      }
    ],
    [clientsMap, invoicesMap, downloadingPaymentId]
  );

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setPageIndex(0);
    setAppliedFilters({ ...pendingFilters });
  };

  const clearFilters = () => {
    const empty = {
      search: '',
      invoiceId: '',
      clientId: '',
      method: '',
      paymentDateFrom: '',
      paymentDateTo: ''
    };

    setPendingFilters(empty);
    setAppliedFilters(empty);
    setPageIndex(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        subtitle="Suivi des encaissements clients."
        actions={
          <Link to="/payments/new">
            <Button>Ajouter un paiement</Button>
          </Link>
        }
      />

      <Card title="Filtres" subtitle="Filtrer par facture, client, mode de paiement et date." padding="md">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6" onSubmit={handleFilterSubmit}>
          <Input
            label="Recherche"
            placeholder="Reference ou notes"
            value={pendingFilters.search}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, search: event.target.value }))}
          />

          <Select
            label="Facture"
            options={[{ value: '', label: 'Toutes les factures' }, ...invoicesOptions]}
            value={pendingFilters.invoiceId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, invoiceId: event.target.value }))}
          />

          <Select
            label="Client"
            options={[{ value: '', label: 'Tous les clients' }, ...clientsOptions]}
            value={pendingFilters.clientId}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, clientId: event.target.value }))}
          />

          <Select
            label="Mode de paiement"
            options={[{ value: '', label: 'Tous les modes' }, ...PAYMENT_METHOD_OPTIONS]}
            value={pendingFilters.method}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, method: event.target.value }))}
          />

          <Input
            label="Date du"
            type="date"
            value={pendingFilters.paymentDateFrom}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, paymentDateFrom: event.target.value }))}
          />

          <Input
            label="Date au"
            type="date"
            value={pendingFilters.paymentDateTo}
            onChange={(event) => setPendingFilters((prev) => ({ ...prev, paymentDateTo: event.target.value }))}
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
        data={paymentsPage.content}
        rowKey="id"
        isLoading={isLoading}
        emptyTitle="Aucun paiement trouve"
        emptyDescription="Aucun paiement ne correspond aux filtres selectionnes."
      />

      <Card padding="sm">
        <Pagination
          page={paymentsPage.number}
          totalPages={paymentsPage.totalPages}
          totalElements={paymentsPage.totalElements}
          pageSize={paymentsPage.size || 10}
          onPageChange={(nextPage) => setPageIndex(nextPage)}
        />
      </Card>
    </div>
  );
}
