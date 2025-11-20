import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import InvoiceItemsFieldArray from '@/features/invoices/InvoiceItemsFieldArray';
import { EMPTY_INVOICE_ITEM, INVOICE_STATUS_OPTIONS } from '@/features/invoices/invoiceConstants';
import {
  calculateInvoiceTotal,
  defaultInvoiceFormValues,
  invoiceFormSchema,
  toInvoiceFormValues,
  toInvoicePayload
} from '@/features/invoices/invoiceFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export default function InvoiceForm({
  initialInvoice,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/invoices'
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
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: toInvoiceFormValues(initialInvoice ?? defaultInvoiceFormValues)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');

  const lineTotals = useMemo(() => {
    return (watchedItems || []).map((item) => {
      return (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0);
    });
  }, [watchedItems]);

  const invoiceTotal = useMemo(() => {
    return calculateInvoiceTotal(watchedItems);
  }, [watchedItems]);

  useEffect(() => {
    reset(toInvoiceFormValues(initialInvoice ?? defaultInvoiceFormValues));
  }, [initialInvoice, reset]);

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
    append({ ...EMPTY_INVOICE_ITEM });
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
      await onSubmit(toInvoicePayload(values));
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement de la facture."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card title="Informations facture" subtitle="Reference, client, dates et statut de la facture.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Reference"
            required
            placeholder="Ex: FAC-2026-0001"
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
            label="Date d'emission"
            type="date"
            required
            error={errors.issueDate?.message}
            {...register('issueDate')}
          />

          <Input
            label="Date d'echeance"
            type="date"
            required
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Select
            label="Statut"
            required
            options={INVOICE_STATUS_OPTIONS}
            helperText="PAID et PARTIALLY_PAID sont recalcules automatiquement selon les paiements."
            error={errors.status?.message}
            {...register('status')}
          />

          <Input
            label="Note methode de paiement"
            placeholder="Ex: Virement bancaire"
            error={errors.paymentMethodNote?.message}
            {...register('paymentMethodNote')}
          />
        </div>
      </Card>

      <Card title="Lignes de facture" subtitle="Ajoutez les prestations, produits et quantites factures.">
        <InvoiceItemsFieldArray
          fields={fields}
          register={register}
          errors={errors}
          lineTotals={lineTotals}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      </Card>

      <Card title="Total" subtitle="Le total est calcule automatiquement depuis les lignes.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Textarea
            label="Notes"
            rows={4}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">Total facture:</span> {formatCurrency(invoiceTotal)}
          </p>
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
