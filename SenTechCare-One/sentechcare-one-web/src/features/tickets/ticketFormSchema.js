import { z } from 'zod';

const CHANNEL_VALUES = ['PHONE', 'WHATSAPP', 'EMAIL', 'VISIT'];
const STATUS_VALUES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_VALUES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const optionalText = (maxLength, label) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} ne doit pas depasser ${maxLength} caracteres`);

const optionalLongText = z.string().trim();

function toOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
}

function parseDateTime(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const ticketFormSchema = z
  .object({
    clientId: z.coerce.number({
      invalid_type_error: 'Le client est obligatoire'
    }).int().positive('Le client est obligatoire'),
    assignedTechnicianId: z.preprocess(
      toOptionalNumber,
      z.number().int().positive('Le technicien assigne est invalide').optional()
    ),
    channel: z.enum(CHANNEL_VALUES, {
      required_error: 'Le canal est obligatoire'
    }),
    subject: z
      .string()
      .trim()
      .min(1, 'Le sujet est obligatoire')
      .max(255, 'Le sujet ne doit pas depasser 255 caracteres'),
    description: z
      .string()
      .trim()
      .min(1, 'La description est obligatoire'),
    priority: z.enum(PRIORITY_VALUES, {
      required_error: 'La priorite est obligatoire'
    }),
    status: z.enum(STATUS_VALUES, {
      required_error: 'Le statut est obligatoire'
    }),
    resolvedAt: z.string().trim(),
    resolutionComment: optionalLongText
  })
  .superRefine((values, ctx) => {
    const isResolvedLikeStatus = values.status === 'RESOLVED' || values.status === 'CLOSED';

    if (!isResolvedLikeStatus && values.resolvedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resolvedAt'],
        message: "La date de resolution est autorisee seulement pour les statuts Resolu ou Ferme"
      });
    }

    if (values.resolvedAt) {
      const parsed = parseDateTime(values.resolvedAt);
      if (!parsed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resolvedAt'],
          message: 'La date de resolution est invalide'
        });
        return;
      }

      const maxAllowed = new Date(Date.now() + 60 * 1000);
      if (parsed > maxAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resolvedAt'],
          message: 'La date de resolution ne peut pas etre dans le futur'
        });
      }
    }
  });

export const defaultTicketFormValues = {
  clientId: '',
  assignedTechnicianId: '',
  channel: 'PHONE',
  subject: '',
  description: '',
  priority: 'NORMAL',
  status: 'OPEN',
  resolvedAt: '',
  resolutionComment: ''
};

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 16);
}

export function toTicketPayload(values) {
  return {
    clientId: Number(values.clientId),
    assignedTechnicianId: values.assignedTechnicianId ? Number(values.assignedTechnicianId) : null,
    channel: values.channel,
    subject: values.subject.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    resolvedAt: toNullableText(values.resolvedAt),
    resolutionComment: toNullableText(values.resolutionComment)
  };
}

export function toTicketFormValues(ticket) {
  if (!ticket) {
    return { ...defaultTicketFormValues };
  }

  return {
    clientId: ticket.clientId ? String(ticket.clientId) : '',
    assignedTechnicianId: ticket.assignedTechnicianId ? String(ticket.assignedTechnicianId) : '',
    channel: ticket.channel ?? 'PHONE',
    subject: ticket.subject ?? '',
    description: ticket.description ?? '',
    priority: ticket.priority ?? 'NORMAL',
    status: ticket.status ?? 'OPEN',
    resolvedAt: toDateTimeLocalValue(ticket.resolvedAt),
    resolutionComment: ticket.resolutionComment ?? ''
  };
}

export function toTicketRequestFromResponse(ticket, overrides = {}) {
  const merged = {
    ...(ticket ?? {}),
    ...overrides
  };

  return {
    clientId: Number(merged.clientId),
    assignedTechnicianId:
      merged.assignedTechnicianId === '' || merged.assignedTechnicianId === null || merged.assignedTechnicianId === undefined
        ? null
        : Number(merged.assignedTechnicianId),
    channel: merged.channel,
    subject: String(merged.subject ?? '').trim(),
    description: String(merged.description ?? '').trim(),
    priority: merged.priority,
    status: merged.status,
    resolvedAt: toNullableText(merged.resolvedAt),
    resolutionComment: toNullableText(merged.resolutionComment)
  };
}
