import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function SearchBar({ onResults }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Memoize fetchMovies to avoid unnecessary re-renders
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

  // Fetch search results when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      console.log('Debounced query:', debouncedQuery);
      fetchMovies(debouncedQuery);
    }
  }, [debouncedQuery, fetchMovies]);

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