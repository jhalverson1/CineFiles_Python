import axios from 'axios';
import { API_BASE_URL } from './constants';

// Temporary alert to verify code execution
alert('API Configuration Loading - API_BASE_URL: ' + API_BASE_URL);

// STARTUP LOGGING
console.log('🚨 APPLICATION STARTUP 🚨');
console.log('==========================================');
console.log('API CONFIGURATION:', {
  API_BASE_URL,
  'process.env.REACT_APP_API_URL': process.env.REACT_APP_API_URL,
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'window.location.origin': window.location.origin
});
console.log('==========================================');

// Configure axios
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,  // Disable credentials for now
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor with more detailed logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 Outgoing Request:', {
      fullUrl: config.baseURL + config.url,
      method: config.method,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with more error details
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response Received:', {
      status: response.status,
      headers: response.headers,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullUrl: error.config?.baseURL + error.config?.url,
      headers: error.config?.headers
    });
    return Promise.reject(error);
  }
);

export const movieApi = {
  searchMovies: async (query) => {
    const response = await axiosInstance.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
    console.log('Search Response:', response.data);
    return response.data;
  },

  getPopularMovies: async () => {
    const response = await axiosInstance.get('/api/movies/popular');
    console.log('Popular Movies Response:', response.data);
    return response.data;
  },

  getTopRatedMovies: async () => {
    const response = await axiosInstance.get('/api/movies/top-rated');
    console.log('Top Rated Response:', response.data);
    return response.data;
  },

  getUpcomingMovies: async () => {
    const response = await axiosInstance.get('/api/movies/upcoming');
    console.log('Upcoming Response:', response.data);
    return response.data;
  },

  getMovieNews: async () => {
    const response = await axiosInstance.get('/api/movies/news');
    console.log('News Response:', response.data);
    return response.data;
  }
}; 