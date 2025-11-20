const STATUS_FALLBACK_MESSAGES = {
  400: 'Requete invalide.',
  401: 'Session expiree ou non autorisee. Veuillez vous reconnecter.',
  403: 'Vous n avez pas les permissions necessaires pour cette action.',
  404: 'Ressource introuvable.',
  409: 'Conflit detecte sur la ressource.',
  422: 'Donnees invalides.',
  500: 'Erreur interne du serveur. Veuillez reessayer.',
  502: 'Service temporairement indisponible.',
  503: 'Service temporairement indisponible.',
  504: 'Le service met trop de temps a repondre.'
};

const MESSAGE_TRANSLATIONS = new Map([
  ['unauthorized', 'Session expiree ou non autorisee. Veuillez vous reconnecter.'],
  ['access denied', 'Vous n avez pas les permissions necessaires pour cette action.'],
  ['invalid email or password', 'Email ou mot de passe invalide.'],
  ['validation failed', 'Certaines donnees sont invalides.'],
  ['malformed request payload', 'Le format de la requete est invalide.'],
  ['request failed', 'La requete a echoue.'],
  ['unexpected internal server error', 'Erreur interne du serveur. Veuillez reessayer.']
]);

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function normalizeMessage(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function localizeMessage(message) {
  const normalized = normalizeMessage(message);
  if (!normalized) {
    return null;
  }

  const translated = MESSAGE_TRANSLATIONS.get(normalized.toLowerCase());
  return translated || normalized;
}

function getRawErrorData(error) {
  return error?.response?.data || null;
}

function getStatusCode(error) {
  return Number(error?.response?.status || error?.apiError?.status || 0) || null;
}

function toFieldErrorMap(value) {
  const obj = asObject(value);
  if (!obj) {
    return {};
  }

  return Object.entries(obj).reduce((acc, [key, val]) => {
    const message = normalizeMessage(Array.isArray(val) ? val.join(', ') : String(val));
    if (message) {
      acc[key] = message;
    }
    return acc;
  }, {});
}

function normalizeFieldPath(fieldPath) {
  if (!fieldPath || typeof fieldPath !== 'string') {
    return '';
  }

  return fieldPath
    .trim()
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/^\./, '');
}

function getStatusFallbackMessage(statusCode) {
  if (!statusCode) {
    return null;
  }

  return STATUS_FALLBACK_MESSAGES[statusCode] || null;
}

export function extractApiFieldErrors(error) {
  const data = asObject(getRawErrorData(error));
  const apiErrorDetails = toFieldErrorMap(error?.apiError?.details);

  if (Object.keys(apiErrorDetails).length > 0) {
    return apiErrorDetails;
  }

  if (!data) {
    return {};
  }

  const details = toFieldErrorMap(data.details);
  if (Object.keys(details).length > 0) {
    return details;
  }

  const errors = toFieldErrorMap(data.errors);
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  const fieldErrors = toFieldErrorMap(data.fieldErrors);
  if (Object.keys(fieldErrors).length > 0) {
    return fieldErrors;
  }

  return {};
}

export function extractApiErrorMessage(error, fallbackMessage = 'Une erreur est survenue.') {
  const directMessage = localizeMessage(error?.apiError?.message);
  if (directMessage) {
    return directMessage;
  }

  const data = asObject(getRawErrorData(error));
  const fromPayload = localizeMessage(data?.message)
    || localizeMessage(data?.error)
    || localizeMessage(data?.title)
    || localizeMessage(data?.detail);

  if (fromPayload) {
    return fromPayload;
  }

  const statusCode = getStatusCode(error);
  const fromStatus = getStatusFallbackMessage(statusCode);
  if (fromStatus) {
    return fromStatus;
  }

  const fromAxios = localizeMessage(error?.message);
  if (fromAxios) {
    return fromAxios;
  }

  return fallbackMessage;
}

export function normalizeApiError(error, fallbackMessage = 'Une erreur est survenue.') {
  const status = getStatusCode(error);
  const details = extractApiFieldErrors(error);
  const message = extractApiErrorMessage(error, fallbackMessage);
  const timestamp = error?.response?.data?.timestamp || null;

  return {
    status,
    message,
    details: Object.keys(details).length > 0 ? details : null,
    timestamp,
    raw: getRawErrorData(error)
  };
}

export function applyApiFieldErrors(error, setError, fieldMap = {}) {
  const details = extractApiFieldErrors(error);
  const entries = Object.entries(details);
  if (entries.length === 0) {
    return false;
  }

  let applied = false;

  entries.forEach(([field, message]) => {
    const mappedField = fieldMap[field] || normalizeFieldPath(field);
    if (!mappedField || mappedField === 'request' || mappedField === '_global') {
      return;
    }

    try {
      setError(mappedField, { type: 'server', message });
      applied = true;
    } catch {
      // Ignore invalid field paths that are not present in the current form schema.
    }
  });

  return applied;
}
