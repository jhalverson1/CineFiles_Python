import { API_BASE_URL } from './constants';

export const getImageUrl = (path, size = 'original') => {
  if (!path) return '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/api/proxy/image/${size}/${cleanPath}`;
}; 