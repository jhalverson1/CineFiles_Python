import React, { useState, useEffect, useMemo } from 'react';
import { movieApi, filterSettingsApi } from '../utils/api';
import TabBar from '../components/TabBar';
import FilterBar from '../components/filters/FilterBar';
import MovieList from '../components/movie/MovieList';
import { useLists } from '../contexts/ListsContext';
import { DEFAULT_MOVIE_LISTS } from '../constants/movieLists';

const HomePage = () => {
  const [selectedTab, setSelectedTab] = useState('top-rated');
  const [yearRange, setYearRange] = useState(null);
  const [ratingRange, setRatingRange] = useState(null);
  const [popularityRange, setPopularityRange] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [excludedLists, setExcludedLists] = useState([]);
  const [watchProviders, setWatchProviders] = useState([]);
  const [watchRegion, setWatchRegion] = useState('US');
  const [voteCountRange, setVoteCountRange] = useState(null);
  const [runtimeRange, setRuntimeRange] = useState(null);
  const [originalLanguage, setOriginalLanguage] = useState(null);
  const [spokenLanguages, setSpokenLanguages] = useState([]);
  const [releaseTypes, setReleaseTypes] = useState([]);
  const [includeKeywords, setIncludeKeywords] = useState([]);
  const [excludeKeywords, setExcludeKeywords] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const { lists } = useLists();
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [homepageLists, setHomepageLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      yearRange || 
      ratingRange || 
      popularityRange || 
      (selectedGenres && selectedGenres.length > 0) ||
      (watchProviders && watchProviders.length > 0) ||
      voteCountRange ||
      runtimeRange ||
      originalLanguage ||
      (spokenLanguages && spokenLanguages.length > 0) ||
      (releaseTypes && releaseTypes.length > 0) ||
      (includeKeywords && includeKeywords.length > 0) ||
      (excludeKeywords && excludeKeywords.length > 0) ||
      sortBy
    );
  }, [
    yearRange, 
    ratingRange, 
    popularityRange, 
    selectedGenres, 
    watchProviders,
    voteCountRange,
    runtimeRange,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    includeKeywords,
    excludeKeywords,
    sortBy
  ]);

  // Load homepage lists
  const loadHomepageLists = async () => {
    try {
      setIsLoadingLists(true);
      
      // Load user's enabled filters
      const filters = await filterSettingsApi.getHomepageFilters();
      
      // Load enabled default lists from localStorage
      const savedDefaultLists = JSON.parse(localStorage.getItem('enabledDefaultLists') || '[]');
      const defaultLists = DEFAULT_MOVIE_LISTS
        .filter(list => savedDefaultLists.includes(list.id))
        .map((list, index) => ({
          ...list,
          type: 'tmdb',
          displayOrder: savedDefaultLists.indexOf(list.id)
        }));

      // Combine and sort all lists
      const allLists = [
        ...filters.map(f => ({
          ...f,
          type: 'filter',
          displayOrder: f.homepage_display_order
        })),
        ...defaultLists
      ].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setHomepageLists(allLists);
    } catch (error) {
      console.error('Error loading homepage lists:', error);
    } finally {
      setIsLoadingLists(false);
    }
  };

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
    loadHomepageLists();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
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
        watchProviders={watchProviders}
        onWatchProvidersChange={setWatchProviders}
        watchRegion={watchRegion}
        onWatchRegionChange={setWatchRegion}
        voteCountRange={voteCountRange}
        onVoteCountRangeChange={setVoteCountRange}
        runtimeRange={runtimeRange}
        onRuntimeRangeChange={setRuntimeRange}
        originalLanguage={originalLanguage}
        onOriginalLanguageChange={setOriginalLanguage}
        spokenLanguages={spokenLanguages}
        onSpokenLanguagesChange={setSpokenLanguages}
        releaseTypes={releaseTypes}
        onReleaseTypesChange={setReleaseTypes}
        includeKeywords={includeKeywords}
        onIncludeKeywordsChange={setIncludeKeywords}
        excludeKeywords={excludeKeywords}
        onExcludeKeywordsChange={setExcludeKeywords}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <div className="mt-8">
        {hasActiveFilters ? (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-text-primary pl-2 border-l-[6px] border-gold">
                Filtered Results
              </h2>
              <p className="text-text-secondary pl-2">
                Movies matching your selected filters
              </p>
            </div>
            <MovieList
              type="filtered"
              yearRange={yearRange}
              ratingRange={ratingRange}
              popularityRange={popularityRange}
              selectedGenres={selectedGenres}
              excludedLists={excludedLists}
              watchProviders={watchProviders}
              watchRegion={watchRegion}
              voteCountRange={voteCountRange}
              runtimeRange={runtimeRange}
              originalLanguage={originalLanguage}
              spokenLanguages={spokenLanguages}
              releaseTypes={releaseTypes}
              includeKeywords={includeKeywords}
              excludeKeywords={excludeKeywords}
              sortBy={sortBy}
            />
          </section>
        ) : (
          <>
            {isLoadingLists ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : homepageLists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">No movie lists enabled. Click the list manager button to add some!</p>
              </div>
            ) : (
              <div className="space-y-12">
                {homepageLists.map((list) => (
                  <section key={`${list.type}-${list.id}`}>
                    <div className="mb-8">
                      <h2 className="text-2xl font-semibold mb-2 text-text-primary pl-2 border-l-[6px] border-gold">
                        {list.name}
                      </h2>
                      {list.description && (
                        <p className="text-text-secondary pl-2">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <MovieList
                      type={list.type === 'tmdb' ? list.id : list.type}
                      listId={list.type === 'tmdb' ? null : list.id}
                      yearRange={yearRange}
                      ratingRange={ratingRange}
                      popularityRange={popularityRange}
                      selectedGenres={selectedGenres}
                      excludedLists={excludedLists}
                      watchProviders={watchProviders}
                      watchRegion={watchRegion}
                      voteCountRange={voteCountRange}
                      runtimeRange={runtimeRange}
                      originalLanguage={originalLanguage}
                      spokenLanguages={spokenLanguages}
                      releaseTypes={releaseTypes}
                      includeKeywords={includeKeywords}
                      excludeKeywords={excludeKeywords}
                      sortBy={sortBy}
                    />
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage; 