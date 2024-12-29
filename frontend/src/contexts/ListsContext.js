import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { listsApi } from '../utils/listsApi';

const ListsContext = createContext();

export const ListsProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchLists = useCallback(async () => {
    console.log('ListsContext: Starting fetchLists');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('ListsContext: Fetching lists with auth state:', {
        hasToken: !!token,
        tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
      });
      const data = await listsApi.getLists();
      console.log('ListsContext: Lists fetched successfully:', {
        listCount: data.length
      });
      setLists(data);
    } catch (err) {
      console.error('ListsContext: Error fetching lists:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [refreshTrigger]);

  const refreshLists = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log('ListsContext: useEffect triggered, calling fetchLists');
    fetchLists();
  }, [refreshTrigger, fetchLists]);

  const addToList = useCallback(async (listId, data) => {
    try {
      await listsApi.addToList(listId, data);
      await fetchLists(); // Refresh lists
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createList = useCallback(async (name, description = '') => {
    try {
      await listsApi.createList({ name, description });
      await fetchLists(); // Refresh lists
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <ListsContext.Provider value={{
      lists,
      loading,
      error,
      refreshLists,
      addToList,
      createList
    }}>
      {children}
    </ListsContext.Provider>
  );
};

export const useLists = () => {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
}; 