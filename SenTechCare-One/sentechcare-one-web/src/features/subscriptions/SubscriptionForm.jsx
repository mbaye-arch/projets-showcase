import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  BILLING_FREQUENCY_OPTIONS,
  PLAN_TYPE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS
} from '@/features/subscriptions/subscriptionConstants';
import {
  defaultSubscriptionFormValues,
  subscriptionFormSchema,
  toSubscriptionFormValues,
  toSubscriptionPayload
} from '@/features/subscriptions/subscriptionFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

export default function SubscriptionForm({
  initialSubscription,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/subscriptions'
}) {
  const [submitError, setSubmitError] = useState(null);
  const [clientsOptions, setClientsOptions] = useState([]);
  const [isClientsLoading, setIsClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: toSubscriptionFormValues(initialSubscription ?? defaultSubscriptionFormValues)
  });

  useEffect(() => {
    reset(toSubscriptionFormValues(initialSubscription ?? defaultSubscriptionFormValues));
  }, [initialSubscription, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      setIsClientsLoading(true);
      setClientsError(null);

      try {
        const response = await getClients({
          page: 0,
          size: 200,
          sort: 'createdAt,desc',
          active: true
        });

        if (!isMounted) {
          return;
        }

        const options = (response?.content ?? []).map((client) => ({
          value: String(client.id),
          label: getClientDisplayName(client)
        }));

        setClientsOptions(options);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setClientsError(extractApiErrorMessage(error, 'Impossible de charger la liste des clients.'));
      } finally {
        if (isMounted) {
          setIsClientsLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toSubscriptionPayload(values));
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
      <Card title="Informations abonnement" subtitle="Renseignez les details de la formule et du contrat.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Client"
            required
            options={clientsOptions}
            placeholder={isClientsLoading ? 'Chargement des clients...' : 'Selectionner un client'}
            helperText={clientsError || undefined}
            error={errors.clientId?.message}
            disabled={isClientsLoading}
            {...register('clientId')}
          />

          <Select
            label="Type de formule"
            required
            options={PLAN_TYPE_OPTIONS}
            error={errors.planType?.message}
            {...register('planType')}
          />

          <Input
            label="Prix mensuel"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 15000"
            error={errors.monthlyPrice?.message}
            {...register('monthlyPrice')}
          />

          <Select
            label="Frequence de facturation"
            options={BILLING_FREQUENCY_OPTIONS}
            error={errors.billingFrequency?.message}
            {...register('billingFrequency')}
          />

          <Input
            label="Date de debut"
            required
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          <Input
            label="Date de fin"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate')}
          />

          <Select
            label="Statut"
            required
            options={SUBSCRIPTION_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            label="Description"
            placeholder="Ex: Maintenance complete poste + reseau"
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Notes"
            rows={4}
            placeholder="Informations complementaires..."
            error={errors.notes?.message}
            {...register('notes')}
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
