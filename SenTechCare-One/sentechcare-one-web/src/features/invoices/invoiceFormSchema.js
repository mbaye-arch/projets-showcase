import { z } from 'zod';
import { EMPTY_INVOICE_ITEM } from '@/features/invoices/invoiceConstants';
import { getLocalDateInputValue } from '@/utils/date';

const INVOICE_STATUS_VALUES = ['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'UNPAID', 'CANCELLED'];

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const invoiceItemSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'La description est obligatoire')
    .max(255, 'La description ne doit pas depasser 255 caracteres'),
  quantity: z.preprocess(
    toOptionalNumber,
    z
      .number({ invalid_type_error: 'La quantite est obligatoire' })
      .positive('La quantite doit etre superieure a 0')
  ),
  unitPrice: z.preprocess(
    toOptionalNumber,
    z
      .number({ invalid_type_error: 'Le prix unitaire est obligatoire' })
      .min(0, 'Le prix unitaire doit etre superieur ou egal a 0')
  )
});

export const invoiceFormSchema = z
  .object({
    reference: z
      .string()
      .trim()
      .min(1, 'La reference est obligatoire')
      .max(50, 'La reference ne doit pas depasser 50 caracteres'),
    clientId: z.coerce
      .number({
        invalid_type_error: 'Le client est obligatoire'
      })
      .int()
      .positive('Le client est obligatoire'),
    issueDate: z.string().trim().min(1, "La date d'emission est obligatoire"),
    dueDate: z.string().trim().min(1, "La date d'echeance est obligatoire"),
    status: z.enum(INVOICE_STATUS_VALUES, {
      required_error: 'Le statut est obligatoire'
    }),
    paymentMethodNote: z
      .string()
      .trim()
      .max(100, 'La note de paiement ne doit pas depasser 100 caracteres'),
    notes: z.string().trim(),
    items: z.array(invoiceItemSchema).min(1, 'Ajoutez au moins une ligne de facture')
  })
  .superRefine((values, ctx) => {
    if (values.issueDate && values.dueDate && values.dueDate < values.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueDate'],
        message: "La date d'echeance doit etre superieure ou egale a la date d'emission"
      });
    }
  });

function getDefaultDueDate() {
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return getLocalDateInputValue(now);
}

export const defaultInvoiceFormValues = {
  reference: '',
  clientId: '',
  issueDate: getLocalDateInputValue(),
  dueDate: getDefaultDueDate(),
  status: 'DRAFT',
  paymentMethodNote: '',
  notes: '',
  items: [{ ...EMPTY_INVOICE_ITEM }]
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function calculateInvoiceTotal(items = []) {
  return items.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);
}

export function toInvoicePayload(values) {
  return {
    reference: values.reference.trim().toUpperCase(),
    clientId: Number(values.clientId),
    issueDate: values.issueDate,
    dueDate: values.dueDate,
    status: values.status,
    paymentMethodNote: toNullableText(values.paymentMethodNote),
    notes: toNullableText(values.notes),
    items: (values.items || []).map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    }))
  };
}

export function toInvoiceFormValues(invoice) {
  if (!invoice) {
    return {
      ...defaultInvoiceFormValues,
      items: defaultInvoiceFormValues.items.map((item) => ({ ...item }))
    };
  }

  return {
    reference: invoice.reference ?? '',
    clientId: invoice.clientId ? String(invoice.clientId) : '',
    issueDate: invoice.issueDate ?? getLocalDateInputValue(),
    dueDate: invoice.dueDate ?? getDefaultDueDate(),
    status: invoice.status ?? 'DRAFT',
    paymentMethodNote: invoice.paymentMethodNote ?? '',
    notes: invoice.notes ?? '',
    items:
      invoice.items?.length > 0
        ? invoice.items.map((item) => ({
            description: item.description ?? '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0
          }))
        : [{ ...EMPTY_INVOICE_ITEM }]
  };
}

export function toInvoiceRequestFromResponse(invoice, overrides = {}) {
  const merged = {
    ...(invoice ?? {}),
    ...overrides
  };

  return {
    reference: String(merged.reference ?? '').trim().toUpperCase(),
    clientId: Number(merged.clientId),
    issueDate: merged.issueDate,
    dueDate: merged.dueDate,
    status: merged.status,
    paymentMethodNote: toNullableText(merged.paymentMethodNote),
    notes: toNullableText(merged.notes),
    items: (merged.items || []).map((item) => ({
      description: String(item?.description ?? '').trim(),
      quantity: Number(item?.quantity),
      unitPrice: Number(item?.unitPrice)
    }))
  };
}
