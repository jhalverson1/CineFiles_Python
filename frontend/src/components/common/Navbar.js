import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { movieApi } from '../../utils/api';
import Logo from './Logo';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await movieApi.searchMovies(searchQuery);
      navigate('/search', { 
        state: { 
          results: response.results,
          query: searchQuery 
        } 
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4">
          <Logo />
          
          <div className="flex items-center space-x-6">
            <form onSubmit={handleSearch} className="relative flex items-center w-56">
              <input
                type="search"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-8 px-3 py-1 text-sm rounded-md 
                         bg-[#27272A] text-white
                         focus:outline-none"
                aria-label="Search"
              />
              <button 
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className={`h-7 px-4 text-sm font-medium text-white
                         rounded-md transition-colors
                         absolute right-[2px] top-[2px]
                         ${searchQuery.trim() && !isSearching
                           ? 'bg-[#6D28D9] hover:bg-[#5B21B6] cursor-pointer' 
                           : 'bg-[#6D28D9]/50 cursor-not-allowed'}`}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
            
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="h-14" />
    </>
  );
};

export default Navbar; 