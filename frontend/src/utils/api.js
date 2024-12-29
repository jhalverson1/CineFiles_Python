import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
    // Log the full URL being requested
    console.log('Making request to:', `${baseURL}${config.url}`);
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
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

export const movieApi = {
  getPopularMovies: (page = 1) => api.get(`/api/movies/popular?page=${page}`),
  getTopRatedMovies: (page = 1) => api.get(`/api/movies/top-rated?page=${page}`),
  getUpcomingMovies: (page = 1) => api.get(`/api/movies/upcoming?page=${page}`),
  getHiddenGems: (page = 1) => api.get(`/api/movies/hidden-gems?page=${page}`),
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
  googleAuth: (data) => api.post('/api/auth/google', data),
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

// List Management
export const getLists = async () => {
  const response = await api.get('/api/lists');
  return response;
};

export const getList = async (listId) => {
  const response = await api.get(`/api/lists/${listId}`);
  return response;
};

export const createList = async (name, description = '') => {
  const response = await api.post('/api/lists', { name, description });
  return response;
};

export const updateList = async (listId, { name, description }) => {
  const response = await api.patch(`/api/lists/${listId}`, { name, description });
  return response;
};

export const deleteList = async (listId) => {
  await api.delete(`/api/lists/${listId}`);
};

export const addMovieToList = async (listId, movieId, notes = '') => {
  const response = await api.post(`/api/lists/${listId}/items`, { movie_id: movieId, notes });
  return response;
};

export const removeMovieFromList = async (listId, movieId) => {
  await api.delete(`/api/lists/${listId}/items/${movieId}`);
};

export default api; 