import { z } from 'zod';
import { EMPTY_QUOTE_ITEM } from '@/features/quotes/quoteConstants';
import { getLocalDateInputValue } from '@/utils/date';

const QUOTE_STATUS_VALUES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const quoteItemSchema = z.object({
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

export const quoteFormSchema = z
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
    quoteDate: z.string().trim().min(1, 'La date du devis est obligatoire'),
    status: z.enum(QUOTE_STATUS_VALUES, {
      required_error: 'Le statut est obligatoire'
    }),
    discountAmount: z.preprocess(
      toOptionalNumber,
      z
        .number()
        .min(0, 'La remise doit etre superieure ou egale a 0')
        .optional()
    ),
    notes: z.string().trim(),
    items: z.array(quoteItemSchema).min(1, 'Ajoutez au moins une ligne de devis')
  })
  .superRefine((values, ctx) => {
    const subtotal = values.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }, 0);

    const discountAmount = Number(values.discountAmount || 0);

    if (discountAmount > subtotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountAmount'],
        message: 'La remise ne peut pas depasser le sous-total'
      });
    }
  });

export const defaultQuoteFormValues = {
  reference: '',
  clientId: '',
  quoteDate: getLocalDateInputValue(),
  status: 'DRAFT',
  discountAmount: 0,
  notes: '',
  items: [{ ...EMPTY_QUOTE_ITEM }]
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function calculateQuoteTotals(items = [], discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item?.quantity) || 0;
    const unitPrice = Number(item?.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);

  const safeDiscount = Math.max(0, Number(discountAmount) || 0);
  const total = Math.max(0, subtotal - safeDiscount);

  return {
    subtotal,
    discountAmount: safeDiscount,
    total
  };
}

export function toQuotePayload(values) {
  return {
    reference: values.reference.trim().toUpperCase(),
    clientId: Number(values.clientId),
    quoteDate: values.quoteDate,
    status: values.status,
    discountAmount: Number(values.discountAmount || 0),
    notes: toNullableText(values.notes),
    items: (values.items || []).map((item) => ({
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    }))
  };
}

export function toQuoteFormValues(quote) {
  if (!quote) {
    return {
      ...defaultQuoteFormValues,
      items: defaultQuoteFormValues.items.map((item) => ({ ...item }))
    };
  }

  return {
    reference: quote.reference ?? '',
    clientId: quote.clientId ? String(quote.clientId) : '',
    quoteDate: quote.quoteDate ?? getLocalDateInputValue(),
    status: quote.status ?? 'DRAFT',
    discountAmount: quote.discountAmount ?? 0,
    notes: quote.notes ?? '',
    items:
      quote.items?.length > 0
        ? quote.items.map((item) => ({
            description: item.description ?? '',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0
          }))
        : [{ ...EMPTY_QUOTE_ITEM }]
  };
}

export function toQuoteRequestFromResponse(quote, overrides = {}) {
  const merged = {
    ...(quote ?? {}),
    ...overrides
  };

  return {
    reference: String(merged.reference ?? '').trim().toUpperCase(),
    clientId: Number(merged.clientId),
    quoteDate: merged.quoteDate,
    status: merged.status,
    discountAmount: Number(merged.discountAmount || 0),
    notes: toNullableText(merged.notes),
    items: (merged.items || []).map((item) => ({
      description: String(item?.description ?? '').trim(),
      quantity: Number(item?.quantity),
      unitPrice: Number(item?.unitPrice)
    }))
  };
}
