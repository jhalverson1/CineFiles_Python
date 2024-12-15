/**
 * SearchBar component that handles movie search functionality.
 * Features debounced search to prevent excessive API calls.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onResults - Callback function to handle search results
 */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function SearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const fetchMovies = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      onResults([]);
      return;
    }

    setIsSearching(true);
    const url = `http://0.0.0.0:8080/api/movies/search?query=${encodeURIComponent(searchQuery)}`;
    
    axios.get(url)
      .then(response => {
        onResults(response.data.results);
      })
      .catch(error => console.error('Error fetching search results:', error))
      .finally(() => setIsSearching(false));
  }, [onResults]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchMovies(debouncedQuery);
    }
  }, [debouncedQuery, fetchMovies]);

  return (
    <div style={styles.searchContainer}>
      <div style={styles.searchWrapper}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          style={styles.searchInput}
        />
        {isSearching && <div style={styles.loadingIndicator}>Searching...</div>}
      </div>
    </div>
  );
}

const styles = {
  searchContainer: {
    padding: '40px 0',
    marginBottom: '20px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 20px',
  },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    fontSize: '1.1em',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '30px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    '&:focus': {
      borderColor: '#e50914',
      boxShadow: '0 0 0 2px rgba(229, 9, 20, 0.2), 0 4px 12px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
  },
  loadingIndicator: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9em',
    animation: 'pulse 1.5s infinite',
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.6 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.6 },
  },
};

export default SearchBar;