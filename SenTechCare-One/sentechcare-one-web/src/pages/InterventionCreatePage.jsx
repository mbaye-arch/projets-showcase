import { useNavigate } from 'react-router-dom';
import { createIntervention } from '@/api/interventionApi';
import InterventionForm from '@/features/interventions/InterventionForm';
import { PageHeader } from '@/components/ui';

export default function InterventionCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdIntervention = await createIntervention(payload);
    navigate(`/interventions/${createdIntervention.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle intervention"
        subtitle="Creer une nouvelle intervention technique."
        breadcrumbs={[
          { label: 'Interventions', to: '/interventions' },
          { label: 'Creation' }
        ]}
      />

      <InterventionForm onSubmit={handleCreate} submitLabel="Creer l'intervention" cancelPath="/interventions" />
    </div>
  );
}
