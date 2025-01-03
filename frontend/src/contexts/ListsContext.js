import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { listsApi } from '../utils/listsApi';
import { useNavigate } from 'react-router-dom';

const ListsContext = createContext();

export const ListsProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasAttemptedInitialFetch, setHasAttemptedInitialFetch] = useState(false);
  const navigate = useNavigate();

  const fetchLists = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (loading) return;
    
    console.log('ListsContext: Starting fetchLists');
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('ListsContext: No token found, skipping fetch');
        setLists([]);
        return;
      }

      console.log('ListsContext: Fetching lists with auth state:', {
        hasToken: !!token,
        tokenFirstChars: token ? token.substring(0, 10) + '...' : 'none'
      });
      
      const data = await listsApi.getLists();
      console.log('ListsContext: Lists fetched successfully:', {
        listCount: data.length
      });
      setLists(data);
      setError(null);
    } catch (err) {
      console.error('ListsContext: Error fetching lists:', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        // If unauthorized and we haven't redirected yet, redirect to login
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
        setLists([]);
      }
      
      setError(err.message);
    } finally {
      setLoading(false);
      setHasAttemptedInitialFetch(true);
    }
  }, [navigate, refreshTrigger]);

  const refreshLists = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Only fetch if we haven't attempted yet or if refresh is triggered
    if (!hasAttemptedInitialFetch || refreshTrigger > 0) {
      fetchLists();
    }
  }, [refreshTrigger, fetchLists, hasAttemptedInitialFetch]);

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
      createList,
      hasAttemptedInitialFetch
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