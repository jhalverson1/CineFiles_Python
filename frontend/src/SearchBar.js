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
  // State for the current search query
  const [query, setQuery] = useState('');
  // State for the debounced query to reduce API calls
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce effect: wait 300ms after user stops typing before updating debouncedQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Memoized function to fetch movies from the API
  const fetchMovies = useCallback((searchQuery) => {
    const url = `http://0.0.0.0:8080/api/movies/search?query=${encodeURIComponent(searchQuery)}`;
    console.log('Fetching movies from URL:', url);

    axios.get(url)
      .then(response => {
        console.log('Movies fetched:', response.data.results);
        onResults(response.data.results);
      })
      .catch(error => console.error('Error fetching search results:', error));
  }, [onResults]);

  // Effect to fetch movies when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      console.log('Debounced query:', debouncedQuery);
      fetchMovies(debouncedQuery);
    }
  }, [debouncedQuery, fetchMovies]);

  // Handler for search button click
  const handleSearchClick = () => {
    console.log('Search button clicked');
    fetchMovies(query);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for movies..."
        style={{ flex: 1, padding: '10px', fontSize: '16px' }}
      />
      <button onClick={handleSearchClick} style={{ padding: '10px', marginLeft: '10px' }}>
        Search
      </button>
    </div>
  );
}

export default SearchBar;