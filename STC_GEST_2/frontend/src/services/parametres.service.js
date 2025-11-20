import apiClient, { extractData } from './apiClient';

export const parametresService = {
  get: async () => extractData(await apiClient.get('/parametres')),
  update: async (payload) => extractData(await apiClient.put('/parametres', payload))
};
