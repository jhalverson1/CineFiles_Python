import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';

const SearchResults = () => {
  const location = useLocation();
  const { results, query } = location.state || { results: [], query: '' };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Search Results for "{query}"
          </h2>
          <p className="text-gray-400">
            Found {results.length} {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((movie) => (
              <Link
                key={movie.id}
                to={`/movies/${movie.id}`}
                className="bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
              >
                <div className="aspect-[2/3] relative">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black/75 text-yellow-400 px-2 py-1 rounded text-sm">
                    ★ {movie.vote_average?.toFixed(1)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 