import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await axiosInstance.post('/api/auth/signup', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

export const movieApi = {
  searchMovies: async (query) => {
    const response = await axiosInstance.get(`/api/movies/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  getPopularMovies: async () => {
    const response = await axiosInstance.get('/api/movies/popular');
    return response.data;
  },

  getTopRatedMovies: async () => {
    const response = await axiosInstance.get('/api/movies/top-rated');
    return response.data;
  },

  getUpcomingMovies: async () => {
    const response = await axiosInstance.get('/api/movies/upcoming');
    return response.data;
  },

  getMovieNews: async () => {
    const response = await axiosInstance.get('/api/movies/news');
    return response.data;
  }
}; 