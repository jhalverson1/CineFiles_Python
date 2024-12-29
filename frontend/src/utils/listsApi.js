import api from './api';

export const listsApi = {
  getLists: () => api.get('/api/lists'),
  createList: (data) => api.post('/api/lists', data),
  addToList: (listId, data) => api.post(`/api/lists/${listId}/items`, data),
  toggleWatched: async (movieId) => {
    return await api.post(`/api/lists/watched/${movieId}`);
  },
  toggleWatchlist: async (movieId) => {
    return await api.post(`/api/lists/watchlist/${movieId}`);
  },
}; 