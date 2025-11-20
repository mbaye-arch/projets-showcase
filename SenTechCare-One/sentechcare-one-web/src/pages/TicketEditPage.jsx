import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTicketById, updateTicket } from '@/api/ticketApi';
import TicketForm from '@/features/tickets/TicketForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function TicketEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getTicketById(id);
      setTicket(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleUpdate = async (payload) => {
    const updatedTicket = await updateTicket(id, payload);
    navigate(`/tickets/${updatedTicket.id}`);
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
        title="Ticket introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadTicket}
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
        title="Modifier le ticket"
        subtitle="Mettez a jour les informations de la demande support."
        breadcrumbs={[
          { label: 'Tickets', to: '/tickets' },
          { label: 'Detail', to: `/tickets/${id}` },
          { label: 'Edition' }
        ]}
      />

      <TicketForm
        initialTicket={ticket}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/tickets/${id}`}
      />
    </div>
  );
}
