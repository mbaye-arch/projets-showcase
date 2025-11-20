const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return String(value).toLowerCase() === 'true';
};

export const APP_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || 'SenTechCare One',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  enableQuoteConversion: toBoolean(import.meta.env.VITE_ENABLE_QUOTE_CONVERSION, true)
};
