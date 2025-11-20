import apiClient, { extractData } from './apiClient';

export const rechercheService = {
  searchMateriel: async (value) => extractData(await apiClient.get(`/recherche/materiel/${encodeURIComponent(value)}`))
};
