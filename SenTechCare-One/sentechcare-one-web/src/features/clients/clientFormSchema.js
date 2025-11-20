import { z } from 'zod';

export const CLIENT_TYPE_VALUES = ['HOUSE', 'SHOP', 'SCHOOL', 'SME', 'INSTITUTION'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalText = (maxLength, label) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} ne doit pas depasser ${maxLength} caracteres`);

const optionalLongText = z.string().trim();

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export const clientFormSchema = z
  .object({
    clientType: z.enum(CLIENT_TYPE_VALUES, {
      required_error: 'Le type de client est obligatoire'
    }),
    companyName: optionalText(180, 'Le nom de societe'),
    firstName: optionalText(100, 'Le prenom'),
    lastName: optionalText(100, 'Le nom'),
    phone: z
      .string()
      .trim()
      .min(1, 'Le telephone est obligatoire')
      .max(30, 'Le telephone ne doit pas depasser 30 caracteres'),
    email: optionalText(255, "L'adresse e-mail").refine(
      (value) => value.length === 0 || EMAIL_REGEX.test(value),
      'Adresse e-mail invalide'
    ),
    address: optionalText(255, "L'adresse"),
    city: optionalText(120, 'La ville'),
    country: optionalText(120, 'Le pays'),
    contactPerson: optionalText(150, 'Le contact principal'),
    notes: optionalLongText,
    active: z.boolean()
  })
  .superRefine((values, context) => {
    const hasCompanyName = hasText(values.companyName);
    const hasFirstName = hasText(values.firstName);
    const hasLastName = hasText(values.lastName);
    const hasFullPersonName = hasFirstName && hasLastName;

    if (hasCompanyName || hasFullPersonName) {
      return;
    }

    if (!hasFirstName && !hasLastName) {
      const message = 'Renseignez soit le nom de societe, soit le prenom et le nom.';
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['companyName'],
        message
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
        message
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lastName'],
        message
      });
      return;
    }

    if (!hasFirstName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
        message: 'Le prenom est requis si le nom de societe est vide.'
      });
    }

    if (!hasLastName) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lastName'],
        message: 'Le nom est requis si le nom de societe est vide.'
      });
    }
  });

export const defaultClientFormValues = {
  clientType: 'HOUSE',
  companyName: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: '',
  contactPerson: '',
  notes: '',
  active: true
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toClientPayload(values) {
  return {
    clientType: values.clientType,
    companyName: toNullableText(values.companyName),
    firstName: toNullableText(values.firstName),
    lastName: toNullableText(values.lastName),
    phone: values.phone.trim(),
    email: toNullableText(values.email),
    address: toNullableText(values.address),
    city: toNullableText(values.city),
    country: toNullableText(values.country),
    contactPerson: toNullableText(values.contactPerson),
    notes: toNullableText(values.notes),
    active: Boolean(values.active)
  };
}

export function toClientFormValues(client) {
  if (!client) {
    return { ...defaultClientFormValues };
  }

  return {
    clientType: client.clientType ?? 'HOUSE',
    companyName: client.companyName ?? '',
    firstName: client.firstName ?? '',
    lastName: client.lastName ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    address: client.address ?? '',
    city: client.city ?? '',
    country: client.country ?? '',
    contactPerson: client.contactPerson ?? '',
    notes: client.notes ?? '',
    active: client.active ?? true
  };
}
