import apiClient, { extractData } from './apiClient';

export const stocksService = {
  list: async () => extractData(await apiClient.get('/stocks')),
  getById: async (id) => extractData(await apiClient.get(`/stocks/${id}`)),
  getByMaterielId: async (materielId) => extractData(await apiClient.get(`/stocks/materiel/${materielId}`)),
  create: async (payload) => extractData(await apiClient.post('/stocks', payload)),
  update: async (id, payload) => extractData(await apiClient.put(`/stocks/${id}`, payload)),
  generateInventoryNumber: async (id, payload = {}) =>
    extractData(await apiClient.post(`/stocks/${id}/generate-inventory-number`, payload)),
  generateBarcode: async (id) => extractData(await apiClient.post(`/stocks/${id}/generate-barcode`)),
  generateQrCode: async (id) => extractData(await apiClient.post(`/stocks/${id}/generate-qrcode`)),
  getLabelPreview: async (id, options = {}) => {
    const params = new URLSearchParams(options).toString();
    return extractData(await apiClient.get(`/stocks/${id}/label-preview${params ? `?${params}` : ''}`));
  },
  getLabelPdfUrl: (id, options = {}) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const params = new URLSearchParams(options).toString();
    return `${baseUrl}/stocks/${id}/label-pdf${params ? `?${params}` : ''}`;
  }
};
