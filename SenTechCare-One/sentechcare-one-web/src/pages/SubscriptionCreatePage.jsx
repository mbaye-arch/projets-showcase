import { useNavigate } from 'react-router-dom';
import { createSubscription } from '@/api/subscriptionApi';
import SubscriptionForm from '@/features/subscriptions/SubscriptionForm';
import { PageHeader } from '@/components/ui';

export default function SubscriptionCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    await createSubscription(payload);
    navigate('/subscriptions');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel abonnement"
        subtitle="Creer un nouveau contrat d'abonnement."
        breadcrumbs={[
          { label: 'Abonnements', to: '/subscriptions' },
          { label: 'Creation' }
        ]}
      />

      <SubscriptionForm
        onSubmit={handleCreate}
        submitLabel="Creer l'abonnement"
        cancelPath="/subscriptions"
      />
    </div>
  );
}
