import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEquipmentById, updateEquipment } from '@/api/equipmentApi';
import EquipmentForm from '@/features/equipments/EquipmentForm';
import { EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function EquipmentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadEquipment = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getEquipmentById(id);
      setEquipment(response);
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleUpdate = async (payload) => {
    const updatedEquipment = await updateEquipment(id, payload);
    navigate(`/equipments/${updatedEquipment.id}`);
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
        title="Materiel introuvable"
        description={errorMessage}
        action={
          <button
            type="button"
            onClick={loadEquipment}
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
        title="Modifier le materiel"
        subtitle="Mettez a jour les informations du materiel installe."
        breadcrumbs={[
          { label: 'Materiels', to: '/equipments' },
          { label: 'Detail', to: `/equipments/${id}` },
          { label: 'Edition' }
        ]}
      />

      <EquipmentForm
        initialEquipment={equipment}
        onSubmit={handleUpdate}
        submitLabel="Enregistrer les modifications"
        cancelPath={`/equipments/${id}`}
      />
    </div>
  );
}
