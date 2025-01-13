import api from './api';

export const listsApi = {
  getLists: () => api.get('/api/lists'),
  createList: (listData) => api.post('/api/lists', listData),
  updateList: async (listId, listData) => {
    console.log('Updating list:', { listId, listData }); // Debug log
    try {
      const response = await api.put(`/api/lists/${listId}`, listData);
      return response.data;
    } catch (error) {
      console.error('Update list error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },
  deleteList: (listId) => api.delete(`/api/lists/${listId}`),
  addToList: (listId, data) => api.post(`/api/lists/${listId}/items`, data),
  toggleWatched: async (movieId) => {
    return await api.post(`/api/lists/watched/${movieId}`);
  },
  toggleWatchlist: async (movieId) => {
    return await api.post(`/api/lists/watchlist/${movieId}`);
  },
}; 