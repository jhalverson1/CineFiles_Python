import axios from 'axios';
import { API_BASE_URL } from './constants';

// Enhanced API configuration logging
console.log('🔧 Detailed API Configuration:', {
  API_BASE_URL,
  'process.env.REACT_APP_API_URL': process.env.REACT_APP_API_URL,
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'window.location.origin': window.location.origin,
  'axios baseURL': API_BASE_URL
});

// Log any potential mismatches
if (API_BASE_URL !== process.env.REACT_APP_API_URL) {
  console.warn('⚠️ Warning: API_BASE_URL does not match REACT_APP_API_URL', {
    API_BASE_URL,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL
  });
}

// Configure axios with logging
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
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