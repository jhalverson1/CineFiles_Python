import React, { useState } from 'react';
import MovieList from './MovieList';

const HomePage = () => {
  const [hideWatched, setHideWatched] = useState(false);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#1a0f1c' }}>
      {/* Hero Section */}
      <div className="w-full px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Discover Your Next Favorite Movie
          </h1>
          
          <p className="text-gray-400 text-lg mb-10">
            Explore curated collections of the best films from around the world
          </p>

          {/* Hide Watched Filter */}
          <div className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              id="hideWatched"
              checked={hideWatched}
              onChange={(e) => setHideWatched(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="hideWatched" className="text-gray-300 text-lg cursor-pointer select-none">
              Hide Watched Movies
            </label>
          </div>
        </div>
      </div>

      {/* Movie Lists */}
      <div className="space-y-12 px-6 py-8">
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