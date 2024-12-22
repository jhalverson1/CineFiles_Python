/**
 * MovieList component that displays a list of movies from search results.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MovieList({ movies = [], title }) {
  const [showAll, setShowAll] = useState(false);
  const itemsPerRow = 6;

  console.log('MovieList received:', {
    movies,
    type: typeof movies,
    isArray: Array.isArray(movies)
  });

  // Ensure movies is always an array
  const movieArray = Array.isArray(movies) ? movies : [];

  if (!movieArray.length) {
    return (
      <div style={styles.noResults}>
        <p>No movies found...</p>
      </div>
    );
  }

  const displayedMovies = showAll ? movieArray : movieArray.slice(0, itemsPerRow);

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {displayedMovies.map(movie => (
          <Link 
            key={movie.id} 
            to={`/movies/${movie.id}`} 
            style={styles.movieCard}
          >
            <div style={styles.posterContainer}>
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  style={styles.poster}
                />
              ) : (
                <div style={styles.noPoster}>No Poster Available</div>
              )}
              <div style={styles.overlay}>
                <div style={styles.rating}>
                  ★ {movie.vote_average.toFixed(1)}
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
        ))}
      </div>
      {movieArray.length > itemsPerRow && (
        <button 
          onClick={() => setShowAll(!showAll)}
          style={styles.seeMoreButton}
        >
          {showAll ? 'Show Less' : 'See More'}
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '15px',
    padding: '10px',
    margin: '0 auto',
  },
  seeMoreButton: {
    display: 'block',
    margin: '20px auto 0',
    padding: '8px 20px',
    backgroundColor: 'transparent',
    border: '2px solid #e50914',
    color: '#e50914',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e50914',
      color: '#fff',
    },
  },
  movieCard: {
    textDecoration: 'none',
    color: '#fff',
    background: 'rgba(32, 32, 32, 0.8)',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px) scale(1.02)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: '2/3',
  },
  poster: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noPoster: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    color: '#666',
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
    top: '10px',
    right: '10px',
    background: 'rgba(0, 0, 0, 0.75)',
    color: '#ffd700',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '0.9em',
    backdropFilter: 'blur(4px)',
  },
  movieInfo: {
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  title: {
    margin: '0 0 3px 0',
    fontSize: '0.9em',
    fontWeight: '500',
    color: '#fff',
  },
  year: {
    margin: 0,
    color: '#999',
    fontSize: '0.8em',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.1em',
  },
};

export default MovieList;