import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClientById } from '@/api/clientApi';
import {
  convertQuoteToInvoice,
  deleteQuote,
  downloadQuotePdf,
  getQuoteById,
  updateQuote
} from '@/api/quoteApi';
import { APP_CONFIG } from '@/config/appConfig';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getQuoteStatusBadgeVariant,
  getQuoteStatusLabel,
  QUOTE_STATUS_OPTIONS
} from '@/features/quotes/quoteConstants';
import { toQuoteRequestFromResponse } from '@/features/quotes/quoteFormSchema';
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

export default function QuoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isQuoteConversionEnabled = APP_CONFIG.enableQuoteConversion;
  const [isQuoteConversionAvailable, setIsQuoteConversionAvailable] = useState(isQuoteConversionEnabled);

  const [quote, setQuote] = useState(null);
  const [clientName, setClientName] = useState('-');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [statusValue, setStatusValue] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [conversionSuccessMessage, setConversionSuccessMessage] = useState(null);

  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuote = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getQuoteById(id);
      setQuote(response);
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
    loadQuote();
  }, [loadQuote]);

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
    if (!quote || !statusValue || statusValue === quote.status) {
      return;
    }

    setStatusUpdateError(null);
    setIsStatusUpdating(true);

    try {
      const payload = toQuoteRequestFromResponse(quote, { status: statusValue });
      const updated = await updateQuote(quote.id, payload);
      setQuote(updated);
      setStatusValue(updated.status || statusValue);
    } catch (error) {
      setStatusUpdateError(parseErrorMessage(error));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!quote?.id) {
      return;
    }

    setDownloadError(null);
    setIsDownloadingPdf(true);

    try {
      const file = await downloadQuotePdf(quote.id);
      downloadBlob(file.blob, file.filename);
    } catch (error) {
      setDownloadError(parseErrorMessage(error));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quote?.id) {
      return;
    }

    const confirmed = window.confirm('Confirmer la conversion de ce devis en facture ?');
    if (!confirmed) {
      return;
    }

    setConversionError(null);
    setConversionSuccessMessage(null);
    setIsConverting(true);

    try {
      const response = await convertQuoteToInvoice(quote.id);

      if (response?.invoiceId) {
        setConversionSuccessMessage(`Devis converti en facture #${response.invoiceId}.`);
        navigate(`/invoices/${response.invoiceId}`);
        return;
      }

      if (response?.message) {
        setConversionSuccessMessage(response.message);
      } else {
        setConversionSuccessMessage('Devis converti en facture.');
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        setConversionError('Conversion en facture indisponible sur le backend actuel.');
        setIsQuoteConversionAvailable(false);
      } else {
        setConversionError(parseErrorMessage(error));
      }
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!quote?.id) {
      return;
    }

    const confirmed = window.confirm('Confirmer la suppression de ce devis ?');
    if (!confirmed) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteQuote(quote.id);
      navigate('/quotes', { replace: true });
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
        title="Impossible de charger ce devis"
        description={errorMessage}
        action={
          <Button type="button" onClick={loadQuote}>
            Reessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={quote.reference || `Devis #${quote.id}`}
        subtitle="Detail du devis client"
        breadcrumbs={[
          { label: 'Devis', to: '/quotes' },
          { label: 'Detail devis' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/quotes/${quote.id}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            <Button type="button" variant="secondary" onClick={handleDownloadPdf} loading={isDownloadingPdf}>
              Telecharger PDF
            </Button>
            {isQuoteConversionAvailable ? (
              <Button type="button" variant="secondary" onClick={handleConvertToInvoice} loading={isConverting}>
                Convertir en facture
              </Button>
            ) : null}
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

      {isQuoteConversionAvailable && conversionError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {conversionError}
          </p>
        </Card>
      ) : null}

      {isQuoteConversionAvailable && conversionSuccessMessage ? (
        <Card padding="sm">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {conversionSuccessMessage}
          </p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Informations" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Reference:</span> {quote.reference || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Client:</span>{' '}
              <Link to={`/clients/${quote.clientId}`} className="text-brand-700 hover:underline">
                {clientName}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-900">Date devis:</span> {formatApiDate(quote.quoteDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Cree le:</span> {formatApiDateTime(quote.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Mise a jour:</span> {formatApiDateTime(quote.updatedAt)}
            </p>
          </div>
        </Card>

        <Card title="Statut" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Statut actuel:</span>{' '}
              <Badge variant={getQuoteStatusBadgeVariant(quote.status)}>
                {getQuoteStatusLabel(quote.status)}
              </Badge>
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-2">
                <Select
                  label="Changer le statut"
                  options={QUOTE_STATUS_OPTIONS}
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusChange}
                  loading={isStatusUpdating}
                  disabled={!statusValue || statusValue === quote.status}
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
              <span className="font-medium text-slate-900">Sous-total:</span> {formatAmount(quote.subtotal)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Remise:</span> {formatAmount(quote.discountAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Total:</span> {formatAmount(quote.totalAmount)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Lignes du devis" padding="none">
        <Table
          columns={lineColumns}
          data={quote.items || []}
          rowKey={(row, index) => row.id || index}
          emptyTitle="Aucune ligne"
          emptyDescription="Ce devis ne contient aucune ligne."
        />
      </Card>

      <Card title="Notes" padding="sm">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{quote.notes || 'Aucune note.'}</p>
      </Card>
    </div>
  );
}
