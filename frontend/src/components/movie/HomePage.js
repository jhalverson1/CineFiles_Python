import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import NewsSection from './NewsSection';
import Breadcrumb from '../common/Breadcrumb';
import { movieApi } from '../../utils/api';
import '../../styles/HomePage.css';

function HomePage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [popular, topRated, upcoming, news] = await Promise.all([
          movieApi.getPopularMovies(),
          movieApi.getTopRatedMovies(),
          movieApi.getUpcomingMovies(),
          movieApi.getMovieNews()
        ]);
        
        console.log('API Responses:', {
          popular,
          topRated,
          upcoming,
          news
        });

        setPopularMovies(popular?.results || []);
        setTopRatedMovies(topRated?.results || []);
        setUpcomingMovies(upcoming?.results || []);
        setNewsItems(Array.isArray(news?.items) ? news.items : []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearching(true);
  };

  const MovieSection = ({ title, movies }) => (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <MovieList movies={movies} compact={true} />
    </div>
  );

  return (
    <div className="home-container">
      <Breadcrumb />
      <h1 className="title">CineFiles</h1>
      <SearchBar onResults={handleSearchResults} />
      
      {isSearching ? (
        <MovieSection title="Search Results" movies={searchResults} />
      ) : (
        <>
          <MovieSection title="Popular Movies" movies={popularMovies} />
          <MovieSection title="Top Rated" movies={topRatedMovies} />
          <MovieSection title="Coming Soon" movies={upcomingMovies} />
          <NewsSection newsItems={newsItems} />
        </>
      )}
    </div>
  );
}

export default HomePage; 