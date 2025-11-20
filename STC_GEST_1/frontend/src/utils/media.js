const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const backendBase = apiBase.replace(/\/api\/?$/, '');

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const normalized = path.replace(/^\/+/, '');
  return `${backendBase}/${normalized}`;
};
