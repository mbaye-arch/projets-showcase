import api from './api';

export const softwareService = {
  async list(params = {}) {
    const { data } = await api.get('/software', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/software/${id}`);
    return data.data;
  },

  async create(payload) {
    const { data } = await api.post('/software', payload);
    return data.data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/software/${id}`, payload);
    return data.data;
  },

  async remove(id) {
    await api.delete(`/software/${id}`);
  }
};
