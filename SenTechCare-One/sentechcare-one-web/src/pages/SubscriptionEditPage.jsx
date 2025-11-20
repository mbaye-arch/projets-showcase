import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubscriptionById, updateSubscription } from '@/api/subscriptionApi';
import SubscriptionForm from '@/features/subscriptions/SubscriptionForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function SubscriptionEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadSubscription = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getSubscriptionById(id);
      setSubscription(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleUpdate = async (payload) => {
    await updateSubscription(id, payload);
    navigate('/subscriptions');
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
        title="Abonnement introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadSubscription}
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
        title="Modifier l'abonnement"
        subtitle="Mettez a jour les informations du contrat."
        breadcrumbs={[
          { label: 'Abonnements', to: '/subscriptions' },
          { label: 'Edition' }
        ]}
      />

      <SubscriptionForm
        initialSubscription={subscription}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath="/subscriptions"
      />
    </div>
  );
}
