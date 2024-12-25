import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800">
      <div className="w-full px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          CineFiles
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          
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
  );
};

export default Navbar; 