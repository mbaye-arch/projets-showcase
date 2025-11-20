import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import QuoteItemsFieldArray from '@/features/quotes/QuoteItemsFieldArray';
import { EMPTY_QUOTE_ITEM, QUOTE_STATUS_OPTIONS } from '@/features/quotes/quoteConstants';
import {
  calculateQuoteTotals,
  defaultQuoteFormValues,
  quoteFormSchema,
  toQuoteFormValues,
  toQuotePayload
} from '@/features/quotes/quoteFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function QuoteForm({
  initialQuote,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/quotes'
}) {
  const [submitError, setSubmitError] = useState(null);
  const [clientsOptions, setClientsOptions] = useState([]);
  const [isRefLoading, setIsRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: toQuoteFormValues(initialQuote ?? defaultQuoteFormValues)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedDiscountAmount = watch('discountAmount');

  const lineTotals = useMemo(() => {
    return (watchedItems || []).map((item) => {
      return (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
    });
  }, [watchedItems]);

  const totals = useMemo(() => {
    return calculateQuoteTotals(watchedItems, watchedDiscountAmount);
  }, [watchedItems, watchedDiscountAmount]);

  useEffect(() => {
    reset(toQuoteFormValues(initialQuote ?? defaultQuoteFormValues));
  }, [initialQuote, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      setIsRefLoading(true);
      setRefError(null);

      try {
        const response = await getClients({ page: 0, size: 300, sort: 'createdAt,desc' });

        if (!isMounted) {
          return;
        }

        setClientsOptions(
          (response?.content ?? []).map((client) => ({
            value: String(client.id),
            label: getClientDisplayName(client)
          }))
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setClientsOptions([]);
        setRefError(extractApiErrorMessage(error, 'Impossible de charger la liste des clients.'));
      } finally {
        if (isMounted) {
          setIsRefLoading(false);
        }
      }
    };

    loadClients();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddItem = () => {
    append({ ...EMPTY_QUOTE_ITEM });
  };

  const handleRemoveItem = (index) => {
    if (fields.length === 1) {
      return;
    }

    remove(index);
  };

  const submitForm = async (values) => {
    setSubmitError(null);

    try {
      await onSubmit(toQuotePayload(values));
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement du devis."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card title="Informations du devis" subtitle="Reference, client, date et statut du devis.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Reference"
            required
            placeholder="Ex: DV-2026-0001"
            error={errors.reference?.message}
            {...register('reference')}
          />

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

          <Input
            label="Date du devis"
            type="date"
            required
            error={errors.quoteDate?.message}
            {...register('quoteDate')}
          />

          <Select
            label="Statut"
            required
            options={QUOTE_STATUS_OPTIONS}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
      </Card>

      <Card title="Lignes du devis" subtitle="Ajoutez les prestations, materiels et quantites du devis.">
        <QuoteItemsFieldArray
          fields={fields}
          register={register}
          errors={errors}
          lineTotals={lineTotals}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      </Card>

      <Card title="Totaux" subtitle="Les montants sont recalcules automatiquement.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Remise"
            type="number"
            min="0"
            step="0.01"
            error={errors.discountAmount?.message}
            {...register('discountAmount')}
          />

          <Textarea
            label="Notes"
            rows={4}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-3">
            <p>
              <span className="font-medium text-slate-900">Sous-total:</span> {formatCurrency(totals.subtotal)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Remise:</span> {formatCurrency(totals.discountAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Total:</span> {formatCurrency(totals.total)}
            </p>
          </div>
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
