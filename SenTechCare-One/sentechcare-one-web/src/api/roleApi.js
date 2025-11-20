import httpClient from '@/api/httpClient';

export async function getRoles() {
  const response = await httpClient.get('/roles');
  return response.data;
}

