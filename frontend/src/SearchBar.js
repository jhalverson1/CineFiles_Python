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
    padding: '20px 0',
    marginBottom: '20px',
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchInput: {
    width: '100%',
    padding: '15px 20px',
    fontSize: '1.1em',
    border: '2px solid #e5e5e5',
    borderRadius: '30px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    '&:focus': {
      borderColor: '#e50914',
      boxShadow: '0 0 0 2px rgba(229, 9, 20, 0.2)',
    },
  },
  loadingIndicator: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '0.9em',
  },
};

export default SearchBar;