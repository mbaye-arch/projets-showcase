import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClientById } from '@/api/clientApi';
import {
  deleteInvoice,
  downloadInvoicePdf,
  getInvoiceById,
  updateInvoice
} from '@/api/invoiceApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getInvoiceStatusBadgeVariant,
  getInvoiceStatusLabel,
  INVOICE_STATUS_OPTIONS
} from '@/features/invoices/invoiceConstants';
import { toInvoiceRequestFromResponse } from '@/features/invoices/invoiceFormSchema';
import { downloadBlob } from '@/utils/fileDownload';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDate, formatApiDateTime } from '@/utils/date';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  Select,
  Table
} from '@/components/ui';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [clientName, setClientName] = useState('-');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [statusValue, setStatusValue] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoice = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInvoiceById(id);
      setInvoice(response);
      setStatusValue(response?.status || '');

      if (response?.clientId) {
        try {
          const clientResponse = await getClientById(response.clientId);
          setClientName(getClientDisplayName(clientResponse));
        } catch {
          setClientName(`Client #${response.clientId}`);
        }
      } else {
        setClientName('-');
      }
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const lineColumns = useMemo(
    () => [
      { key: 'description', header: 'Description' },
      {
        key: 'quantity',
        header: 'Quantite',
        render: (value) => formatAmount(value)
      },
      {
        key: 'unitPrice',
        header: 'Prix unitaire',
        render: (value) => formatAmount(value)
      },
      {
        key: 'lineTotal',
        header: 'Total ligne',
        render: (value) => formatAmount(value)
      }
    ],
    []
  );

  const handleStatusChange = async () => {
    if (!invoice || !statusValue || statusValue === invoice.status) {
      return;
    }

    setStatusUpdateError(null);
    setIsStatusUpdating(true);

    try {
      const payload = toInvoiceRequestFromResponse(invoice, { status: statusValue });
      const updated = await updateInvoice(invoice.id, payload);
      setInvoice(updated);
      setStatusValue(updated.status || statusValue);
    } catch (error) {
      setStatusUpdateError(parseErrorMessage(error));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice?.id) {
      return;
    }

    setDownloadError(null);
    setIsDownloadingPdf(true);

    try {
      const file = await downloadInvoicePdf(invoice.id);
      downloadBlob(file.blob, file.filename);
    } catch (error) {
      setDownloadError(parseErrorMessage(error));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice?.id) {
      return;
    }

    const confirmed = window.confirm('Confirmer la suppression de cette facture ?');
    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteInvoice(invoice.id);
      navigate('/invoices', { replace: true });
    } catch (error) {
      setDeleteError(parseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <EmptyState
        title="Impossible de charger cette facture"
        description={errorMessage}
        action={
          <Button type="button" onClick={loadInvoice}>
            Reessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={invoice.reference || `Facture #${invoice.id}`}
        subtitle="Detail de la facture"
        breadcrumbs={[
          { label: 'Factures', to: '/invoices' },
          { label: 'Detail facture' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/invoices/${invoice.id}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            <Link to={`/payments/new?invoiceId=${invoice.id}&fromInvoice=true`}>
              <Button type="button" variant="secondary">
                Enregistrer paiement
              </Button>
            </Link>
            <Button type="button" variant="secondary" onClick={handleDownloadPdf} loading={isDownloadingPdf}>
              Telecharger PDF
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Supprimer
            </Button>
          </div>
        }
      />

      {deleteError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {deleteError}
          </p>
        </Card>
      ) : null}

      {downloadError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {downloadError}
          </p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Informations" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Reference:</span> {invoice.reference || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Client:</span>{' '}
              <Link to={`/clients/${invoice.clientId}`} className="text-brand-700 hover:underline">
                {clientName}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-900">Date emission:</span> {formatApiDate(invoice.issueDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date echeance:</span> {formatApiDate(invoice.dueDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Cree le:</span> {formatApiDateTime(invoice.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Mise a jour:</span> {formatApiDateTime(invoice.updatedAt)}
            </p>
          </div>
        </Card>

        <Card title="Statut" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Statut actuel:</span>{' '}
              <Badge variant={getInvoiceStatusBadgeVariant(invoice.status)}>
                {getInvoiceStatusLabel(invoice.status)}
              </Badge>
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-2">
                <Select
                  label="Changer le statut"
                  options={INVOICE_STATUS_OPTIONS}
                  helperText="PAID et PARTIALLY_PAID sont recalcules automatiquement selon les paiements."
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusChange}
                  loading={isStatusUpdating}
                  disabled={!statusValue || statusValue === invoice.status}
                >
                  Mettre a jour
                </Button>
              </div>
              {statusUpdateError ? <p className="mt-2 text-xs text-rose-700">{statusUpdateError}</p> : null}
            </div>
          </div>
        </Card>

        <Card title="Montants" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Total:</span> {formatAmount(invoice.totalAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Montant paye:</span> {formatAmount(invoice.paidAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Reste a payer:</span> {formatAmount(invoice.remainingAmount)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Lignes de facture" padding="none">
        <Table
          columns={lineColumns}
          data={invoice.items || []}
          rowKey={(row, index) => row.id || index}
          emptyTitle="Aucune ligne"
          emptyDescription="Cette facture ne contient aucune ligne."
        />
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Note methode de paiement" padding="sm">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.paymentMethodNote || 'Aucune note.'}</p>
        </Card>

        <Card title="Notes" padding="sm">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{invoice.notes || 'Aucune note.'}</p>
        </Card>
      </div>
    </div>
  );
}
