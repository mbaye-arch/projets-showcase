import { z } from 'zod';

const TYPE_VALUES = ['INSTALLATION', 'TROUBLESHOOTING', 'MAINTENANCE', 'UPDATE', 'VISIT', 'OTHER'];
const STATUS_VALUES = ['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const optionalLongText = z.string().trim();

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

export const interventionFormSchema = z
  .object({
    clientId: z.coerce.number({
      invalid_type_error: 'Le client est obligatoire'
    }).int().positive('Le client est obligatoire'),
    assignedTechnicianId: z.preprocess(
      toOptionalNumber,
      z.number().int().positive('Le technicien assigne est invalide').optional()
    ),
    type: z.enum(TYPE_VALUES, {
      required_error: "Le type d'intervention est obligatoire"
    }),
    plannedDate: z.string().trim(),
    actualDate: z.string().trim(),
    status: z.enum(STATUS_VALUES, {
      required_error: 'Le statut est obligatoire'
    }),
    priority: z.enum(PRIORITY_VALUES, {
      required_error: 'La priorite est obligatoire'
    }),
    problemDescription: z
      .string()
      .trim()
      .min(1, 'La description du probleme est obligatoire'),
    diagnosis: optionalLongText,
    solutionProvided: optionalLongText,
    durationMinutes: z.preprocess(
      toOptionalNumber,
      z.number().int().positive('La duree doit etre superieure a 0').optional()
    ),
    cost: z.preprocess(
      toOptionalNumber,
      z.number().min(0, 'Le cout doit etre superieur ou egal a 0').optional()
    ),
    closingNotes: optionalLongText
  })
  .superRefine((values, ctx) => {
    if (values.plannedDate && values.actualDate && values.actualDate < values.plannedDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['actualDate'],
        message: 'La date reelle ne peut pas etre avant la date prevue'
      });
    }
  });

export const defaultInterventionFormValues = {
  clientId: '',
  assignedTechnicianId: '',
  type: 'TROUBLESHOOTING',
  plannedDate: '',
  actualDate: '',
  status: 'PENDING',
  priority: 'NORMAL',
  problemDescription: '',
  diagnosis: '',
  solutionProvided: '',
  durationMinutes: '',
  cost: '',
  closingNotes: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 16);
}

export function toInterventionPayload(values) {
  return {
    clientId: Number(values.clientId),
    assignedTechnicianId: values.assignedTechnicianId ? Number(values.assignedTechnicianId) : null,
    type: values.type,
    plannedDate: toNullableText(values.plannedDate),
    actualDate: toNullableText(values.actualDate),
    status: values.status,
    priority: values.priority,
    problemDescription: values.problemDescription.trim(),
    diagnosis: toNullableText(values.diagnosis),
    solutionProvided: toNullableText(values.solutionProvided),
    durationMinutes:
      values.durationMinutes === '' || values.durationMinutes === null || values.durationMinutes === undefined
        ? null
        : Number(values.durationMinutes),
    cost:
      values.cost === '' || values.cost === null || values.cost === undefined
        ? null
        : Number(values.cost),
    closingNotes: toNullableText(values.closingNotes)
  };
}

export function toInterventionFormValues(intervention) {
  if (!intervention) {
    return { ...defaultInterventionFormValues };
  }

  return {
    clientId: intervention.clientId ? String(intervention.clientId) : '',
    assignedTechnicianId: intervention.assignedTechnicianId ? String(intervention.assignedTechnicianId) : '',
    type: intervention.type ?? 'TROUBLESHOOTING',
    plannedDate: toDateTimeLocalValue(intervention.plannedDate),
    actualDate: toDateTimeLocalValue(intervention.actualDate),
    status: intervention.status ?? 'PENDING',
    priority: intervention.priority ?? 'NORMAL',
    problemDescription: intervention.problemDescription ?? '',
    diagnosis: intervention.diagnosis ?? '',
    solutionProvided: intervention.solutionProvided ?? '',
    durationMinutes: intervention.durationMinutes ?? '',
    cost: intervention.cost ?? '',
    closingNotes: intervention.closingNotes ?? ''
  };
}

export function toInterventionRequestFromResponse(intervention, overrides = {}) {
  const merged = {
    ...(intervention ?? {}),
    ...overrides
  };

  return {
    clientId: Number(merged.clientId),
    assignedTechnicianId: toNullableNumber(merged.assignedTechnicianId),
    type: merged.type,
    plannedDate: toNullableText(merged.plannedDate),
    actualDate: toNullableText(merged.actualDate),
    status: merged.status,
    priority: merged.priority,
    problemDescription: String(merged.problemDescription ?? '').trim(),
    diagnosis: toNullableText(merged.diagnosis),
    solutionProvided: toNullableText(merged.solutionProvided),
    durationMinutes: toNullableNumber(merged.durationMinutes),
    cost: toNullableNumber(merged.cost),
    closingNotes: toNullableText(merged.closingNotes)
  };
}
