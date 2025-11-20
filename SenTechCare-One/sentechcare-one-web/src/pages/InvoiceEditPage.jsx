import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInvoiceById, updateInvoice } from '@/api/invoiceApi';
import InvoiceForm from '@/features/invoices/InvoiceForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function InvoiceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadInvoice = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInvoiceById(id);
      setInvoice(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleUpdate = async (payload) => {
    const updatedInvoice = await updateInvoice(id, payload);
    navigate(`/invoices/${updatedInvoice.id}`);
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
        title="Facture introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadInvoice}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Reessayer
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier la facture"
        subtitle="Mettez a jour les lignes et informations de facturation."
        breadcrumbs={[
          { label: 'Factures', to: '/invoices' },
          { label: 'Detail', to: `/invoices/${id}` },
          { label: 'Edition' }
        ]}
      />

      <InvoiceForm
        initialInvoice={invoice}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/invoices/${id}`}
      />
    </div>
  );
}
