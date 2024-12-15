import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import { movieApi } from '../../utils/api';
import '../../styles/HomePage.css';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await movieApi.getPopularMovies();
        setMovies(popularMovies);
      } catch (error) {
        console.error('Error loading popular movies:', error);
      }
    };

    loadPopularMovies();
  }, []);

  const handleSearchResults = (searchResults) => {
    setMovies(searchResults);
    setIsSearching(true);
  };

  return (
    <div className="home-container">
      <h1 className="title">CineFiles</h1>
      <SearchBar onResults={handleSearchResults} />
      <div className="content-section">
        <h2 className="section-title">
          {isSearching ? 'Search Results' : 'Popular Movies'}
        </h2>
        <MovieList movies={movies} />
      </div>
    </div>
  );
}

export default HomePage; 