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

// Add a flag to prevent multiple token verifications at once
let isVerifyingToken = false;
let lastTokenVerification = 0;
const TOKEN_VERIFY_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Function to verify token
const verifyToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    await api.get('/api/auth/verify');
    lastTokenVerification = Date.now();
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    // If verification fails, clear the token
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Skip token verification for auth endpoints
    const isAuthEndpoint = config.url.includes('/api/auth/login') || 
                          config.url.includes('/api/auth/signup') ||
                          config.url.includes('/api/auth/verify');

    if (!isAuthEndpoint) {
      // Verify token if it hasn't been verified recently
      const shouldVerify = !isVerifyingToken && 
                          Date.now() - lastTokenVerification > TOKEN_VERIFY_INTERVAL;

      if (shouldVerify) {
        isVerifyingToken = true;
        try {
          const isValid = await verifyToken();
          if (!isValid) {
            // Token is invalid, redirect to login or handle as needed
            window.location.href = '/login';
            return Promise.reject('Invalid token');
          }
        } finally {
          isVerifyingToken = false;
        }
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      const tokenWithBearer = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = tokenWithBearer;
    }
    
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
  getPopularMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/popular?${params.toString()}`);
  },
  
  getTopRatedMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/top-rated?${params.toString()}`);
  },
  
  getUpcomingMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/upcoming?${params.toString()}`);
  },
  
  getNowPlayingMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/now-playing?${params.toString()}`);
  },
  
  getListMovies: async (listId, page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/lists/${listId}/movies?${params.toString()}`);
  },
  
  getFilterSettingMovies: async (filterId, page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/filter-settings/${filterId}/movies?${params.toString()}`);
  },
  
  getFilteredMovies: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/filtered?${params.toString()}`);
  },
  
  getMovieGenres: async () => {
    try {
      console.log('Fetching movie genres...');
      const response = await api.get('/api/movies/genres');
      console.log('Raw genres response:', response);
      if (response && response.genres) {
        console.log('Processed genres:', response.genres);
        return response;
      } else {
        console.error('Unexpected genres response structure:', response);
        return { genres: [] };
      }
    } catch (error) {
      console.error('Error fetching genres:', error.response || error);
      throw error;
    }
  },
  
  getMovieDetails: (id) => api.get(`/api/movies/${id}`),
  getMovieCredits: (id) => api.get(`/api/movies/${id}/credits`),
  getMovieVideos: (id) => api.get(`/api/movies/${id}/videos`),
  getPersonDetails: (id) => api.get(`/api/person/${id}`),
  getMovieWatchProviders: (id) => api.get(`/api/movies/${id}/watch-providers`),
};

// Helper function to add filter parameters
const addFilterParams = (params, filters) => {
  const {
    yearRange,
    ratingRange,
    popularityRange,
    genres,
    sortBy,
    minVoteCount,
    releaseDate
  } = filters;

  if (yearRange?.length === 2) {
    params.append('start_year', yearRange[0].toString());
    params.append('end_year', yearRange[1].toString());
  }
  
  if (ratingRange?.length === 2) {
    params.append('min_rating', ratingRange[0].toString());
    params.append('max_rating', ratingRange[1].toString());
  }
  
  if (popularityRange?.length === 2) {
    params.append('min_popularity', popularityRange[0].toString());
    params.append('max_popularity', popularityRange[1].toString());
  }
  
  if (genres?.length > 0) {
    params.append('genres', genres.join(','));
  }
  
  if (sortBy) {
    params.append('sort_by', sortBy);
  }
  
  if (minVoteCount) {
    params.append('min_vote_count', minVoteCount.toString());
  }
  
  if (releaseDate?.gte) {
    params.append('release_date_gte', releaseDate.gte);
  }
  
  if (releaseDate?.lte) {
    params.append('release_date_lte', releaseDate.lte);
  }
};

export const authApi = {
  login: (formData) => api.post('/api/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
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

export const filterSettingsApi = {
  getFilterSettings: async () => {
    const response = await api.get('/api/filter-settings');
    return response;
  },

  getHomepageFilters: async () => {
    const response = await api.get('/api/filter-settings/homepage');
    return response;
  },

  createFilterSetting: async (filterSetting) => {
    const response = await api.post('/api/filter-settings', filterSetting);
    return response;
  },

  updateFilterSetting: async (id, filterSetting) => {
    const response = await api.put(`/api/filter-settings/${id}`, filterSetting);
    return response;
  },

  deleteFilterSetting: async (id) => {
    await api.delete(`/api/filter-settings/${id}`);
  },

  reorderHomepageFilters: async (filterIds) => {
    const response = await api.put('/api/filter-settings/homepage/reorder', filterIds);
    return response;
  }
};

export default api; 