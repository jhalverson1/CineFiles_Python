import React, { useState } from 'react';
import MovieList from './MovieList';
import Filters from '../common/Filters';

const HomePage = () => {
  const [hideWatched, setHideWatched] = useState(false);

  return (
    <div className="min-h-screen text-white bg-[#1E1118]">
      {/* Hero Section */}
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
        

          <Filters hideWatched={hideWatched} setHideWatched={setHideWatched} />
        </div>
      </div>

      {/* Movie Lists */}
      <div className="space-y-12 px-6">
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