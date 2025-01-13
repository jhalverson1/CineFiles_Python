import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for both tokens
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    const storedUsername = localStorage.getItem('username');
    
    console.log('[AuthContext] Checking tokens:', { hasToken: !!token, hasRefreshToken: !!refreshToken });
    
    if (token && refreshToken) {
      setIsLoggedIn(true);
      setUsername(storedUsername || '');
    } else {
      // Clear all auth data if either token is missing
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('username');
      setIsLoggedIn(false);
      setUsername('');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      setIsLoggedIn(true);
      setUsername(response.username);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logout called - Current state:', { isLoggedIn, username });
    try {
      console.log('[AuthContext] Calling authApi.logout()');
      await authApi.logout();
      console.log('[AuthContext] API logout successful, updating state');
      setIsLoggedIn(false);
      setUsername('');
      console.log('[AuthContext] State updated, redirecting to login');
      window.location.href = '/login';
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      toast.error('Logout failed');
    }
  };

  console.log('[AuthContext] Render - Auth state:', { isLoggedIn, username, isLoading });

  const value = {
    isLoggedIn,
    username,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 