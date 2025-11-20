import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { getClientById } from '@/api/clientApi';
import {
  convertTicketToIntervention,
  deleteTicket,
  getTicketById,
  getTicketTechnicians,
  updateTicket
} from '@/api/ticketApi';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import { getInterventionStatusLabel } from '@/features/interventions/interventionConstants';
import {
  defaultTicketConversionValues,
  ticketConversionSchema,
  toTicketConversionPayload
} from '@/features/tickets/ticketConversionSchema';
import {
  getTechnicianDisplayName,
  getTicketChannelBadgeVariant,
  getTicketChannelLabel,
  getTicketPriorityBadgeVariant,
  getTicketPriorityLabel,
  getTicketStatusBadgeVariant,
  getTicketStatusLabel,
  TICKET_STATUS_OPTIONS,
  TICKET_TO_INTERVENTION_TYPE_OPTIONS
} from '@/features/tickets/ticketConstants';
import { toTicketRequestFromResponse } from '@/features/tickets/ticketFormSchema';
import { extractApiErrorMessage } from '@/utils/apiError';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingSpinner,
  Modal,
  PageHeader,
  Select,
  Textarea
} from '@/components/ui';

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

function getStatusOptions(currentStatus) {
  if (currentStatus === 'CLOSED') {
    return TICKET_STATUS_OPTIONS.filter((option) => option.value === 'CLOSED');
  }

  if (currentStatus === 'RESOLVED') {
    return TICKET_STATUS_OPTIONS.filter(
      (option) => option.value === 'RESOLVED' || option.value === 'CLOSED'
    );
  }

  return TICKET_STATUS_OPTIONS;
}

function getCurrentDateTimeLocal() {
  const now = new Date();
  const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [clientName, setClientName] = useState('-');
  const [techniciansOptions, setTechniciansOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [statusValue, setStatusValue] = useState('');
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [assignedTechnicianValue, setAssignedTechnicianValue] = useState('');
  const [techniciansError, setTechniciansError] = useState(null);
  const [assignmentUpdateError, setAssignmentUpdateError] = useState(null);
  const [isAssignmentUpdating, setIsAssignmentUpdating] = useState(false);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [conversionError, setConversionError] = useState(null);
  const [conversionResult, setConversionResult] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(ticketConversionSchema),
    defaultValues: defaultTicketConversionValues
  });

  const loadTechnicians = useCallback(async () => {
    try {
      setTechniciansError(null);
      const techniciansResponse = await getTicketTechnicians({
        page: 0,
        size: 300,
        activeOnly: true,
        sort: 'createdAt,desc'
      });

      setTechniciansOptions(
        (techniciansResponse?.content ?? []).map((user) => ({
          value: String(user.id),
          label: getTechnicianDisplayName(user)
        }))
      );
    } catch (error) {
      setTechniciansOptions([]);
      setTechniciansError(parseErrorMessage(error));
    }
  }, []);

  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getTicketById(id);
      setTicket(response);
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

      reset({
        ...defaultTicketConversionValues,
        assignedTechnicianId: response?.assignedTechnicianId ? String(response.assignedTechnicianId) : ''
      });
    } catch (error) {
      setErrorMessage(parseErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [id, reset]);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const statusOptions = useMemo(() => getStatusOptions(ticket?.status), [ticket?.status]);
  const canConvert = ticket?.status && ticket.status !== 'CLOSED';

  const handleDelete = async () => {
    if (!ticket?.id) {
      return;
    }

    const confirmed = window.confirm('Confirmer la suppression de ce ticket ?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteTicket(ticket.id);
      navigate('/tickets', { replace: true });
    } catch (error) {
      setDeleteError(parseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!ticket || !statusValue || statusValue === ticket.status) {
      return;
    }

    setStatusUpdateError(null);
    setIsStatusUpdating(true);

    try {
      const overrides = { status: statusValue };

      if ((statusValue === 'RESOLVED' || statusValue === 'CLOSED') && !ticket.resolvedAt) {
        overrides.resolvedAt = getCurrentDateTimeLocal();
      }

      const payload = toTicketRequestFromResponse(ticket, overrides);
      const updated = await updateTicket(ticket.id, payload);
      setTicket(updated);
      setStatusValue(updated.status || statusValue);
      setAssignedTechnicianValue(updated?.assignedTechnicianId ? String(updated.assignedTechnicianId) : '');
    } catch (error) {
      setStatusUpdateError(parseErrorMessage(error));
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const mergedTechniciansOptions = useMemo(() => {
    if (!ticket?.assignedTechnicianId) {
      return techniciansOptions;
    }

    const selectedId = String(ticket.assignedTechnicianId);
    if (techniciansOptions.some((option) => option.value === selectedId)) {
      return techniciansOptions;
    }

    const selectedName = [ticket.assignedTechnicianFirstName, ticket.assignedTechnicianLastName]
      .filter(Boolean)
      .join(' ')
      .trim() || `Technicien #${ticket.assignedTechnicianId}`;

    return [{ value: selectedId, label: `${selectedName} (hors liste active)` }, ...techniciansOptions];
  }, [ticket, techniciansOptions]);

  const handleAssignmentChange = async () => {
    if (!ticket) {
      return;
    }

    const currentTechnicianId = ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : '';
    if (assignedTechnicianValue === currentTechnicianId) {
      return;
    }

    setAssignmentUpdateError(null);
    setIsAssignmentUpdating(true);

    try {
      const payload = toTicketRequestFromResponse(ticket, {
        assignedTechnicianId: assignedTechnicianValue ? Number(assignedTechnicianValue) : null
      });
      const updated = await updateTicket(ticket.id, payload);
      setTicket(updated);
      setAssignedTechnicianValue(updated?.assignedTechnicianId ? String(updated.assignedTechnicianId) : '');
    } catch (error) {
      setAssignmentUpdateError(parseErrorMessage(error));
    } finally {
      setIsAssignmentUpdating(false);
    }
  };

  const handleOpenConvertModal = () => {
    if (!ticket) {
      return;
    }

    setConversionError(null);
    reset({
      ...defaultTicketConversionValues,
      assignedTechnicianId: ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : ''
    });
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = async (values) => {
    if (!ticket) {
      return;
    }

    setConversionError(null);

    try {
      const response = await convertTicketToIntervention(ticket.id, toTicketConversionPayload(values));
      setConversionResult(response);
      setIsConvertModalOpen(false);
      await loadTicket();
    } catch (error) {
      setConversionError(parseErrorMessage(error));
    }
  };

  const assignedTechnicianName =
    [ticket?.assignedTechnicianFirstName, ticket?.assignedTechnicianLastName]
      .filter(Boolean)
      .join(' ')
      .trim() || (ticket?.assignedTechnicianId ? `Technicien #${ticket.assignedTechnicianId}` : 'Non assigne');

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
        title="Impossible de charger ce ticket"
        description={errorMessage}
        action={
          <Button type="button" onClick={loadTicket}>
            Reessayer
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Ticket #${ticket.id}`}
        subtitle={ticket.subject || 'Suivi detaille du ticket support'}
        breadcrumbs={[
          { label: 'Tickets', to: '/tickets' },
          { label: 'Detail ticket' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/tickets/${ticket.id}/edit`}>
              <Button variant="outline">Modifier</Button>
            </Link>
            {canConvert ? (
              <Button variant="secondary" onClick={handleOpenConvertModal}>
                Convertir en intervention
              </Button>
            ) : null}
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

      {conversionError ? (
        <Card padding="sm">
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {conversionError}
          </p>
        </Card>
      ) : null}

      {conversionResult ? (
        <Card padding="sm">
          <div className="flex flex-col gap-2 text-sm text-emerald-800">
            <p className="font-medium">Ticket converti en intervention avec succes.</p>
            <p>
              Intervention creee: <span className="font-semibold">#{conversionResult.interventionId}</span> ({' '}
              {getInterventionStatusLabel(conversionResult.interventionStatus)} )
            </p>
            <p>
              Nouveau statut ticket: <span className="font-semibold">{getTicketStatusLabel(conversionResult.ticketStatus)}</span>
            </p>
            <div>
              <Link className="text-brand-700 underline" to={`/interventions/${conversionResult.interventionId}`}>
                Ouvrir l'intervention
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Informations generales" padding="sm">
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Client:</span>{' '}
              <Link to={`/clients/${ticket.clientId}`} className="text-brand-700 hover:underline">
                {clientName}
              </Link>
            </p>
            <p>
              <span className="font-medium text-slate-900">Sujet:</span> {ticket.subject || '-'}
            </p>
            <p>
              <span className="font-medium text-slate-900">Canal:</span>{' '}
              <Badge variant={getTicketChannelBadgeVariant(ticket.channel)}>
                {getTicketChannelLabel(ticket.channel)}
              </Badge>
            </p>
            <p>
              <span className="font-medium text-slate-900">Priorite:</span>{' '}
              <Badge variant={getTicketPriorityBadgeVariant(ticket.priority)}>
                {getTicketPriorityLabel(ticket.priority)}
              </Badge>
            </p>
          </div>
        </Card>

        <Card title="Affectation" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Technicien assigne:</span> {assignedTechnicianName}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date creation:</span> {formatDateTime(ticket.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Date resolution:</span> {formatDateTime(ticket.resolvedAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Derniere mise a jour:</span> {formatDateTime(ticket.updatedAt)}
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Mettre a jour l'affectation</p>
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
                    (ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : '')
                  }
                >
                  Mettre a jour
                </Button>
              </div>
              {assignmentUpdateError ? <p className="mt-2 text-xs text-rose-700">{assignmentUpdateError}</p> : null}
            </div>
          </div>
        </Card>

        <Card title="Statut" padding="sm">
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Statut actuel:</span>{' '}
              <Badge variant={getTicketStatusBadgeVariant(ticket.status)}>
                {getTicketStatusLabel(ticket.status)}
              </Badge>
            </p>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Suivi du statut</p>
              <div className="flex flex-col gap-2">
                <Select
                  label="Nouveau statut"
                  options={statusOptions}
                  value={statusValue}
                  onChange={(event) => setStatusValue(event.target.value)}
                  disabled={ticket.status === 'CLOSED'}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusChange}
                  loading={isStatusUpdating}
                  disabled={
                    ticket.status === 'CLOSED' ||
                    !statusValue ||
                    statusValue === ticket.status
                  }
                >
                  Mettre a jour
                </Button>
              </div>
              {ticket.status === 'RESOLVED' ? (
                <p className="mt-2 text-xs text-slate-500">
                  Un ticket resolu peut etre finalise en ferme.
                </p>
              ) : null}
              {ticket.status === 'CLOSED' ? (
                <p className="mt-2 text-xs text-slate-500">
                  Ticket ferme, le statut ne peut plus etre modifie.
                </p>
              ) : null}
              {statusUpdateError ? <p className="mt-2 text-xs text-rose-700">{statusUpdateError}</p> : null}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Description" padding="sm">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.description || 'Aucune description.'}</p>
      </Card>

      <Card title="Commentaire de resolution" padding="sm">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket.resolutionComment || 'Aucun commentaire de resolution.'}</p>
      </Card>

      <Modal
        open={isConvertModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsConvertModalOpen(false);
          }
        }}
        title="Convertir le ticket en intervention"
        description="Cree une intervention a partir de cette demande support."
        size="md"
        closeOnBackdrop={!isSubmitting}
      >
        <form className="space-y-4" onSubmit={handleSubmit(handleConvertSubmit)} noValidate>
          <Select
            label="Type d'intervention"
            required
            options={TICKET_TO_INTERVENTION_TYPE_OPTIONS}
            error={errors.interventionType?.message}
            {...register('interventionType')}
          />

          <Select
            label="Technicien pour l'intervention"
            options={[{ value: '', label: 'Conserver le technicien du ticket' }, ...mergedTechniciansOptions]}
            error={errors.assignedTechnicianId?.message}
            {...register('assignedTechnicianId')}
          />

          <Input
            label="Date planifiee"
            type="datetime-local"
            error={errors.plannedDate?.message}
            {...register('plannedDate')}
          />

          <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              {...register('closeTicket')}
            />
            Cloturer le ticket apres conversion
          </label>

          <Textarea
            label="Commentaire de conversion"
            rows={3}
            placeholder="Ex: Intervention planifiee avec le client"
            error={errors.resolutionComment?.message}
            {...register('resolutionComment')}
          />

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConvertModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Convertir
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
