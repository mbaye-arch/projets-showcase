import api from './api';

export const suppliersService = {
  async list(params = {}) {
    const { data } = await api.get('/suppliers', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/suppliers/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/suppliers', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/suppliers/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    await api.delete(`/suppliers/${id}`);
  }
};
