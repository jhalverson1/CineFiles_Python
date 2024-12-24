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

  return (
    <div style={styles.searchContainer}>
      <form onSubmit={handleSearch} style={styles.searchWrapper}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for movies..."
          style={styles.searchInput}
        />
      </form>
    </div>
  );
}

const styles = {
  searchContainer: {
    padding: '10px 0',
    marginBottom: '15px',
    '@media (min-width: 640px)': {
      padding: '20px 0',
      marginBottom: '20px',
    },
  },
  searchWrapper: {
    position: 'relative',
    width: '90%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '0 10px',
    '@media (min-width: 640px)': {
      width: '80%',
      padding: '0 20px',
    },
  },
  searchInput: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '1em',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '30px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    '@media (min-width: 640px)': {
      padding: '15px 20px',
      fontSize: '1.1em',
    },
  },
};

export default SearchBar;