import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuoteById, updateQuote } from '@/api/quoteApi';
import QuoteForm from '@/features/quotes/QuoteForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function QuoteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadQuote = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getQuoteById(id);
      setQuote(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const handleUpdate = async (payload) => {
    const updatedQuote = await updateQuote(id, payload);
    navigate(`/quotes/${updatedQuote.id}`);
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
        title="Devis introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadQuote}
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
        title="Modifier le devis"
        subtitle="Mettez a jour les lignes et le statut du devis."
        breadcrumbs={[
          { label: 'Devis', to: '/quotes' },
          { label: 'Detail', to: `/quotes/${id}` },
          { label: 'Edition' }
        ]}
      />

      <QuoteForm
        initialQuote={quote}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/quotes/${id}`}
      />
    </div>
  );
}
