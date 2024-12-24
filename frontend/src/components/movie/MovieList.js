/**
 * MovieList component that displays a horizontally scrollable list of movies.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MovieList({ movies = [], title }) {
  const scrollContainerRef = useRef(null);
  const [showRightButton, setShowRightButton] = useState(false);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
        setShowLeftButton(scrollLeft > 10);
      }
    };

    window.addEventListener('resize', handleResize);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = isDesktop ? 600 : 300; // Scroll 3 cards on desktop, 2 on mobile
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Ensure movies is always an array
  const movieArray = Array.isArray(movies) ? movies : [];

  if (!movieArray.length) {
    return (
      <div style={styles.noResults}>
        <p>No movies found...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {isDesktop && (
        <div 
          style={styles.scrollTriggerLeft}
          onMouseEnter={() => setIsHoveringLeft(true)}
          onMouseLeave={() => setIsHoveringLeft(false)}
          onClick={() => showLeftButton && handleScroll('left')}
        >
          {showLeftButton && (
            <div style={{
              ...styles.scrollButton,
              opacity: isHoveringLeft ? 1 : 0,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
          )}
        </div>
      )}
      <div ref={scrollContainerRef} style={styles.scrollContainer}>
        <div style={styles.movieRow}>
          {movieArray.map(movie => (
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
                    loading="lazy"
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
      </div>
      {isDesktop && (
        <div 
          style={styles.scrollTriggerRight}
          onMouseEnter={() => setIsHoveringRight(true)}
          onMouseLeave={() => setIsHoveringRight(false)}
          onClick={() => showRightButton && handleScroll('right')}
        >
          {showRightButton && (
            <div style={{
              ...styles.scrollButton,
              opacity: isHoveringRight ? 1 : 0,
              transition: 'opacity 0.2s ease',
              cursor: 'pointer',
            }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'stretch',
  },
  scrollContainer: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    padding: '5px 0',
    '@media (min-width: 640px)': {
      padding: '10px 0',
    },
  },
  scrollTriggerLeft: {
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to right, rgba(138, 43, 226, 0.1), transparent)',
  },
  scrollTriggerRight: {
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to left, rgba(138, 43, 226, 0.1), transparent)',
  },
  scrollButton: {
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '40px',
    background: 'rgba(138, 43, 226, 0.2)',
    borderRadius: '4px',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
  },
  movieRow: {
    display: 'flex',
    gap: '10px',
    padding: '5px 0',
    '@media (min-width: 640px)': {
      gap: '15px',
      padding: '10px 0',
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
    flexShrink: 0,
    width: '140px',
    '@media (min-width: 640px)': {
      width: '200px',
    },
    '&:hover': {
      transform: 'translateY(-3px)',
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
    textAlign: 'center',
    padding: '10px',
    fontSize: '0.8em',
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

export default MovieList;