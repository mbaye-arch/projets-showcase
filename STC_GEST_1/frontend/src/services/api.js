import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 20000
});

export const getApiErrorMessage = (error, fallbackMessage = 'Une erreur est survenue') => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === 'ECONNABORTED') {
    return "L'API ne répond pas à temps. Vérifie que le backend est bien démarré.";
  }

  if (error?.message === 'Network Error') {
    return 'Backend/API inaccessible. Lance le backend et vérifie la connexion MySQL.';
  }

  return fallbackMessage;
};

export default api;
