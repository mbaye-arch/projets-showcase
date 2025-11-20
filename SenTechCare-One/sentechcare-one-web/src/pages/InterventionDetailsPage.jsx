import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getClientById } from '@/api/clientApi';
import {
  deleteIntervention,
  getInterventionById,
  getTechnicians,
  updateIntervention
} from '@/api/interventionApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getInterventionStatusBadgeVariant,
  getInterventionStatusLabel,
  getInterventionTypeLabel,
  getPriorityBadgeVariant,
  getPriorityLevelLabel,
  getTechnicianDisplayName,
  INTERVENTION_STATUS_OPTIONS
} from '@/features/interventions/interventionConstants';
import { toInterventionRequestFromResponse } from '@/features/interventions/interventionFormSchema';
import { Badge, Button, Card, EmptyState, LoadingSpinner, PageHeader, Select } from '@/components/ui';
import { extractApiErrorMessage } from '@/utils/apiError';

function parseErrorMessage(error) {
  return extractApiErrorMessage(error, 'Une erreur est survenue.');
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function getTechnicianName(intervention) {
  const fullName = [intervention?.assignedTechnicianFirstName, intervention?.assignedTechnicianLastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fullName || (intervention?.assignedTechnicianId ? `Technicien #${intervention.assignedTechnicianId}` : 'Non assigne');
}

export default function InterventionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [intervention, setIntervention] = useState(null);
  const [clientName, setClientName] = useState('-');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusValue, setStatusValue] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [assignedTechnicianValue, setAssignedTechnicianValue] = useState('');
  const [techniciansOptions, setTechniciansOptions] = useState([]);
  const [techniciansError, setTechniciansError] = useState(null);
  const [assignmentUpdateError, setAssignmentUpdateError] = useState(null);
  const [isAssignmentUpdating, setIsAssignmentUpdating] = useState(false);

  const loadIntervention = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getInterventionById(id);
      setIntervention(response);
      setStatusValue(response?.status || '');
      setAssignedTechnicianValue(response?.assignedTechnicianId ? String(response.assignedTechnicianId) : '');

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
    loadIntervention();
  }, [loadIntervention]);

  useEffect(() => {
    let isMounted = true;

    const loadTechnicians = async () => {
      setTechniciansError(null);
      try {
        const response = await getTechnicians({
          page: 0,
          size: 300,
          activeOnly: true,
          sort: 'createdAt,desc'
        });

        if (!isMounted) {
          return;
        }

        setTechniciansOptions(
          (response?.content ?? []).map((technician) => ({
            value: String(technician.id),
            label: getTechnicianDisplayName(technician)
          }))
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setTechniciansOptions([]);
        setTechniciansError(parseErrorMessage(error));
      }
    };

    loadTechnicians();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!intervention?.id) {
      return;
    }

    const confirmed = window.confirm("Confirmer la suppression de cette intervention ?");
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteIntervention(intervention.id);
      navigate('/interventions', { replace: true });
    } catch (error) {
      setDeleteError(parseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!intervention || !statusValue || statusValue === intervention.status) {
      return;
    }

    setStatusUpdateError(null);
    setIsStatusUpdating(true);

    try {
      const payload = toInterventionRequestFromResponse(intervention, { status: statusValue });
      const updated = await updateIntervention(intervention.id, payload);
      setIntervention(updated);
      setStatusValue(updated.status);
      setAssignedTechnicianValue(updated?.assignedTechnicianId ? String(updated.assignedTechnicianId) : '');
    } catch (error) {
      setStatusUpdateError(parseErrorMessage(error));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const mergedTechniciansOptions = (() => {
    if (!intervention?.assignedTechnicianId) {
      return techniciansOptions;
    }

    const selectedId = String(intervention.assignedTechnicianId);
    if (techniciansOptions.some((option) => option.value === selectedId)) {
      return techniciansOptions;
    }

    return [
      {
        value: selectedId,
        label: `${getTechnicianName(intervention)} (hors liste active)`
      },
      ...techniciansOptions
    ];
  })();

  const handleAssignmentChange = async () => {
    if (!intervention) {
      return;
    }

    const currentTechnicianId = intervention.assignedTechnicianId ? String(intervention.assignedTechnicianId) : '';
    if (assignedTechnicianValue === currentTechnicianId) {
      return;
    }

    setAssignmentUpdateError(null);
    setIsAssignmentUpdating(true);

    try {
      const payload = toInterventionRequestFromResponse(intervention, {
        assignedTechnicianId: assignedTechnicianValue ? Number(assignedTechnicianValue) : null
      });

      const updated = await updateIntervention(intervention.id, payload);
      setIntervention(updated);
      setAssignedTechnicianValue(updated?.assignedTechnicianId ? String(updated.assignedTechnicianId) : '');
    } catch (error) {
      setAssignmentUpdateError(parseErrorMessage(error));
    } finally {
      setIsAssignmentUpdating(false);
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
        title="Impossible de charger cette intervention"
        description={errorMessage}
        action={
          <Button type="button" onClick={loadIntervention}>
            Reessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Intervention #${intervention.id}`}
        subtitle="Suivi detaille de l'intervention."
        breadcrumbs={[
          { label: 'Interventions', to: '/interventions' },
          { label: 'Detail intervention' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/interventions/${intervention.id}/edit`}>
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
        <Card title="Planification" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Client:</span>{' '}
              <Link to={`/clients/${intervention.clientId}`} className="text-brand-700 hover:underline">
                {clientName}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-900">Technicien:</span> {getTechnicianName(intervention)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Type:</span> {getInterventionTypeLabel(intervention.type)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date prevue:</span>{' '}
              {formatDateTime(intervention.plannedDate)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date reelle:</span>{' '}
              {formatDateTime(intervention.actualDate)}
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Affectation technicien</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Select
                  label="Technicien"
                  options={[{ value: '', label: 'Non assigne' }, ...mergedTechniciansOptions]}
                  value={assignedTechnicianValue}
                  onChange={(event) => setAssignedTechnicianValue(event.target.value)}
                  helperText={techniciansError ? 'Liste partielle indisponible' : undefined}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAssignmentChange}
                  loading={isAssignmentUpdating}
                  disabled={
                    assignedTechnicianValue ===
                    (intervention.assignedTechnicianId ? String(intervention.assignedTechnicianId) : '')
                  }
                >
                  Mettre a jour
                </Button>
              </div>
              {assignmentUpdateError ? <p className="mt-2 text-xs text-rose-700">{assignmentUpdateError}</p> : null}
            </div>
          </div>
        </Card>

        <Card title="Priorite et statut" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Priorite:</span>{' '}
              <Badge variant={getPriorityBadgeVariant(intervention.priority)}>
                {getPriorityLevelLabel(intervention.priority)}
              </Badge>
            </p>

            <p>
              <span className="font-medium text-slate-900">Statut actuel:</span>{' '}
              <Badge variant={getInterventionStatusBadgeVariant(intervention.status)}>
                {getInterventionStatusLabel(intervention.status)}
              </Badge>
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Changer le statut</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <Select
                  label="Nouveau statut"
                  options={INTERVENTION_STATUS_OPTIONS}
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusChange}
                  loading={isStatusUpdating}
                  disabled={!statusValue || statusValue === intervention.status}
                >
                  Mettre a jour
                </Button>
              </div>
              {statusUpdateError ? <p className="mt-2 text-xs text-rose-700">{statusUpdateError}</p> : null}
            </div>
          </div>
        </Card>

        <Card title="Suivi financier" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Duree (minutes):</span> {intervention.durationMinutes || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Cout:</span> {formatAmount(intervention.cost)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Cree le:</span> {formatDateTime(intervention.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Mis a jour le:</span> {formatDateTime(intervention.updatedAt)}
            </p>
          </div>
        </Card>
      </div>

      <Card title="Description du probleme" padding="sm">
        <p className="text-sm text-slate-700">{intervention.problemDescription || 'Aucune description.'}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="Diagnostic" padding="sm">
          <p className="text-sm text-slate-700">{intervention.diagnosis || 'Aucun diagnostic.'}</p>
        </Card>
        <Card title="Solution apportee" padding="sm">
          <p className="text-sm text-slate-700">{intervention.solutionProvided || 'Aucune solution renseignee.'}</p>
        </Card>
      </div>

      <Card title="Notes de cloture" padding="sm">
        <p className="text-sm text-slate-700">{intervention.closingNotes || 'Aucune note de cloture.'}</p>
      </Card>
    </div>
  );
}
