import apiClient, { extractData } from './apiClient';

export const inventairesService = {
  list: async () => extractData(await apiClient.get('/inventaires')),
  getById: async (id) => extractData(await apiClient.get(`/inventaires/${id}`)),
  create: async (payload) => extractData(await apiClient.post('/inventaires', payload)),
  addItems: async (inventaireId, payload) =>
    extractData(await apiClient.post(`/inventaires/${inventaireId}/items`, payload))
};
