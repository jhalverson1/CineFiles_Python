import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import SearchResults from './SearchResults';
import NewsSection from './NewsSection';
import { movieApi } from '../../utils/api';
import '../../styles/HomePage.css';

function HomePage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearchResults = (results) => {
    console.log('Search results received:', results);
    setSearchResults(results?.results || []);
    setIsSearching(true);
    setIsSearchLoading(false);
    console.log('isSearching set to true');
  };

  const handleSearchStart = () => {
    setIsSearchLoading(true);
  };

  const MovieSection = ({ title, movies, loading }) => (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>
      <MovieList movies={movies} isLoading={loading} />
    </div>
  );

  return (
    <div className="home-container">
      <h1 className="title">CineFiles</h1>
      <SearchBar onResults={handleSearchResults} onSearchStart={handleSearchStart} />
      
      {isSearching ? (
        <SearchResults movies={searchResults} isLoading={isSearchLoading} />
      ) : (
        <>
          <MovieSection title="Popular Movies" movies={popularMovies} loading={isLoading} />
          <MovieSection title="Top Rated" movies={topRatedMovies} loading={isLoading} />
          <MovieSection title="Coming Soon" movies={upcomingMovies} loading={isLoading} />
          <NewsSection newsItems={newsItems} />
        </>
      )}
    </div>
  );
}

export default HomePage; 