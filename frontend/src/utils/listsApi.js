import api from './api';

export const listsApi = {
  getLists: () => api.get('/api/lists'),
  createList: (data) => api.post('/api/lists', data),
  addToList: (listId, data) => api.post(`/api/lists/${listId}/items`, data),
  toggleWatched: (movieId) => api.post(`/api/lists/watched/${movieId}`),
  toggleWatchlist: (movieId) => api.post(`/api/lists/watchlist/${movieId}`),
}; 