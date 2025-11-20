import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { getTicketTechnicians } from '@/api/ticketApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getTechnicianDisplayName,
  TICKET_CHANNEL_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_STATUS_OPTIONS
} from '@/features/tickets/ticketConstants';
import {
  defaultTicketFormValues,
  ticketFormSchema,
  toTicketFormValues,
  toTicketPayload
} from '@/features/tickets/ticketFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

export default function TicketForm({
  initialTicket,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/tickets'
}) {
  const [submitError, setSubmitError] = useState(null);
  const [clientsOptions, setClientsOptions] = useState([]);
  const [techniciansOptions, setTechniciansOptions] = useState([]);
  const [isRefLoading, setIsRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: toTicketFormValues(initialTicket ?? defaultTicketFormValues)
  });

  useEffect(() => {
    reset(toTicketFormValues(initialTicket ?? defaultTicketFormValues));
  }, [initialTicket, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadReferences = async () => {
      setIsRefLoading(true);
      setRefError(null);

      try {
        const [clientsResponse, techniciansResponse] = await Promise.all([
          getClients({ page: 0, size: 250, sort: 'createdAt,desc' }),
          getTicketTechnicians({ page: 0, size: 250, activeOnly: true, sort: 'createdAt,desc' })
        ]);

        if (!isMounted) {
          return;
        }

        setClientsOptions(
          (clientsResponse?.content ?? []).map((client) => ({
            value: String(client.id),
            label: getClientDisplayName(client)
          }))
        );

        setTechniciansOptions(
          (techniciansResponse?.content ?? []).map((user) => ({
            value: String(user.id),
            label: getTechnicianDisplayName(user)
          }))
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setRefError(extractApiErrorMessage(error, 'Impossible de charger les listes client/technicien.'));
      } finally {
        if (isMounted) {
          setIsRefLoading(false);
        }
      }
    };

    loadReferences();

    return () => {
      isMounted = false;
    };
  }, []);

  const mergedTechniciansOptions = useMemo(() => {
    if (!initialTicket?.assignedTechnicianId) {
      return techniciansOptions;
    }

    const selectedId = String(initialTicket.assignedTechnicianId);
    if (techniciansOptions.some((option) => option.value === selectedId)) {
      return techniciansOptions;
    }

    const selectedName = getTechnicianDisplayName({
      id: initialTicket.assignedTechnicianId,
      firstName: initialTicket.assignedTechnicianFirstName,
      lastName: initialTicket.assignedTechnicianLastName
    });

    return [{ value: selectedId, label: `${selectedName} (hors liste active)` }, ...techniciansOptions];
  }, [
    initialTicket?.assignedTechnicianFirstName,
    initialTicket?.assignedTechnicianId,
    initialTicket?.assignedTechnicianLastName,
    techniciansOptions
  ]);

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toTicketPayload(values));
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card title="Informations ticket" subtitle="Renseignez les details de la demande support.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Client"
            required
            options={clientsOptions}
            placeholder={isRefLoading ? 'Chargement des clients...' : 'Selectionner un client'}
            helperText={refError || undefined}
            error={errors.clientId?.message}
            disabled={isRefLoading}
            {...register('clientId')}
          />

          <Select
            label="Technicien assigne"
            options={[{ value: '', label: 'Non assigne' }, ...mergedTechniciansOptions]}
            placeholder={isRefLoading ? 'Chargement des techniciens...' : 'Selectionner un technicien'}
            error={errors.assignedTechnicianId?.message}
            disabled={isRefLoading}
            {...register('assignedTechnicianId')}
          />

          <Select
            label="Canal"
            required
            options={TICKET_CHANNEL_OPTIONS}
            error={errors.channel?.message}
            {...register('channel')}
          />

          <Select
            label="Priorite"
            required
            options={TICKET_PRIORITY_OPTIONS}
            error={errors.priority?.message}
            {...register('priority')}
          />

          <Select
            label="Statut"
            required
            options={TICKET_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            label="Date de resolution"
            type="datetime-local"
            error={errors.resolvedAt?.message}
            {...register('resolvedAt')}
          />

          <Input
            label="Sujet"
            required
            placeholder="Ex: Probleme de connexion internet"
            error={errors.subject?.message}
            {...register('subject')}
          />
        </div>

        <div className="mt-4 space-y-4">
          <Textarea
            label="Description"
            required
            rows={4}
            error={errors.description?.message}
            {...register('description')}
          />

          <Textarea
            label="Commentaire de resolution"
            rows={3}
            error={errors.resolutionComment?.message}
            {...register('resolutionComment')}
          />
        </div>

        {submitError ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Link
          to={cancelPath}
          className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Annuler
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
