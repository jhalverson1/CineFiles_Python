import React from 'react';
import MovieList from './MovieList';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-6 py-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover Your Next Favorite Movie
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Explore popular, top-rated, and upcoming movies
          </p>
        </div>

        {/* Movie Lists */}
        <div className="space-y-12">
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
    </div>
  );
};

export default HomePage; 