import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import {
  EQUIPMENT_CATEGORY_OPTIONS,
  EQUIPMENT_SOURCE_OPTIONS,
  EQUIPMENT_STATUS_OPTIONS
} from '@/features/equipments/equipmentConstants';
import {
  defaultEquipmentFormValues,
  equipmentFormSchema,
  toEquipmentFormValues,
  toEquipmentPayload
} from '@/features/equipments/equipmentFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

export default function EquipmentForm({
  initialEquipment,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/equipments'
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
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: toEquipmentFormValues(initialEquipment ?? defaultEquipmentFormValues)
  });

  useEffect(() => {
    reset(toEquipmentFormValues(initialEquipment ?? defaultEquipmentFormValues));
  }, [initialEquipment, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      setIsClientsLoading(true);
      setClientsError(null);

      try {
        const response = await getClients({
          page: 0,
          size: 200,
          sort: 'createdAt,desc'
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
      await onSubmit(toEquipmentPayload(values));
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
      <Card title="Informations materiel" subtitle="Renseignez les details du materiel installe.">
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
            label="Categorie"
            required
            options={EQUIPMENT_CATEGORY_OPTIONS}
            error={errors.category?.message}
            {...register('category')}
          />

          <Input
            label="Marque"
            placeholder="Ex: HP"
            error={errors.brand?.message}
            {...register('brand')}
          />

          <Input
            label="Modele"
            placeholder="Ex: ProDesk 600"
            error={errors.model?.message}
            {...register('model')}
          />

          <Input
            label="Numero de serie"
            placeholder="Ex: SN-123456789"
            error={errors.serialNumber?.message}
            {...register('serialNumber')}
          />

          <Input
            label="Date d'installation"
            type="date"
            error={errors.installationDate?.message}
            {...register('installationDate')}
          />

          <Select
            label="Etat"
            required
            options={EQUIPMENT_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />

          <Select
            label="Source"
            required
            options={EQUIPMENT_SOURCE_OPTIONS}
            error={errors.source?.message}
            {...register('source')}
          />

          <Input
            label="Debut garantie"
            type="date"
            error={errors.warrantyStartDate?.message}
            {...register('warrantyStartDate')}
          />

          <Input
            label="Fin garantie"
            type="date"
            error={errors.warrantyEndDate?.message}
            {...register('warrantyEndDate')}
          />

          <Input
            label="Localisation"
            placeholder="Ex: Salle serveurs, bureau 2"
            error={errors.locationDetails?.message}
            {...register('locationDetails')}
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
