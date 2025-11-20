import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClientById } from '@/api/clientApi';
import { deleteEquipment, getEquipmentById } from '@/api/equipmentApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getEquipmentCategoryBadgeVariant,
  getEquipmentCategoryLabel,
  getEquipmentSourceLabel,
  getEquipmentStatusBadgeVariant,
  getEquipmentStatusLabel
} from '@/features/equipments/equipmentConstants';
import { Badge, Button, Card, EmptyState, LoadingSpinner, PageHeader } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';
import { formatApiDate, formatApiDateTime } from '@/utils/date';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

export default function EquipmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [clientName, setClientName] = useState('-');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const loadEquipment = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getEquipmentById(id);
      setEquipment(response);

      if (response?.clientId) {
        try {
          const clientResponse = await getClientById(response.clientId);
          setClientName(getClientDisplayName(clientResponse));
        } catch {
          setClientName(`Client #${response.clientId}`);
        }
      } else {
        setClientName('-');
      }
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleDelete = async () => {
    if (!equipment?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Confirmer la suppression du materiel "${equipment.brand || ''} ${equipment.model || ''}" ?`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteEquipment(equipment.id);
      navigate('/equipments', { replace: true });
    } catch (error) {
      setDeleteError(parseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
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
        title="Impossible de charger ce materiel"
        description={errorMessage}
        action={
          <Button type="button" onClick={loadEquipment}>
            Reessayer
          </Button>
        }
      />
    );
  }

  const displayTitle = [equipment.brand, equipment.model].filter(Boolean).join(' ').trim() || 'Materiel';

  return (
    <div className="space-y-6">
      <PageHeader
        title={displayTitle}
        subtitle="Details du materiel installe."
        breadcrumbs={[
          { label: 'Materiels', to: '/equipments' },
          { label: 'Detail materiel' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/equipments/${equipment.id}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Supprimer
            </Button>
          </div>
        }
      />

      {deleteError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {deleteError}
          </p>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Identification" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Client:</span>{' '}
              <Link to={`/clients/${equipment.clientId}`} className="text-brand-700 hover:underline">
                {clientName}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-900">Categorie:</span>{' '}
              <Badge variant={getEquipmentCategoryBadgeVariant(equipment.category)}>
                {getEquipmentCategoryLabel(equipment.category)}
              </Badge>
            </p>
            <p>
              <span className="font-medium text-slate-900">Marque:</span> {equipment.brand || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Modele:</span> {equipment.model || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Numero de serie:</span> {equipment.serialNumber || '-'}
            </p>
          </div>
        </Card>

        <Card title="Etat et provenance" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Etat:</span>{' '}
              <Badge variant={getEquipmentStatusBadgeVariant(equipment.status)}>
                {getEquipmentStatusLabel(equipment.status)}
              </Badge>
            </p>
            <p>
              <span className="font-medium text-slate-900">Source:</span> {getEquipmentSourceLabel(equipment.source)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date installation:</span>{' '}
              {formatApiDate(equipment.installationDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Debut garantie:</span>{' '}
              {formatApiDate(equipment.warrantyStartDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Fin garantie:</span>{' '}
              {formatApiDate(equipment.warrantyEndDate)}
            </p>
          </div>
        </Card>

        <Card title="Suivi" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Localisation:</span>{' '}
              {equipment.locationDetails || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Cree le:</span> {formatApiDateTime(equipment.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Mise a jour:</span>{' '}
              {formatApiDateTime(equipment.updatedAt)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Notes" padding="sm">
        <p className="text-sm text-slate-700">{equipment.notes || 'Aucune note disponible.'}</p>
      </Card>
    </div>
  );
}
