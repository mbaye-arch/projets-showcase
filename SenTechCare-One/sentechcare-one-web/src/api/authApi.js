import httpClient from '@/api/httpClient';

export async function login(payload) {
  const response = await httpClient.post('/auth/login', payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await httpClient.get('/auth/me');
  return response.data;
}
