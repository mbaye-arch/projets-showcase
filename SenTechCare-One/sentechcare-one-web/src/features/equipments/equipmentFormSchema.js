import { z } from 'zod';

const CATEGORY_VALUES = ['PC', 'LAPTOP', 'PRINTER', 'ROUTER', 'SWITCH', 'CAMERA', 'TV', 'SERVER', 'OTHER'];
const STATUS_VALUES = ['ACTIVE', 'BROKEN', 'REPLACED', 'OUT_OF_SERVICE'];
const SOURCE_VALUES = ['SENTECHCARE', 'CLIENT'];

const optionalText = (maxLength, label) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} ne doit pas depasser ${maxLength} caracteres`);

const optionalLongText = z.string().trim();
const MAX_INSTALLATION_DATE = new Date();
MAX_INSTALLATION_DATE.setDate(MAX_INSTALLATION_DATE.getDate() + 1);
MAX_INSTALLATION_DATE.setHours(0, 0, 0, 0);

function parseIsoDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export const equipmentFormSchema = z
  .object({
    clientId: z.coerce.number({
      invalid_type_error: 'Le client est obligatoire'
    }).int().positive('Le client est obligatoire'),
    category: z.enum(CATEGORY_VALUES, {
      required_error: 'La categorie est obligatoire'
    }),
    brand: optionalText(100, 'La marque'),
    model: optionalText(120, 'Le modele'),
    serialNumber: optionalText(120, 'Le numero de serie'),
    installationDate: z.string().trim(),
    status: z.enum(STATUS_VALUES, {
      required_error: "L'etat est obligatoire"
    }),
    source: z.enum(SOURCE_VALUES, {
      required_error: 'La source est obligatoire'
    }),
    warrantyStartDate: z.string().trim(),
    warrantyEndDate: z.string().trim(),
    locationDetails: optionalText(255, 'La localisation'),
    notes: optionalLongText
  })
  .superRefine((values, ctx) => {
    if (
      values.warrantyStartDate &&
      values.warrantyEndDate &&
      values.warrantyEndDate < values.warrantyStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['warrantyEndDate'],
        message: 'La fin de garantie doit etre posterieure au debut de garantie'
      });
    }

    if (values.installationDate) {
      const installationDate = parseIsoDate(values.installationDate);
      if (!installationDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['installationDate'],
          message: "La date d'installation est invalide"
        });
      } else if (installationDate > MAX_INSTALLATION_DATE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['installationDate'],
          message: "La date d'installation ne peut pas etre dans le futur lointain"
        });
      }
    }
  });

export const defaultEquipmentFormValues = {
  clientId: '',
  category: 'PC',
  brand: '',
  model: '',
  serialNumber: '',
  installationDate: '',
  status: 'ACTIVE',
  source: 'SENTECHCARE',
  warrantyStartDate: '',
  warrantyEndDate: '',
  locationDetails: '',
  notes: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toEquipmentPayload(values) {
  return {
    clientId: Number(values.clientId),
    category: values.category,
    brand: toNullableText(values.brand),
    model: toNullableText(values.model),
    serialNumber: toNullableText(values.serialNumber),
    installationDate: toNullableText(values.installationDate),
    status: values.status,
    source: values.source,
    warrantyStartDate: toNullableText(values.warrantyStartDate),
    warrantyEndDate: toNullableText(values.warrantyEndDate),
    locationDetails: toNullableText(values.locationDetails),
    notes: toNullableText(values.notes)
  };
}

export function toEquipmentFormValues(equipment) {
  if (!equipment) {
    return { ...defaultEquipmentFormValues };
  }

  return {
    clientId: equipment.clientId ? String(equipment.clientId) : '',
    category: equipment.category ?? 'PC',
    brand: equipment.brand ?? '',
    model: equipment.model ?? '',
    serialNumber: equipment.serialNumber ?? '',
    installationDate: equipment.installationDate ?? '',
    status: equipment.status ?? 'ACTIVE',
    source: equipment.source ?? 'SENTECHCARE',
    warrantyStartDate: equipment.warrantyStartDate ?? '',
    warrantyEndDate: equipment.warrantyEndDate ?? '',
    locationDetails: equipment.locationDetails ?? '',
    notes: equipment.notes ?? ''
  };
}
