import { z } from 'zod';

function toNullableText(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function passwordSchema(required) {
  const base = z.string().trim();
  if (required) {
    return base.min(8, 'Le mot de passe doit contenir au moins 8 caracteres');
  }
  return base.refine(
    (value) => value.length === 0 || value.length >= 8,
    'Le mot de passe doit contenir au moins 8 caracteres'
  );
}

export function buildUserFormSchema({ requirePassword = true } = {}) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(1, 'Le prenom est obligatoire')
      .max(100, 'Le prenom ne doit pas depasser 100 caracteres'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Le nom est obligatoire')
      .max(100, 'Le nom ne doit pas depasser 100 caracteres'),
    email: z
      .string()
      .trim()
      .min(1, "L'email est obligatoire")
      .email("L'email est invalide")
      .max(255, "L'email ne doit pas depasser 255 caracteres"),
    password: passwordSchema(requirePassword),
    phone: z
      .string()
      .trim()
      .max(30, 'Le telephone ne doit pas depasser 30 caracteres'),
    active: z.boolean(),
    roleId: z.coerce
      .number({
        invalid_type_error: 'Le role est obligatoire'
      })
      .int()
      .positive('Le role est obligatoire')
  });
}

export const defaultUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  active: true,
  roleId: ''
};

export function toUserFormValues(user) {
  if (!user) {
    return { ...defaultUserFormValues };
  }

  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    password: '',
    phone: user.phone ?? '',
    active: user.active ?? true,
    roleId: user.roleId ? String(user.roleId) : ''
  };
}

export function toUserPayload(values, { isEdit = false } = {}) {
  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: toNullableText(values.phone),
    active: Boolean(values.active),
    roleId: Number(values.roleId)
  };

  const normalizedPassword = values.password?.trim() ?? '';
  if (!isEdit || normalizedPassword.length > 0) {
    payload.password = normalizedPassword;
  }

  return payload;
}
