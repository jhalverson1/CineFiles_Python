import React, { useState } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';

function App() {
  const [movies, setMovies] = useState([]);

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Movie Search</h1>
      <SearchBar onResults={setMovies} />
      <MovieList movies={movies} />
    </div>
  );
}

export default App;
