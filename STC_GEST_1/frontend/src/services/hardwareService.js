import api from './api';

export const hardwareService = {
  async list(params = {}) {
    const { data } = await api.get('/hardware', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/hardware/${id}`);
    return data.data;
  },

  async create(formData) {
    const { data } = await api.post('/hardware', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data.data;
  },

  async update(id, formData) {
    const { data } = await api.put(`/hardware/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data.data;
  },

  async remove(id) {
    await api.delete(`/hardware/${id}`);
  },

  async removeImage(hardwareId, imageId) {
    await api.delete(`/hardware/${hardwareId}/images/${imageId}`);
  }
};
