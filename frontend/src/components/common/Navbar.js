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
    className="h-4 w-4 text-muted-foreground"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronDownIcon = () => (
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
    className="h-4 w-4 text-gray-300"
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    setIsLoggedIn(!!token);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    setUsername('');
    setIsDropdownOpen(false);
    localStorage.removeItem('username');
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
      setIsSearchBarOpen(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isSearchBarOpen) setIsSearchBarOpen(false);
  };

  const toggleSearchBar = () => {
    setIsSearchBarOpen(!isSearchBarOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <form onSubmit={handleSearch} className="relative flex items-center w-56">
              <input
                type="search"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-8 px-3 pr-8 py-1 text-sm rounded-md 
                         bg-[#27272A] text-white
                         focus:outline-none
                         [&::-webkit-search-cancel-button]:hidden"
                aria-label="Search"
              />
              <button 
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2
                         transition-opacity
                         ${searchQuery.trim() && !isSearching
                           ? 'opacity-100 cursor-pointer' 
                           : 'opacity-50 cursor-not-allowed'}`}
                aria-label={isSearching ? 'Searching...' : 'Search'}
              >
                <SearchIcon />
              </button>
            </form>
            
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 text-[#C5B358] hover:text-[#D6C36A] px-2 py-1 rounded-md transition-colors"
                  aria-label="Toggle user menu"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="text-sm font-medium">{username}</span>
                  <ChevronDownIcon className="text-[#C5B358]" />
                </button>

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#1a1a1a] border border-gray-800 focus:outline-none">
                    <Link
                      to="/my-lists"
                      className="block px-4 py-2 text-sm text-[#C5B358] hover:text-[#D6C36A] hover:bg-[#2a2a2a] transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Lists
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-[#C5B358] hover:text-[#D6C36A] hover:bg-[#2a2a2a] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={toggleSearchBar}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Toggle search"
            >
              <SearchIcon />
            </button>
            {isLoggedIn ? (
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 text-[#C5B358] hover:text-[#D6C36A] px-2 py-1 rounded-md transition-colors"
                aria-label="Toggle user menu"
                aria-expanded={isDropdownOpen}
              >
                <span className="text-sm font-medium">{username}</span>
                <ChevronDownIcon className="text-[#C5B358]" />
              </button>
            ) : (
              <Link
                to="/login"
                className="text-gray-300 hover:text-white text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchBarOpen && (
          <div className="md:hidden px-4 py-2 bg-background/95 border-t border-gray-800">
            <form onSubmit={handleSearch} className="relative flex items-center w-full">
              <input
                type="search"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-8 px-3 pr-8 py-1 text-sm rounded-md 
                         bg-[#27272A] text-white
                         focus:outline-none
                         [&::-webkit-search-cancel-button]:hidden"
                aria-label="Search"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2
                         transition-opacity
                         ${searchQuery.trim() && !isSearching
                           ? 'opacity-100 cursor-pointer' 
                           : 'opacity-50 cursor-not-allowed'}`}
                aria-label={isSearching ? 'Searching...' : 'Search'}
              >
                <SearchIcon />
              </button>
            </form>
          </div>
        )}

        {/* Mobile User Dropdown */}
        {isDropdownOpen && (
          <div className="md:hidden px-4 py-2 bg-[#1a1a1a] border-t border-gray-800">
            <div className="flex flex-col space-y-2">
              <Link
                to="/my-lists"
                className="text-left text-[#C5B358] hover:text-[#D6C36A] hover:bg-[#2a2a2a] py-2 text-sm transition-colors rounded-md px-2"
                onClick={() => setIsDropdownOpen(false)}
              >
                My Lists
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-[#C5B358] hover:text-[#D6C36A] hover:bg-[#2a2a2a] py-2 text-sm transition-colors rounded-md px-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
      <div className="h-14" />
    </>
  );
};

export default Navbar; 