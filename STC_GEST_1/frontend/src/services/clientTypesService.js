import api from './api';

export const clientTypesService = {
  async list(params = {}) {
    const { data } = await api.get('/types-clients', { params });
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/types-clients', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/types-clients/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    await api.delete(`/types-clients/${id}`);
  }
};
