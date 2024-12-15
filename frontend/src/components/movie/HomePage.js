import React, { useState } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import '../../styles/HomePage.css';

function HomePage() {
  const [movies, setMovies] = useState([]);

  return (
    <div className="home-container">
      <h1 className="title">CineFiles</h1>
      <SearchBar onResults={setMovies} />
      <MovieList movies={movies} />
    </div>
  );
}

export default HomePage; 