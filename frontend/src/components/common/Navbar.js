import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';

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
  const { isLoggedIn, username, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 z-50 bg-background-secondary border-b border-border/20 backdrop-blur-sm bg-opacity-95 shadow-lg">
        <div className="flex items-center justify-between h-full px-4">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 text-text-primary hover:text-gold transition-colors px-2 py-1 rounded-md"
                  aria-label="Toggle user menu"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="text-sm font-medium">{username}</span>
                  <ChevronDownIcon className="text-text-primary" />
                </button>

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-black border border-border/20">
                    <Link
                      to="/my-lists"
                      className="block px-4 py-2 text-sm text-text-primary hover:text-gold hover:bg-background-secondary/50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Lists
                    </Link>
                    <Link
                      to="/my-filters"
                      className="block px-4 py-2 text-sm text-text-primary hover:text-gold hover:bg-background-secondary/50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Filters
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:text-gold hover:bg-background-secondary/50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-text-primary hover:text-gold transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 text-text-primary hover:text-gold transition-colors px-2 py-1 rounded-md"
                aria-label="Toggle user menu"
                aria-expanded={isDropdownOpen}
              >
                <span className="text-sm font-medium">{username}</span>
                <ChevronDownIcon className="text-text-primary" />
              </button>
            ) : (
              <Link
                to="/login"
                className="text-text-primary hover:text-gold transition-colors text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile User Dropdown */}
        {isDropdownOpen && (
          <div className="md:hidden px-4 py-2 bg-background-primary border-t border-border/20 backdrop-blur-sm bg-opacity-95">
            <div className="flex flex-col space-y-2">
              <Link
                to="/my-lists"
                className="text-left text-text-primary hover:text-gold hover:bg-background-secondary/50 py-2 text-sm transition-colors rounded-md px-2"
                onClick={() => setIsDropdownOpen(false)}
              >
                My Lists
              </Link>
              <Link
                to="/my-filters"
                className="text-left text-text-primary hover:text-gold hover:bg-background-secondary/50 py-2 text-sm transition-colors rounded-md px-2"
                onClick={() => setIsDropdownOpen(false)}
              >
                My Filters
              </Link>
              <button
                onClick={handleLogout}
                className="text-left text-text-primary hover:text-gold hover:bg-background-secondary/50 py-2 text-sm transition-colors rounded-md px-2"
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
}

export default Navbar; 