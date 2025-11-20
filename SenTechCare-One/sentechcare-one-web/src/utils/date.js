const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDateOnlyAsLocal(dateValue) {
  const match = DATE_ONLY_REGEX.exec(dateValue);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(year, monthIndex, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseApiTemporal(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const localDate = parseDateOnlyAsLocal(normalized);
  if (localDate) {
    return localDate;
  }

  const dateTime = new Date(normalized);
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
}

export function formatApiDate(value, locale = 'fr-FR') {
  const parsedDate = parseApiTemporal(value);
  if (!parsedDate) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(parsedDate);
}

export function formatApiDateTime(value, locale = 'fr-FR') {
  const parsedDateTime = parseApiTemporal(value);
  if (!parsedDateTime) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsedDateTime);
}

export function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
