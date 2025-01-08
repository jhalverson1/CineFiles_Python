import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { listsApi } from '../utils/listsApi';
import { useAuth } from './AuthContext';

const ListsContext = createContext();

export const useLists = () => {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
};

export const ListsProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshLists = useCallback(async () => {
    if (!isLoggedIn) {
      setLists([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await listsApi.getLists();
      setLists(response);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setLists([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshLists();
  }, [refreshLists, isLoggedIn]);

  const updateListStatus = useCallback((movieId, { is_watched, in_watchlist }) => {
    setLists(currentLists => {
      const newLists = currentLists.map(list => {
        if (list.name === 'Watched') {
          const items = is_watched
            ? [...list.items, { movie_id: movieId.toString() }]
            : list.items.filter(item => item.movie_id !== movieId.toString());
          return { ...list, items };
        }
        if (list.name === 'Watchlist') {
          const items = in_watchlist
            ? [...list.items, { movie_id: movieId.toString() }]
            : list.items.filter(item => item.movie_id !== movieId.toString());
          return { ...list, items };
        }
        return list;
      });
      return newLists;
    });
  }, []);

  const addToList = useCallback(async (listId, data) => {
    try {
      await listsApi.addToList(listId, data);
      await refreshLists();
    } catch (error) {
      console.error('Error adding to list:', error);
      throw error;
    }
  }, [refreshLists]);

  const value = {
    lists,
    loading,
    refreshLists,
    updateListStatus,
    addToList
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
};

export default ListsContext; 