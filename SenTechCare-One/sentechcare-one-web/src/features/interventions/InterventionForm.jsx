import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { getTechnicians } from '@/api/interventionApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  getTechnicianDisplayName,
  INTERVENTION_STATUS_OPTIONS,
  INTERVENTION_TYPE_OPTIONS,
  PRIORITY_LEVEL_OPTIONS
} from '@/features/interventions/interventionConstants';
import {
  defaultInterventionFormValues,
  interventionFormSchema,
  toInterventionFormValues,
  toInterventionPayload
} from '@/features/interventions/interventionFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

export default function InterventionForm({
  initialIntervention,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/interventions'
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
    resolver: zodResolver(interventionFormSchema),
    defaultValues: toInterventionFormValues(initialIntervention ?? defaultInterventionFormValues)
  });

  useEffect(() => {
    reset(toInterventionFormValues(initialIntervention ?? defaultInterventionFormValues));
  }, [initialIntervention, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadReferences = async () => {
      setIsRefLoading(true);
      setRefError(null);

      try {
        const [clientsResponse, techniciansResponse] = await Promise.all([
          getClients({ page: 0, size: 250, sort: 'createdAt,desc' }),
          getTechnicians({ page: 0, size: 250, activeOnly: true, sort: 'createdAt,desc' })
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
    if (!initialIntervention?.assignedTechnicianId) {
      return techniciansOptions;
    }

    const selectedId = String(initialIntervention.assignedTechnicianId);
    if (techniciansOptions.some((option) => option.value === selectedId)) {
      return techniciansOptions;
    }

    const selectedName = getTechnicianDisplayName({
      id: initialIntervention.assignedTechnicianId,
      firstName: initialIntervention.assignedTechnicianFirstName,
      lastName: initialIntervention.assignedTechnicianLastName
    });

    return [{ value: selectedId, label: `${selectedName} (hors liste active)` }, ...techniciansOptions];
  }, [
    initialIntervention?.assignedTechnicianFirstName,
    initialIntervention?.assignedTechnicianId,
    initialIntervention?.assignedTechnicianLastName,
    techniciansOptions
  ]);

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toInterventionPayload(values));
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
      <Card title="Informations intervention" subtitle="Renseignez les details operationnels de l'intervention.">
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
            label="Type d'intervention"
            required
            options={INTERVENTION_TYPE_OPTIONS}
            error={errors.type?.message}
            {...register('type')}
          />

          <Select
            label="Priorite"
            required
            options={PRIORITY_LEVEL_OPTIONS}
            error={errors.priority?.message}
            {...register('priority')}
          />

          <Select
            label="Statut"
            required
            options={INTERVENTION_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            label="Date prevue"
            type="datetime-local"
            error={errors.plannedDate?.message}
            {...register('plannedDate')}
          />

          <Input
            label="Date reelle"
            type="datetime-local"
            error={errors.actualDate?.message}
            {...register('actualDate')}
          />

          <Input
            label="Duree (minutes)"
            type="number"
            min="1"
            step="1"
            error={errors.durationMinutes?.message}
            {...register('durationMinutes')}
          />

          <Input
            label="Cout"
            type="number"
            min="0"
            step="0.01"
            error={errors.cost?.message}
            {...register('cost')}
          />
        </div>

        <div className="mt-4 space-y-4">
          <Textarea
            label="Description du probleme"
            required
            rows={4}
            error={errors.problemDescription?.message}
            {...register('problemDescription')}
          />

          <Textarea
            label="Diagnostic"
            rows={3}
            error={errors.diagnosis?.message}
            {...register('diagnosis')}
          />

          <Textarea
            label="Solution apportee"
            rows={3}
            error={errors.solutionProvided?.message}
            {...register('solutionProvided')}
          />

          <Textarea
            label="Notes de cloture"
            rows={3}
            error={errors.closingNotes?.message}
            {...register('closingNotes')}
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
