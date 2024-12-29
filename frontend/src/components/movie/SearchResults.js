import React from 'react';
import { useLocation } from 'react-router-dom';
import MovieCard from './MovieCard';

const SearchResults = () => {
  const location = useLocation();
  const { results, query } = location.state || { results: [], query: '' };

  return (
    <div className="min-h-screen text-primary">
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2 pl-2 border-l-[6px] border-primary">
            Search Results for "{query}"
          </h2>
          <p className="text-text-secondary">
            Found {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 place-items-center">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 