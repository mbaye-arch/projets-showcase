import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { CLIENT_TYPE_OPTIONS } from '@/features/clients/clientConstants';
import {
  clientFormSchema,
  defaultClientFormValues,
  toClientFormValues,
  toClientPayload
} from '@/features/clients/clientFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

export default function ClientForm({
  initialClient,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/clients'
}) {
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(clientFormSchema),
    defaultValues: toClientFormValues(initialClient ?? defaultClientFormValues)
  });

  useEffect(() => {
    reset(toClientFormValues(initialClient ?? defaultClientFormValues));
  }, [initialClient, reset]);

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toClientPayload(values));
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement du client."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card title="Informations client" subtitle="Renseignez les informations principales du client.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Type de client"
            required
            options={CLIENT_TYPE_OPTIONS}
            error={errors.clientType?.message}
            {...register('clientType')}
          />

          <Input
            label="Nom de societe"
            placeholder="Ex: Ecole Horizon"
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <Input
            label="Prenom"
            placeholder="Ex: Amadou"
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Nom"
            placeholder="Ex: Ndiaye"
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <Input
            label="Telephone"
            required
            placeholder="Ex: +221 77 000 00 00"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="Ex: contact@entreprise.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Adresse"
            placeholder="Ex: Parcelles Assainies"
            error={errors.address?.message}
            {...register('address')}
          />

          <Input
            label="Ville"
            placeholder="Ex: Dakar"
            error={errors.city?.message}
            {...register('city')}
          />

          <Input
            label="Pays"
            placeholder="Ex: Senegal"
            error={errors.country?.message}
            {...register('country')}
          />

          <Input
            label="Contact principal"
            placeholder="Ex: Responsable informatique"
            error={errors.contactPerson?.message}
            {...register('contactPerson')}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Notes"
            placeholder="Informations complementaires utiles..."
            rows={4}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              {...register('active')}
            />
            Client actif
          </label>
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
