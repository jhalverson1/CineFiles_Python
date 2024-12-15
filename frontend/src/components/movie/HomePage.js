import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import NewsSection from './NewsSection';
import Breadcrumb from '../common/Breadcrumb';
import { movieApi } from '../../utils/api';
import '../../styles/HomePage.css';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [popularMovies, news] = await Promise.all([
          movieApi.getPopularMovies(),
          movieApi.getMovieNews()
        ]);
        setMovies(popularMovies);
        setNewsItems(news);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleSearchResults = (searchResults) => {
    setMovies(searchResults);
    setIsSearching(true);
  };

  return (
    <div className="home-container">
      <Breadcrumb />
      <h1 className="title">CineFiles</h1>
      <SearchBar onResults={handleSearchResults} />
      <div className="content-section">
        <h2 className="section-title">
          {isSearching ? 'Search Results' : 'Popular Movies'}
        </h2>
        <MovieList movies={movies} />
      </div>
      {!isSearching && <NewsSection newsItems={newsItems} />}
    </div>
  );
}

export default HomePage; 