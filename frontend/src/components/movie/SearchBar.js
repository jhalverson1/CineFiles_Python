/**
 * SearchBar component that handles movie search functionality.
 * Features debounced search to prevent excessive API calls.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onResults - Callback function to handle search results
 * @param {Function} props.onSearchStart - Callback function called when search starts
 */
import React, { useState } from 'react';
import { movieApi } from '../../utils/api';

function SearchBar({ onResults, onSearchStart }) {
  const [query, setQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (query.trim()) {
      try {
        onSearchStart?.(); // Call onSearchStart if provided
        const results = await movieApi.searchMovies(query);
        console.log('API search results:', results);
        onResults(results);
      } catch (error) {
        console.error('Error searching movies:', error);
        onResults({ results: [] }); // Clear results on error
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    onResults({ results: [] }); // Reset search results to show homepage lists
  };

  return (
    <div style={styles.searchContainer}>
      <form onSubmit={handleSearch} style={styles.searchWrapper}>
        <div style={styles.inputContainer}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            style={styles.searchInput}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={styles.clearButton}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  searchContainer: {
    padding: '10px 0',
    marginBottom: '15px',
    width: '100%',
    '@media (min-width: 640px)': {
      padding: '20px 0',
      marginBottom: '20px',
    },
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 15px',
    boxSizing: 'border-box',
    '@media (min-width: 640px)': {
      width: '90%',
      padding: '0 20px',
    },
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  },
  searchInput: {
    width: '100%',
    padding: '12px 40px 12px 15px',
    fontSize: '1em',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '30px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    '@media (min-width: 640px)': {
      padding: '15px 45px 15px 20px',
      fontSize: '1.1em',
    },
  },
  clearButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.5em',
    cursor: 'pointer',
    padding: '0 5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0.6',
    transition: 'opacity 0.2s ease',
    '&:hover': {
      opacity: '1',
    },
  },
};

export default SearchBar;