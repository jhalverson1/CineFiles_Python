import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Breadcrumb({ movie }) {
  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.location.reload();
    }
  };

  return (
    <nav className="p-5 text-white text-lg" aria-label="breadcrumb">
      <Link 
        to="/" 
        className="text-primary hover:underline"
        onClick={handleHomeClick}
      >
        Home
      </Link>
      {location.pathname.includes('/movies/') && (
        <>
          <span className="mx-2.5 text-gray-500">/</span>
          <span className="text-gray-300">{movie?.title || 'Loading...'}</span>
        </>
      )}
    </nav>
  );
}

export default Breadcrumb; 