import { z } from 'zod';

const INTERVENTION_TYPE_VALUES = [
  'INSTALLATION',
  'TROUBLESHOOTING',
  'MAINTENANCE',
  'UPDATE',
  'VISIT',
  'OTHER'
];

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export const ticketConversionSchema = z.object({
  interventionType: z.enum(INTERVENTION_TYPE_VALUES, {
    required_error: "Le type d'intervention est obligatoire"
  }),
  assignedTechnicianId: z.preprocess(
    toOptionalNumber,
    z.number().int().positive('Le technicien est invalide').optional()
  ),
  plannedDate: z.string().trim(),
  closeTicket: z.boolean(),
  resolutionComment: z
    .string()
    .trim()
    .max(1000, 'Le commentaire ne doit pas depasser 1000 caracteres')
});

export const defaultTicketConversionValues = {
  interventionType: 'TROUBLESHOOTING',
  assignedTechnicianId: '',
  plannedDate: '',
  closeTicket: false,
  resolutionComment: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toTicketConversionPayload(values) {
  return {
    interventionType: values.interventionType,
    assignedTechnicianId: values.assignedTechnicianId ? Number(values.assignedTechnicianId) : null,
    plannedDate: toNullableText(values.plannedDate),
    closeTicket: Boolean(values.closeTicket),
    resolutionComment: toNullableText(values.resolutionComment)
  };
}
