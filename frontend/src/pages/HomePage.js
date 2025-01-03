import React, { useState, useEffect } from 'react';
import { movieApi } from '../utils/api';
import TabBar from '../components/TabBar';
import FilterBar from '../components/filters/FilterBar';
import MovieList from '../components/movie/MovieList';
import { useLists } from '../contexts/ListsContext';

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState('top-rated');
  const [yearRange, setYearRange] = useState([1990, new Date().getFullYear()]);
  const [ratingRange, setRatingRange] = useState([7.0, 10.0]);
  const [popularityRange, setPopularityRange] = useState([10000, 1000000]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [excludedLists, setExcludedLists] = useState([]);
  const { lists } = useLists();
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);

  // Fetch genres once when the app starts
  useEffect(() => {
    const fetchGenres = async () => {
      console.log('Starting genre fetch...');
      try {
        const response = await movieApi.getMovieGenres();
        console.log('Genre fetch successful:', response);
        if (response && response.genres) {
          setGenres(response.genres);
        } else {
          console.error('Invalid genre response format:', response);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <TabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />
      </div>

      <FilterBar
        yearRange={yearRange}
        onYearRangeChange={setYearRange}
        ratingRange={ratingRange}
        onRatingRangeChange={setRatingRange}
        popularityRange={popularityRange}
        onPopularityRangeChange={setPopularityRange}
        selectedGenres={selectedGenres}
        onGenresChange={setSelectedGenres}
        excludedLists={excludedLists}
        onExcludeListsChange={setExcludedLists}
        lists={lists}
        genres={genres}
        isLoadingGenres={isLoadingGenres}
      />

      {selectedTab === 'top-rated' && (
        <MovieList
          type="top-rated"
          yearRange={yearRange}
          ratingRange={ratingRange}
          popularityRange={popularityRange}
          selectedGenres={selectedGenres}
          excludedLists={excludedLists}
        />
      )}
      {selectedTab === 'upcoming' && (
        <MovieList
          type="upcoming"
          yearRange={yearRange}
          ratingRange={ratingRange}
          popularityRange={popularityRange}
          selectedGenres={selectedGenres}
          excludedLists={excludedLists}
        />
      )}
      {selectedTab === 'hidden-gems' && (
        <MovieList
          type="hidden-gems"
          yearRange={yearRange}
          ratingRange={ratingRange}
          popularityRange={popularityRange}
          selectedGenres={selectedGenres}
          excludedLists={excludedLists}
        />
      )}
    </div>
  );
};

export default HomePage; 