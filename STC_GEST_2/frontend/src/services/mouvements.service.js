import apiClient, { extractData } from './apiClient';

export const mouvementsService = {
  list: async () => extractData(await apiClient.get('/mouvements-stock')),
  getById: async (id) => extractData(await apiClient.get(`/mouvements-stock/${id}`)),
  create: async (payload) => extractData(await apiClient.post('/mouvements-stock', payload))
};
