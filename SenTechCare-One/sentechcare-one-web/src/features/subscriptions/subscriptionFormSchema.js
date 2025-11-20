import { z } from 'zod';

const PLAN_TYPE_VALUES = ['BASIC', 'BUSINESS', 'PREMIUM'];
const STATUS_VALUES = ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED'];
const BILLING_FREQUENCY_VALUES = ['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'];

const optionalText = (maxLength, label) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} ne doit pas depasser ${maxLength} caracteres`);

const optionalLongText = z.string().trim();

export const subscriptionFormSchema = z
  .object({
    clientId: z.coerce.number({
      invalid_type_error: 'Le client est obligatoire'
    }).int().positive('Le client est obligatoire'),
    planType: z.enum(PLAN_TYPE_VALUES, {
      required_error: 'Le type de formule est obligatoire'
    }),
    monthlyPrice: z
      .string()
      .trim()
      .min(1, 'Le prix mensuel est obligatoire')
      .refine((value) => !Number.isNaN(Number(value)), 'Le prix mensuel est invalide')
      .transform((value) => Number(value))
      .refine((value) => value >= 0, 'Le prix mensuel doit etre positif ou nul'),
    startDate: z
      .string()
      .trim()
      .min(1, 'La date de debut est obligatoire'),
    endDate: z.string().trim(),
    billingFrequency: z.union([z.enum(BILLING_FREQUENCY_VALUES), z.literal('')]),
    status: z.enum(STATUS_VALUES, {
      required_error: "Le statut de l'abonnement est obligatoire"
    }),
    description: optionalText(255, 'La description'),
    notes: optionalLongText
  })
  .superRefine((values, ctx) => {
    if (values.endDate && values.startDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'La date de fin doit etre posterieure a la date de debut'
      });
    }
  });

export const defaultSubscriptionFormValues = {
  clientId: '',
  planType: 'BASIC',
  monthlyPrice: '',
  startDate: '',
  endDate: '',
  billingFrequency: 'MONTHLY',
  status: 'ACTIVE',
  description: '',
  notes: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toSubscriptionPayload(values) {
  return {
    clientId: Number(values.clientId),
    planType: values.planType,
    monthlyPrice: Number(values.monthlyPrice),
    startDate: values.startDate,
    endDate: toNullableText(values.endDate),
    billingFrequency: toNullableText(values.billingFrequency),
    status: values.status,
    description: toNullableText(values.description),
    notes: toNullableText(values.notes)
  };
}

export function toSubscriptionFormValues(subscription) {
  if (!subscription) {
    return { ...defaultSubscriptionFormValues };
  }

  return {
    clientId: subscription.clientId ? String(subscription.clientId) : '',
    planType: subscription.planType ?? 'BASIC',
    monthlyPrice: subscription.monthlyPrice !== null && subscription.monthlyPrice !== undefined
      ? String(subscription.monthlyPrice)
      : '',
    startDate: subscription.startDate ?? '',
    endDate: subscription.endDate ?? '',
    billingFrequency: subscription.billingFrequency ?? 'MONTHLY',
    status: subscription.status ?? 'ACTIVE',
    description: subscription.description ?? '',
    notes: subscription.notes ?? ''
  };
}
