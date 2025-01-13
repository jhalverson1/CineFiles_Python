import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';
import { variants, classes } from '../../utils/theme';

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
    className={classes.icon}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const Navbar = () => {
  const { isLoggedIn, username, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        console.log('[Navbar] Click outside detected, closing dropdown');
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    console.log('[Navbar] Logout clicked - Current auth state:', { isLoggedIn, username });
    try {
      console.log('[Navbar] Calling logout function...');
      await logout();
      console.log('[Navbar] Logout successful, closing dropdown');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('[Navbar] Logout failed:', error);
    }
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    console.log('[Navbar] Toggle dropdown clicked, current state:', !isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  console.log('[Navbar] Render - Auth state:', { isLoggedIn, username, isDropdownOpen });

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between h-full px-4 mx-auto max-w-[2000px]">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={handleDropdownToggle}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Toggle user menu"
                  aria-expanded={isDropdownOpen}
                >
                  <span>{username}</span>
                  <ChevronDownIcon />
                </button>

                {/* Desktop Dropdown Menu */}
                {isDropdownOpen && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                  >
                    <div className="py-1">
                      <Link
                        to="/my-lists"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => {
                          console.log('[Navbar] My Lists clicked');
                          setIsDropdownOpen(false);
                        }}
                      >
                        My Lists
                      </Link>
                      <Link
                        to="/my-filters"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => {
                          console.log('[Navbar] My Filters clicked');
                          setIsDropdownOpen(false);
                        }}
                      >
                        My Filters
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('[Navbar] Logout button clicked');
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center">
            {isLoggedIn ? (
              <div ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Toggle user menu"
                  aria-expanded={isDropdownOpen}
                >
                  <span>{username}</span>
                  <ChevronDownIcon />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile User Dropdown */}
        {isDropdownOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="py-1">
              <Link
                to="/my-lists"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsDropdownOpen(false)}
              >
                My Lists
              </Link>
              <Link
                to="/my-filters"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setIsDropdownOpen(false)}
              >
                My Filters
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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