import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getClients } from '@/api/clientApi';
import { getInvoices } from '@/api/invoiceApi';
import { Button, Card, Input, Select, Textarea } from '@/components/ui';
import { getClientDisplayName } from '@/features/clients/clientConstants';
import { PAYMENT_METHOD_OPTIONS } from '@/features/payments/paymentConstants';
import {
  defaultPaymentFormValues,
  paymentFormSchema,
  toPaymentFormValues,
  toPaymentPayload
} from '@/features/payments/paymentFormSchema';
import { applyApiFieldErrors, extractApiErrorMessage } from '@/utils/apiError';

const NON_PAYABLE_STATUSES = new Set(['CANCELLED', 'PAID']);

function toSafeAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(toSafeAmount(value));
}

function isInvoicePayable(invoice) {
  if (!invoice) {
    return false;
  }

  const status = String(invoice.status || '').toUpperCase();
  if (NON_PAYABLE_STATUSES.has(status)) {
    return false;
  }

  return toSafeAmount(invoice.remainingAmount) > 0;
}

function getInvoiceLabel(invoice, clientsMap) {
  const reference = invoice?.reference || `Facture #${invoice?.id}`;
  const clientName = clientsMap?.[invoice?.clientId] || `Client #${invoice?.clientId}`;
  const remainingAmount = formatAmount(invoice?.remainingAmount);
  return `${reference} - ${clientName} (reste ${remainingAmount})`;
}

export default function PaymentForm({
  initialPayment,
  onSubmit,
  submitLabel = 'Enregistrer',
  cancelPath = '/payments',
  preselectedInvoiceId = null
}) {
  const [submitError, setSubmitError] = useState(null);
  const [referencesError, setReferencesError] = useState(null);
  const [isReferencesLoading, setIsReferencesLoading] = useState(true);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [invoicesMap, setInvoicesMap] = useState({});

  const resolvedInitialValues = useMemo(() => {
    const baseValues = toPaymentFormValues(initialPayment ?? defaultPaymentFormValues);

    if (!initialPayment && preselectedInvoiceId) {
      return {
        ...baseValues,
        invoiceId: String(preselectedInvoiceId)
      };
    }

    return baseValues;
  }, [initialPayment, preselectedInvoiceId]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: resolvedInitialValues
  });

  const selectedInvoiceId = watch('invoiceId');
  const selectedInvoice = useMemo(() => {
    if (!selectedInvoiceId) {
      return null;
    }

    return invoicesMap[String(selectedInvoiceId)] ?? null;
  }, [selectedInvoiceId, invoicesMap]);

  const selectedInvoiceRemaining = useMemo(() => {
    return toSafeAmount(selectedInvoice?.remainingAmount);
  }, [selectedInvoice]);

  useEffect(() => {
    reset(resolvedInitialValues);
  }, [resolvedInitialValues, reset]);

  useEffect(() => {
    let isMounted = true;

    const loadReferences = async () => {
      setIsReferencesLoading(true);
      setReferencesError(null);

      try {
        const [clientsResponse, invoicesResponse] = await Promise.all([
          getClients({
            page: 0,
            size: 500,
            sort: 'createdAt,desc'
          }),
          getInvoices({
            page: 0,
            size: 500,
            sort: 'createdAt,desc'
          })
        ]);

        if (!isMounted) {
          return;
        }

        const clientsMap = (clientsResponse?.content ?? []).reduce((acc, client) => {
          acc[client.id] = getClientDisplayName(client);
          return acc;
        }, {});

        const invoices = invoicesResponse?.content ?? [];
        const selectedId = preselectedInvoiceId ? String(preselectedInvoiceId) : null;

        const options = invoices
          .map((invoice) => {
            const invoiceId = String(invoice.id);
            const payable = isInvoicePayable(invoice);
            const isSelected = selectedId !== null && invoiceId === selectedId;

            return {
              value: invoiceId,
              label: payable
                ? getInvoiceLabel(invoice, clientsMap)
                : `${getInvoiceLabel(invoice, clientsMap)} - indisponible`,
              disabled: !payable && !isSelected
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label, 'fr'));

        const mappedInvoices = invoices.reduce((acc, invoice) => {
          acc[String(invoice.id)] = invoice;
          return acc;
        }, {});

        setInvoiceOptions(options);
        setInvoicesMap(mappedInvoices);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setInvoiceOptions([]);
        setInvoicesMap({});
        setReferencesError(extractApiErrorMessage(error, 'Impossible de charger les factures disponibles.'));
      } finally {
        if (isMounted) {
          setIsReferencesLoading(false);
        }
      }
    };

    loadReferences();

    return () => {
      isMounted = false;
    };
  }, [preselectedInvoiceId]);

  const submitForm = async (values) => {
    setSubmitError(null);

    const payload = toPaymentPayload(values);

    if (selectedInvoice && !isInvoicePayable(selectedInvoice)) {
      setSubmitError('La facture selectionnee ne peut pas recevoir de nouveau paiement.');
      return;
    }

    if (selectedInvoice && payload.amount > selectedInvoiceRemaining) {
      setSubmitError(
        `Le montant saisi depasse le reste a payer (${formatAmount(selectedInvoiceRemaining)}).`
      );
      return;
    }

    try {
      await onSubmit(payload);
    } catch (error) {
      const hasFieldErrors = applyApiFieldErrors(error, setError);
      setSubmitError(
        extractApiErrorMessage(
          error,
          hasFieldErrors
            ? 'Veuillez corriger les champs en erreur.'
            : "Une erreur est survenue lors de l'enregistrement du paiement."
        )
      );
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitForm)} noValidate>
      <Card title="Nouveau paiement" subtitle="Associez le paiement a une facture puis renseignez les details.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Facture"
            required
            options={invoiceOptions}
            placeholder={isReferencesLoading ? 'Chargement des factures...' : 'Selectionner une facture'}
            helperText={referencesError || undefined}
            error={errors.invoiceId?.message}
            disabled={isReferencesLoading}
            {...register('invoiceId')}
          />

          <Input
            label="Date de paiement"
            required
            type="date"
            error={errors.paymentDate?.message}
            helperText="La date ne peut pas etre superieure a demain."
            {...register('paymentDate')}
          />

          <Input
            label="Montant"
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Ex: 15000"
            error={errors.amount?.message}
            helperText={
              selectedInvoice
                ? `Reste a payer sur la facture: ${formatAmount(selectedInvoiceRemaining)}`
                : undefined
            }
            {...register('amount')}
          />

          <Select
            label="Mode de paiement"
            required
            options={PAYMENT_METHOD_OPTIONS}
            error={errors.method?.message}
            {...register('method')}
          />

          <Input
            label="Reference de paiement"
            placeholder="Ex: TRX-2026-0098"
            error={errors.paymentReference?.message}
            {...register('paymentReference')}
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

        {selectedInvoice ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-medium text-slate-900">Facture:</span>{' '}
              {selectedInvoice.reference || `Facture #${selectedInvoice.id}`}
            </p>
            <p>
              <span className="font-medium text-slate-900">Total:</span> {formatAmount(selectedInvoice.totalAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Deja paye:</span> {formatAmount(selectedInvoice.paidAmount)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Reste a payer:</span>{' '}
              {formatAmount(selectedInvoice.remainingAmount)}
            </p>
            {!isInvoicePayable(selectedInvoice) ? (
              <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-700">
                Cette facture ne peut pas recevoir de nouveau paiement.
              </p>
            ) : null}
          </div>
        ) : null}

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
