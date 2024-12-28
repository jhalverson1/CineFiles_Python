import React, { useState } from 'react';
import MovieList from './MovieList';
import { FiSearch } from 'react-icons/fi';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full px-5 py-3 rounded-md bg-white/5 border border-white/10 focus:border-white/20 focus:outline-none text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
                aria-label="Search movies"
              >
                <FiSearch className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Movie Lists */}
      <div className="space-y-12 px-6 py-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Movies</h2>
          <MovieList type="popular" />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Top Rated Movies</h2>
          <MovieList type="top-rated" />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Movies</h2>
          <MovieList type="upcoming" />
        </section>
      </div>
    </div>
  );
};

export default HomePage; 