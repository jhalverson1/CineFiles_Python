// Environment-aware API configuration
const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZES = {
  SMALL: 'w185',
  MEDIUM: 'w500',
  LARGE: 'original'
}; 