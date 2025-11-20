import apiClient, { extractData } from './apiClient';

export const materielsService = {
  list: async () => extractData(await apiClient.get('/materiels')),
  getById: async (id) => extractData(await apiClient.get(`/materiels/${id}`)),
  create: async (payload) => extractData(await apiClient.post('/materiels', payload)),
  update: async (id, payload) => extractData(await apiClient.put(`/materiels/${id}`, payload)),
  remove: async (id) => extractData(await apiClient.delete(`/materiels/${id}`))
};
