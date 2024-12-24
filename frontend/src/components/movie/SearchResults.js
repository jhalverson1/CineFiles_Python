import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../common/LazyImage';

function SearchResults({ movies = [], isLoading = false }) {
  const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  if (!isLoading && !movies.length) {
    return (
      <div style={styles.noResults}>
        <p>No movies found...</p>
      </div>
    );
  }

  // Create placeholder array for loading state with unique keys
  const displayArray = isLoading 
    ? Array(8).fill().map((_, index) => ({ id: `placeholder-${index}` })) 
    : movies;

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {displayArray.map((movie, index) => (
          <div 
            key={movie.id}
            style={styles.movieCard}
          >
            {movie.id.toString().startsWith('placeholder') ? (
              <>
                <div style={styles.posterContainer}>
                  <div style={styles.placeholderPoster}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                </div>
                <div style={styles.movieInfo}>
                  <div style={{
                    ...styles.title,
                    background: 'rgba(255, 255, 255, 0.1)',
                    height: '1em',
                    width: '80%',
                    borderRadius: '4px',
                  }}></div>
                  <div style={{
                    ...styles.year,
                    background: 'rgba(255, 255, 255, 0.1)',
                    height: '0.8em',
                    width: '40%',
                    borderRadius: '4px',
                    marginTop: '8px',
                  }}></div>
                </div>
              </>
            ) : (
              <Link 
                to={`/movies/${movie.id}`} 
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={styles.posterContainer}>
                  <LazyImage
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    style={styles.poster}
                  />
                  <div style={styles.overlay}>
                    <div style={styles.rating}>
                      ★ {movie.vote_average?.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div style={styles.movieInfo}>
                  <h3 style={styles.title}>{movie.title}</h3>
                  <p style={styles.year}>
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '95%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '20px',
    '@media (min-width: 640px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '30px',
    },
  },
  movieCard: {
    background: 'rgba(32, 32, 32, 0.8)',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  placeholderPoster: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 1.5s infinite',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 30%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
      opacity: 1,
    },
  },
  rating: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: 'rgba(0, 0, 0, 0.75)',
    color: '#ffd700',
    padding: '3px 6px',
    borderRadius: '4px',
    fontSize: '0.75em',
    backdropFilter: 'blur(4px)',
    '@media (min-width: 640px)': {
      top: '10px',
      right: '10px',
      padding: '4px 8px',
      fontSize: '0.8em',
    },
  },
  movieInfo: {
    padding: '8px',
    background: 'rgba(0, 0, 0, 0.2)',
    '@media (min-width: 640px)': {
      padding: '10px',
    },
  },
  title: {
    margin: '0 0 2px 0',
    fontSize: '0.8em',
    fontWeight: '500',
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '@media (min-width: 640px)': {
      fontSize: '0.9em',
      margin: '0 0 3px 0',
    },
  },
  year: {
    margin: 0,
    color: '#999',
    fontSize: '0.7em',
    '@media (min-width: 640px)': {
      fontSize: '0.8em',
    },
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.1em',
  },
};

export default SearchResults; 