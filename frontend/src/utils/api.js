import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure Bearer prefix is present
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = tokenWithBearer;
    }
    
    // Ensure consistent header format
    config.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    console.log('API Request:', {
      url: `${baseURL}${config.url}`,
      method: config.method,
      hasToken: !!token,
      tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none',
      headers: JSON.stringify(config.headers)
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: `${baseURL}${response.config.url}`,
      status: response.status,
      hasData: !!response.data,
      dataType: response.data ? typeof response.data : 'none',
      headers: response.headers
    });
    return response.data;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      requestHeaders: error.config?.headers,
      responseHeaders: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export const movieApi = {
  getPopularMovies: (page = 1) => api.get(`/api/movies/popular?page=${page}`),
  getTopRatedMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    
    if (filters.yearRange?.length === 2) {
      params.append('year_range', `[${filters.yearRange[0]},${filters.yearRange[1]}]`);
    }
    if (filters.ratingRange?.length === 2) {
      params.append('rating_range', `[${filters.ratingRange[0]},${filters.ratingRange[1]}]`);
    }
    if (filters.popularityRange?.length === 2) {
      params.append('popularity_range', `[${filters.popularityRange[0]},${filters.popularityRange[1]}]`);
    }
    
    return api.get(`/api/movies/top-rated?${params.toString()}`);
  },
  getUpcomingMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    
    if (filters.yearRange?.length === 2) {
      params.append('year_range', `[${filters.yearRange[0]},${filters.yearRange[1]}]`);
    }
    if (filters.ratingRange?.length === 2) {
      params.append('rating_range', `[${filters.ratingRange[0]},${filters.ratingRange[1]}]`);
    }
    if (filters.popularityRange?.length === 2) {
      params.append('popularity_range', `[${filters.popularityRange[0]},${filters.popularityRange[1]}]`);
    }
    
    return api.get(`/api/movies/upcoming?${params.toString()}`);
  },
  getHiddenGems: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    
    if (filters.yearRange?.length === 2) {
      params.append('year_range', `[${filters.yearRange[0]},${filters.yearRange[1]}]`);
    }
    if (filters.ratingRange?.length === 2) {
      params.append('rating_range', `[${filters.ratingRange[0]},${filters.ratingRange[1]}]`);
    }
    if (filters.popularityRange?.length === 2) {
      params.append('popularity_range', `[${filters.popularityRange[0]},${filters.popularityRange[1]}]`);
    }
    
    return api.get(`/api/movies/hidden-gems?${params.toString()}`);
  },
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