import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 20000
});

export function extractData(response) {
  return response?.data?.data;
}

export default apiClient;
