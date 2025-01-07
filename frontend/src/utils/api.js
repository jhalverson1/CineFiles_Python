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

// Add a flag to prevent multiple token refreshes at once
let isRefreshing = false;
let refreshSubscribers = [];

// Function to add failed requests to queue
const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to retry failed requests
const onRefreshed = (access_token) => {
  refreshSubscribers.forEach(callback => callback(access_token));
  refreshSubscribers = [];
};

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${baseURL}/api/auth/refresh`, { refresh_token });
    const { access_token, refresh_token: new_refresh_token } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('refresh_token', new_refresh_token);
    
    return access_token;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    throw error;
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    // Skip token handling for auth endpoints except refresh
    const isAuthEndpoint = config.url.includes('/api/auth/login') || 
                          config.url.includes('/api/auth/signup');
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or request has already been retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // If already refreshing, queue this request
    if (isRefreshing) {
      try {
        const token = await new Promise(resolve => {
          addSubscriber(token => {
            resolve(token);
          });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    // Start token refresh process
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
      const access_token = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      onRefreshed(access_token);
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, redirect to login
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const authApi = {
  login: async (formData) => {
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('username', response.username);
    return response;
  },
  signup: (userData) => api.post('/api/auth/signup', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    return Promise.resolve();
  },
};

// Helper function to add filter parameters
const addFilterParams = (params, filters) => {
  console.log('Adding filter params:', filters);
  
  const {
    yearRange,
    ratingRange,
    popularityRange,
    genres,
    sortBy,
    minVoteCount,
    releaseDate,
    watchProviders,
    watchRegion,
    voteCountRange,
    runtimeRange,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    includeKeywords,
    excludeKeywords
  } = filters;

  console.log('Processing keywords:', { includeKeywords, excludeKeywords });

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

  // Add watch provider parameters
  if (Array.isArray(watchProviders) && watchProviders.length > 0) {
    console.log('Adding watch providers to params:', watchProviders);
    params.append('watch_providers', watchProviders.join(','));
  }
  
  if (watchRegion) {
    params.append('watch_region', watchRegion);
  }

  // Add vote count range
  if (voteCountRange?.length === 2) {
    params.append('min_vote_count', voteCountRange[0].toString());
    params.append('max_vote_count', voteCountRange[1].toString());
  }

  // Add runtime range
  if (runtimeRange?.length === 2) {
    params.append('min_runtime', runtimeRange[0].toString());
    params.append('max_runtime', runtimeRange[1].toString());
  }

  // Add language filters
  if (originalLanguage) {
    params.append('original_language', originalLanguage);
  }

  if (Array.isArray(spokenLanguages) && spokenLanguages.length > 0) {
    params.append('spoken_languages', spokenLanguages.join(','));
  }

  // Add release types
  if (Array.isArray(releaseTypes) && releaseTypes.length > 0) {
    console.log('Adding release types to params:', releaseTypes);
    params.append('release_types', releaseTypes.join(','));
  }

  // Add keywords
  if (Array.isArray(includeKeywords) && includeKeywords.length > 0) {
    console.log('Adding include_keywords to params:', includeKeywords);
    params.append('include_keywords', includeKeywords.join(','));
  } else if (typeof includeKeywords === 'string' && includeKeywords.trim()) {
    console.log('Adding include_keywords (string) to params:', includeKeywords);
    params.append('include_keywords', includeKeywords.trim());
  }

  if (Array.isArray(excludeKeywords) && excludeKeywords.length > 0) {
    console.log('Adding exclude_keywords to params:', excludeKeywords);
    params.append('exclude_keywords', excludeKeywords.join(','));
  } else if (typeof excludeKeywords === 'string' && excludeKeywords.trim()) {
    console.log('Adding exclude_keywords (string) to params:', excludeKeywords);
    params.append('exclude_keywords', excludeKeywords.trim());
  }

  console.log('Final params:', params.toString());
};

export const movieApi = {
  getPopularMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/popular?${params.toString()}`);
  },
  
  getTopRatedMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/top_rated?${params.toString()}`);
  },
  
  getUpcomingMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/upcoming?${params.toString()}`);
  },
  
  getNowPlayingMovies: (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString() });
    addFilterParams(params, filters);
    return api.get(`/api/movies/now_playing?${params.toString()}`);
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
      return await api.get('/api/movies/genres');
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

export const getUserById = async (id) => {
  return await api.get(`/users/${id}`);
};

// List Management
export const getLists = async () => {
  return await api.get('/api/lists');
};

export const getList = async (listId) => {
  return await api.get(`/api/lists/${listId}`);
};

export const createList = async (name, description = '') => {
  return await api.post('/api/lists', { name, description });
};

export const updateList = async (listId, { name, description }) => {
  return await api.patch(`/api/lists/${listId}`, { name, description });
};

export const deleteList = async (listId) => {
  await api.delete(`/api/lists/${listId}`);
};

export const addMovieToList = async (listId, movieId, notes = '') => {
  return await api.post(`/api/lists/${listId}/items`, { movie_id: movieId, notes });
};

export const removeMovieFromList = async (listId, movieId) => {
  await api.delete(`/api/lists/${listId}/items/${movieId}`);
};

export const filterSettingsApi = {
  getFilterSettings: async () => {
    return await api.get('/api/filter-settings');
  },

  getHomepageFilters: async () => {
    return await api.get('/api/filter-settings/homepage');
  },

  createFilterSetting: async (filterSetting) => {
    return await api.post('/api/filter-settings', filterSetting);
  },

  updateFilterSetting: async (id, filterSetting) => {
    return await api.put(`/api/filter-settings/${id}`, filterSetting);
  },

  deleteFilterSetting: async (id) => {
    await api.delete(`/api/filter-settings/${id}`);
  },

  reorderHomepageFilters: async (filterIds) => {
    return await api.put('/api/filter-settings/homepage/reorder', filterIds);
  }
};

export default api; 