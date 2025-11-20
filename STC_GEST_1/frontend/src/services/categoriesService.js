import api from './api';

export const categoriesService = {
  async list(params = {}) {
    const { data } = await api.get('/categories', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/categories', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    await api.delete(`/categories/${id}`);
  }
};
