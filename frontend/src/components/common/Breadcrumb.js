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
    <nav style={styles.breadcrumb} aria-label="breadcrumb">
      <Link to="/" style={styles.link} onClick={handleHomeClick}>Home</Link>
      {location.pathname.includes('/movies/') && (
        <>
          <span style={styles.separator}>/</span>
          <span style={styles.current}>{movie?.title || 'Loading...'}</span>
        </>
      )}
    </nav>
  );
}

const styles = {
  breadcrumb: {
    padding: '20px',
    color: '#fff',
    fontSize: '1.1em',
  },
  link: {
    color: '#8A2BE2',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  separator: {
    margin: '0 10px',
    color: '#666',
  },
  current: {
    color: '#ccc',
  },
};

export default Breadcrumb; 