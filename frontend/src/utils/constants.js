// Environment-aware API configuration
const getApiBaseUrl = () => {
  const deployEnv = process.env.REACT_APP_DEPLOY_ENV || 'local';
  
  const apiUrls = {
    local: 'http://localhost:8080',
    staging: 'https://backend-staging-df72.up.railway.app',
    production: process.env.REACT_APP_API_URL
  };

  return process.env.REACT_APP_API_URL || apiUrls[deployEnv] || apiUrls.local;
};

export const API_BASE_URL = getApiBaseUrl();
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZES = {
  SMALL: 'w185',
  MEDIUM: 'w500',
  LARGE: 'original'
}; 