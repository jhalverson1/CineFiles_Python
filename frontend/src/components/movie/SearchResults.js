import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../common/LazyImage';

function SearchResults({ movies = [], isLoading = false }) {
  const getPosterUrl = (posterPath) => {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  if (!isLoading && !movies.length) {
    return (
      <div className="text-center py-10 text-white/70 text-lg">
        <p>No movies found...</p>
      </div>
    );
  }

  const displayArray = isLoading 
    ? Array(8).fill().map((_, index) => ({ id: `placeholder-${index}` })) 
    : movies;

  return (
    <div className="w-[95%] max-w-[1200px] mx-auto py-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-7">
        {displayArray.map((movie, index) => (
          <div 
            key={movie.id}
            className="bg-[rgba(32,32,32,0.8)] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {movie.id.toString().startsWith('placeholder') ? (
              <>
                <div className="relative aspect-[2/3] bg-white/5">
                  <div className="absolute inset-0 bg-[#2a2a2a] flex items-center justify-center animate-pulse">
                    <svg
                      className="w-10 h-10 stroke-white/20"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                </div>
                <div className="p-2 sm:p-2.5 bg-black/20">
                  <div className="h-4 w-4/5 rounded bg-white/10"></div>
                  <div className="h-3 w-2/5 rounded bg-white/10 mt-2"></div>
                </div>
              </>
            ) : (
              <Link 
                to={`/movies/${movie.id}`} 
                className="block text-inherit no-underline"
              >
                <div className="relative aspect-[2/3] bg-white/5">
                  <LazyImage
                    src={getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover block"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-black/75 text-yellow-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm backdrop-blur">
                      ★ {movie.vote_average?.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="p-2 sm:p-2.5 bg-black/20">
                  <h3 className="m-0 mb-0.5 sm:mb-1 text-sm sm:text-base font-medium text-white truncate">
                    {movie.title}
                  </h3>
                  <p className="m-0 text-xs sm:text-sm text-gray-400">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchResults; 