import { useNavigate } from 'react-router-dom';
import { createClient } from '@/api/clientApi';
import ClientForm from '@/features/clients/ClientForm';
import { PageHeader } from '@/components/ui';

export default function ClientCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdClient = await createClient(payload);
    navigate(`/clients/${createdClient.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau client"
        subtitle="Creer une nouvelle fiche client."
        breadcrumbs={[
          { label: 'Clients', to: '/clients' },
          { label: 'Creation' }
        ]}
      />

      <ClientForm onSubmit={handleCreate} submitLabel="Creer le client" cancelPath="/clients" />
    </div>
  );
}
