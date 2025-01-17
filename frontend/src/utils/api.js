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
let refreshPromise = null;

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
  // If already refreshing, return the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }
  
  try {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    // Create new refresh promise
    refreshPromise = (async () => {
      const params = new URLSearchParams();
      params.append('refresh_token', refresh_token);
      
      const response = await axios.post(`${baseURL}/api/auth/refresh`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const { access_token, refresh_token: new_refresh_token } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', new_refresh_token);
      
      return access_token;
    })();

    const access_token = await refreshPromise;
    return access_token;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    throw error;
  } finally {
    refreshPromise = null;
  }
};

// Function to check if a token is expired
const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return (payload.exp * 1000) <= Date.now();
  } catch (error) {
    console.error('[Token Check] Error checking token expiration:', error);
    return true;  // Assume expired if we can't decode
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
      const refreshToken = localStorage.getItem('refresh_token');
      
      // If we have no tokens at all, redirect to login
      if (!token && !refreshToken) {
        window.location.href = '/login';
        return Promise.reject('No authentication tokens found');
      }
      
      // Check if access token is expired and we have a refresh token
      if (token && refreshToken && isTokenExpired(token)) {
        try {
          const newAccessToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        } catch (error) {
          // Only redirect if refresh token is expired or invalid
          if (error.response?.status === 401) {
            window.location.href = '/login';
          }
          return Promise.reject('Token refresh failed');
        }
      } else if (token) {
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

    // Don't try to refresh if we're on the login page or making a login/signup request
    const isAuthEndpoint = originalRequest.url.includes('/api/auth/login') || 
                          originalRequest.url.includes('/api/auth/signup');
    const isLoginPage = window.location.pathname === '/login';
    if (isAuthEndpoint || isLoginPage) {
      return Promise.reject(error);
    }
    
    // Check if we have a refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      window.location.href = '/login';
      return Promise.reject('No refresh token available');
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
        window.location.href = '/login';
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
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      if (!isLoginPage) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Function to decode JWT and check expiration
const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return {
        expiresAt: new Date(payload.exp * 1000),
        issuedAt: new Date(payload.iat * 1000),
        type: payload.token_type,
        email: payload.sub,
        timeUntilExpiry: (payload.exp * 1000) - Date.now()
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  console.log('\n=== Token Status ===');
  if (token) {
    const decodedAccess = decodeJWT(token);
    console.log('Access Token:', {
      expiresAt: decodedAccess?.expiresAt,
      issuedAt: decodedAccess?.issuedAt,
      type: decodedAccess?.type,
      email: decodedAccess?.email,
      timeUntilExpiry: decodedAccess?.timeUntilExpiry + 'ms',
      hasExpired: decodedAccess?.timeUntilExpiry < 0
    });
  } else {
    console.log('No access token found');
  }
  
  if (refreshToken) {
    const decodedRefresh = decodeJWT(refreshToken);
    console.log('Refresh Token:', {
      expiresAt: decodedRefresh?.expiresAt,
      issuedAt: decodedRefresh?.issuedAt,
      type: decodedRefresh?.type,
      email: decodedRefresh?.email,
      timeUntilExpiry: decodedRefresh?.timeUntilExpiry + 'ms',
      hasExpired: decodedRefresh?.timeUntilExpiry < 0
    });
  } else {
    console.log('No refresh token found');
  }
  console.log('===================\n');
};

// Make token checker available globally
if (typeof window !== 'undefined') {
  window.checkTokens = checkTokenExpiration;
}

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
    
    // Check token expiration times after login
    checkTokenExpiration();
    
    return response;
  },
  signup: (userData) => api.post('/api/auth/signup', userData),
  getCurrentUser: () => api.get('/api/auth/me'),
  logout: () => {
    console.log('[API] Logout called - Clearing tokens');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    console.log('[API] Current tokens:', { hasToken: !!token, hasRefreshToken: !!refreshToken });
    
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    
    // Reset axios default authorization header
    api.defaults.headers.common['Authorization'] = '';
    
    console.log('[API] Tokens cleared');
    return Promise.resolve();
  },
  testAuth: async () => {
    console.log('[Auth Test] Starting auth test');
    console.log('[Auth Test] Current tokens:', {
      access_token: localStorage.getItem('token')?.substring(0, 10) + '...',
      refresh_token: localStorage.getItem('refresh_token')?.substring(0, 10) + '...',
      username: localStorage.getItem('username')
    });
    
    try {
      // First test regular auth
      const response = await api.get('/api/auth/test-auth');
      console.log('[Auth Test] Regular auth successful:', response);
      
      // Then test with forced expiry
      console.log('[Auth Test] Testing token expiry...');
      const expiryResponse = await api.get('/api/auth/test-auth-expiry');
      console.log('[Auth Test] Expiry test successful:', expiryResponse);
      
      return { regular: response, expiry: expiryResponse };
    } catch (error) {
      console.error('[Auth Test] Request failed:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },
  checkTokens: checkTokenExpiration,  // Expose the check function
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

  // Only add year range if both values are valid numbers
  if (yearRange?.length === 2) {
    const startYear = yearRange[0] ? parseInt(yearRange[0]) : null;
    const endYear = yearRange[1] ? parseInt(yearRange[1]) : null;
    
    if (startYear !== null && !isNaN(startYear)) {
      params.append('start_year', startYear.toString());
    }
    if (endYear !== null && !isNaN(endYear)) {
      params.append('end_year', endYear.toString());
    }
  }
  
  // Only add rating range if both values are valid numbers
  if (ratingRange?.length === 2 && ratingRange[0] !== null && ratingRange[1] !== null) {
    const minRating = parseFloat(ratingRange[0]);
    const maxRating = parseFloat(ratingRange[1]);
    if (!isNaN(minRating) && !isNaN(maxRating)) {
      params.append('min_rating', minRating.toString());
      params.append('max_rating', maxRating.toString());
    }
  }
  
  // Only add popularity range if both values are valid numbers
  if (popularityRange?.length === 2 && popularityRange[0] !== null && popularityRange[1] !== null) {
    const minPopularity = parseFloat(popularityRange[0]);
    const maxPopularity = parseFloat(popularityRange[1]);
    if (!isNaN(minPopularity) && !isNaN(maxPopularity)) {
      params.append('min_popularity', minPopularity.toString());
      params.append('max_popularity', maxPopularity.toString());
    }
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

  // Add vote count range if both values are valid numbers
  if (voteCountRange?.length === 2 && voteCountRange[0] !== null && voteCountRange[1] !== null) {
    const minVoteCount = parseInt(voteCountRange[0]);
    const maxVoteCount = parseInt(voteCountRange[1]);
    if (!isNaN(minVoteCount) && !isNaN(maxVoteCount)) {
      params.append('min_vote_count', minVoteCount.toString());
      params.append('max_vote_count', maxVoteCount.toString());
    }
  }

  // Add runtime range if both values are valid numbers
  if (runtimeRange?.length === 2 && runtimeRange[0] !== null && runtimeRange[1] !== null) {
    const minRuntime = parseInt(runtimeRange[0]);
    const maxRuntime = parseInt(runtimeRange[1]);
    if (!isNaN(minRuntime) && !isNaN(maxRuntime)) {
      params.append('min_runtime', minRuntime.toString());
      params.append('max_runtime', maxRuntime.toString());
    }
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
  
  searchMovies: async (query, page = 1) => {
    const params = new URLSearchParams({
      query: query.trim(),
      page: page.toString(),
      include_adult: 'false',
      language: 'en-US'
    });
    return api.get(`/api/movies/search?${params.toString()}`);
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
  getSimilarMovies: (id) => api.get(`/api/movies/${id}/similar`),
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
  return await api.post(`/api/lists/${listId}/items`, { 
    movie_id: movieId.toString(), 
    notes 
  });
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