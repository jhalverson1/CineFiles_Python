import React, { useState } from 'react';
import MovieList from './MovieList';
import heroPattern from '../../assets/hero-pattern.svg';

const HomePage = () => {
  const [hideWatched, setHideWatched] = useState(false);

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section with gradient background */}
      <div className="relative w-full px-4 py-24 bg-gradient-to-b from-purple-900/90 via-purple-800/50 to-[#1a0f1c]">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${heroPattern})`, opacity: 0.1 }} />
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-200 to-pink-200 text-transparent bg-clip-text">
              Discover Your Next Favorite Movie
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore curated collections of the best films from around the world, 
              carefully selected for cinephiles like you.
            </p>

            {/* Enhanced Filter UI */}
            <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/15 transition-colors">
              <button
                onClick={() => setHideWatched(!hideWatched)}
                className="flex items-center gap-2 focus:outline-none"
                role="checkbox"
                aria-checked={hideWatched}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${hideWatched ? 'bg-purple-500 border-purple-400' : 'border-gray-400'}`}>
                  {hideWatched && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-200 font-medium">
                  Hide Watched Movies
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Lists */}
      <div className="space-y-12 px-6 py-16">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Movies</h2>
          <MovieList type="popular" hideWatched={hideWatched} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Top Rated Movies</h2>
          <MovieList type="top-rated" hideWatched={hideWatched} />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Movies</h2>
          <MovieList type="upcoming" hideWatched={hideWatched} />
        </section>
      </div>
    </div>
  );
};

export default HomePage; 