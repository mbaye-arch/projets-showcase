import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInterventionById, updateIntervention } from '@/api/interventionApi';
import InterventionForm from '@/features/interventions/InterventionForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function InterventionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadIntervention = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInterventionById(id);
      setIntervention(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadIntervention();
  }, [loadIntervention]);

  const handleUpdate = async (payload) => {
    const updated = await updateIntervention(id, payload);
    navigate(`/interventions/${updated.id}`);
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
        title="Intervention introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadIntervention}
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
        title="Modifier l'intervention"
        subtitle="Mettre a jour les informations operationnelles."
        breadcrumbs={[
          { label: 'Interventions', to: '/interventions' },
          { label: 'Detail', to: `/interventions/${id}` },
          { label: 'Edition' }
        ]}
      />

      <InterventionForm
        initialIntervention={intervention}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/interventions/${id}`}
      />
    </div>
  );
}
