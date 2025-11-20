import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getClientById, updateClient } from '@/api/clientApi';
import ClientForm from '@/features/clients/ClientForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function ClientEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadClient = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getClientById(id);
      setClient(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const handleUpdate = async (payload) => {
    const updatedClient = await updateClient(id, payload);
    navigate(`/clients/${updatedClient.id}`);
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
        title="Client introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadClient}
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
        title="Modifier le client"
        subtitle="Mettez a jour les informations de la fiche client."
        breadcrumbs={[
          { label: 'Clients', to: '/clients' },
          { label: 'Detail', to: `/clients/${id}` },
          { label: 'Edition' }
        ]}
      />

      <ClientForm
        initialClient={client}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/clients/${id}`}
      />
    </div>
  );
}
