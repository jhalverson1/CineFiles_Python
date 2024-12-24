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
    e.preventDefault();
    if (query.trim()) {
      try {
        onSearchStart?.();
        const results = await movieApi.searchMovies(query);
        console.log('API search results:', results);
        onResults(results);
      } catch (error) {
        console.error('Error searching movies:', error);
        onResults({ results: [] });
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    onResults({ results: [] });
  };

  return (
    <div className="p-4 bg-dark">
      <form 
        onSubmit={handleSearch} 
        className="max-w-lg mx-auto"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full p-4 rounded-full bg-white/10 text-white placeholder-white/50 border-2 border-white/10"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-2xl hover:text-white"
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

export default SearchBar;