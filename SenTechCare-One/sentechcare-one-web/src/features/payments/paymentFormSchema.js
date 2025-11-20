import { z } from 'zod';

const PAYMENT_METHOD_VALUES = ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CHECK', 'OTHER'];

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMaxPaymentDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatLocalDate(date);
}

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export const paymentFormSchema = z.object({
  invoiceId: z.coerce
    .number({
      invalid_type_error: 'La facture est obligatoire'
    })
    .int()
    .positive('La facture est obligatoire'),
  paymentDate: z.string().trim().min(1, 'La date de paiement est obligatoire'),
  amount: z.preprocess(
    toOptionalNumber,
    z
      .number({ invalid_type_error: 'Le montant est obligatoire' })
      .positive('Le montant doit etre superieur a 0')
  ),
  method: z.enum(PAYMENT_METHOD_VALUES, {
    required_error: 'Le mode de paiement est obligatoire'
  }),
  paymentReference: z
    .string()
    .trim()
    .max(100, 'La reference de paiement ne doit pas depasser 100 caracteres'),
  notes: z.string().trim()
}).superRefine((values, ctx) => {
  if (values.paymentDate && values.paymentDate > getMaxPaymentDate()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['paymentDate'],
      message: 'La date de paiement ne peut pas etre superieure a demain'
    });
  }
});

export const defaultPaymentFormValues = {
  invoiceId: '',
  paymentDate: formatLocalDate(new Date()),
  amount: '',
  method: 'CASH',
  paymentReference: '',
  notes: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toPaymentPayload(values) {
  return {
    invoiceId: Number(values.invoiceId),
    paymentDate: values.paymentDate,
    amount: Number(values.amount),
    method: values.method,
    paymentReference: toNullableText(values.paymentReference),
    notes: toNullableText(values.notes)
  };
}

export function toPaymentFormValues(payment) {
  if (!payment) {
    return { ...defaultPaymentFormValues };
  }

  return {
    invoiceId: payment.invoiceId ? String(payment.invoiceId) : '',
    paymentDate: payment.paymentDate ?? formatLocalDate(new Date()),
    amount: payment.amount ?? '',
    method: payment.method ?? 'CASH',
    paymentReference: payment.paymentReference ?? '',
    notes: payment.notes ?? ''
  };
}
