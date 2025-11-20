import axios from 'axios';
import { clearAuthSession, getAuthToken } from '@/lib/authToken';
import { APP_CONFIG } from '@/config/appConfig';
import { normalizeApiError } from '@/utils/apiError';

const httpClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

httpClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedApiError = normalizeApiError(error);
    error.apiError = normalizedApiError;
    error.message = normalizedApiError.message;

    if (
      error?.response?.data
      && typeof error.response.data === 'object'
      && !Array.isArray(error.response.data)
    ) {
      if (!error.response.data.message) {
        error.response.data.message = normalizedApiError.message;
      }

      if (!error.response.data.details && normalizedApiError.details) {
        error.response.data.details = normalizedApiError.details;
      }
    }

    const statusCode = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (statusCode === 401 && !isLoginRequest) {
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
