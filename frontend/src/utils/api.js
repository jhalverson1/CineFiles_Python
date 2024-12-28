import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const movieApi = {
  getPopularMovies: (page = 1) => api.get(`/api/movies/popular?page=${page}`),
  getTopRatedMovies: (page = 1) => api.get(`/api/movies/top-rated?page=${page}`),
  getUpcomingMovies: (page = 1) => api.get(`/api/movies/upcoming?page=${page}`),
  getMovieNews: () => api.get('/api/movies/news'),
  searchMovies: (query) => api.get(`/api/movies/search?query=${encodeURIComponent(query)}`),
  getMovieDetails: (id) => api.get(`/api/movies/${id}`),
  getMovieCredits: (id) => api.get(`/api/movies/${id}/credits`),
  getMovieVideos: (id) => api.get(`/api/movies/${id}/videos`),
  getPersonDetails: (id) => api.get(`/api/person/${id}`),
  getMovieWatchProviders: (id) => api.get(`/api/movies/${id}/watch-providers`),
};

export const authApi = {
  login: (formData) => api.post('/api/auth/login', formData, {
    headers: {
      // Don't set Content-Type - axios will set it automatically for FormData
      'Content-Type': undefined
    }
  }),
  signup: (userData) => api.post('/api/auth/signup', userData),
  verifyToken: () => api.get('/api/auth/verify'),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    return Promise.resolve();
  },
};

export const getUserById = async (id) => {
  return await api.get(`/users/${id}`);
};

export default api; 