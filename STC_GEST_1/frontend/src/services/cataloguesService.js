import api from './api';

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const cataloguesService = {
  async list(params = {}) {
    const { data } = await api.get('/catalogues', { params });
    return data.data;
  },

  async getById(id) {
    const { data } = await api.get(`/catalogues/${id}`);
    return data.data;
  },

  async create(formData) {
    const { data } = await api.post('/catalogues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data.data;
  },

  async update(id, formData) {
    const { data } = await api.put(`/catalogues/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data.data;
  },

  async remove(id) {
    await api.delete(`/catalogues/${id}`);
  },

  async duplicate(id) {
    const { data } = await api.post(`/catalogues/${id}/duplicate`);
    return data.data;
  },

  async preview(id) {
    const { data } = await api.get(`/catalogues/${id}/preview`);
    return data.data;
  },

  getExportPdfUrl(id) {
    return `${apiBase}/catalogues/${id}/export-pdf`;
  },

  async createSection(catalogueId, payload) {
    const { data } = await api.post(`/catalogues/${catalogueId}/sections`, payload);
    return data.data;
  },

  async updateSection(catalogueId, sectionId, payload) {
    const { data } = await api.put(`/catalogues/${catalogueId}/sections/${sectionId}`, payload);
    return data.data;
  },

  async deleteSection(catalogueId, sectionId) {
    await api.delete(`/catalogues/${catalogueId}/sections/${sectionId}`);
  },

  async addItems(catalogueId, payload) {
    const { data } = await api.post(`/catalogues/${catalogueId}/items`, payload);
    return data.data;
  },

  async updateItem(catalogueId, itemId, payload, isMultipart = false) {
    const config = isMultipart
      ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      : undefined;

    const { data } = await api.put(`/catalogues/${catalogueId}/items/${itemId}`, payload, config);
    return data.data;
  },

  async deleteItem(catalogueId, itemId) {
    await api.delete(`/catalogues/${catalogueId}/items/${itemId}`);
  }
};
