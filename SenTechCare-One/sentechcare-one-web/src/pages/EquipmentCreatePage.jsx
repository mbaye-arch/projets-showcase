import { useNavigate } from 'react-router-dom';
import { createEquipment } from '@/api/equipmentApi';
import EquipmentForm from '@/features/equipments/EquipmentForm';
import { PageHeader } from '@/components/ui';

export default function EquipmentCreatePage() {
  const navigate = useNavigate();

  const handleCreate = async (payload) => {
    const createdEquipment = await createEquipment(payload);
    navigate(`/equipments/${createdEquipment.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau materiel"
        subtitle="Ajouter un materiel installe chez un client."
        breadcrumbs={[
          { label: 'Materiels', to: '/equipments' },
          { label: 'Creation' }
        ]}
      />

      <EquipmentForm onSubmit={handleCreate} submitLabel="Creer le materiel" cancelPath="/equipments" />
    </div>
  );
}
