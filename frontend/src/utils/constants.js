// Environment-aware API configuration
const getApiBaseUrl = () => {
  const deployEnv = process.env.REACT_APP_DEPLOY_ENV || 'local';
  
  // Map of deployment environments to API URLs
  const apiUrls = {
    local: 'http://localhost:8080',
    staging: 'https://backend-staging-df72.up.railway.app',
    production: process.env.REACT_APP_API_URL // Will be set for production
  };

  // Use explicit REACT_APP_API_URL if provided, otherwise use environment mapping
  return process.env.REACT_APP_API_URL || apiUrls[deployEnv] || apiUrls.local;
};

export const API_BASE_URL = getApiBaseUrl();

// Log the configuration decision
console.log('🔧 Constants Configuration:', {
  NODE_ENV: process.env.NODE_ENV, // This should be 'production' for both staging/prod
  DEPLOY_ENV: process.env.REACT_APP_DEPLOY_ENV,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  API_BASE_URL,
  isProduction: process.env.NODE_ENV === 'production'
});

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const POSTER_SIZES = {
  SMALL: 'w185',
  MEDIUM: 'w500',
  LARGE: 'original'
}; 