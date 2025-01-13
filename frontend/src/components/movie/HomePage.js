import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MovieList from './MovieList';
import FilterBar from '../filters/FilterBar';
import HomepageFilterManager from '../filters/HomepageFilterManager';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { movieApi, filterSettingsApi } from '../../utils/api';
import { listsApi } from '../../utils/listsApi';
import { AnimatePresence, motion } from 'framer-motion';
import { useLists } from '../../contexts/ListsContext';
import { DEFAULT_MOVIE_LISTS } from '../../constants/movieLists';
import { variants } from '../../utils/theme';
import MovieDetailsModal from './MovieDetailsModal';
import { toast } from 'react-hot-toast';

// Custom hook for responsive design
const useResponsiveDefaults = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const isMobile = useResponsiveDefaults();
  const { lists, updateListStatus, addToList } = useLists();
  const [excludedLists, setExcludedLists] = useState([]);
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()]);
  const [ratingRange, setRatingRange] = useState([0, 10]);
  const [popularityRange, setPopularityRange] = useState(null);
  const [viewMode, setViewMode] = useState('scroll');
  const [isCompact, setIsCompact] = useState(isMobile);
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isHomepageManagerOpen, setIsHomepageManagerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [excludeOpen, setExcludeOpen] = useState(false);
  const [homepageLists, setHomepageLists] = useState([]);
  const [isLoadingLists, setIsLoadingLists] = useState(true);
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
  const excludeRef = useRef(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const isDefaultYearRange = yearRange?.[0] === 1900 && yearRange?.[1] === currentYear;
    const isDefaultRatingRange = ratingRange?.[0] === 0 && ratingRange?.[1] === 10;

    return !!(
      (!isDefaultYearRange) || 
      (!isDefaultRatingRange) || 
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
  const loadHomepageLists = useCallback(async () => {
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
          type: 'default',
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
  }, []);

  // Initial load of homepage lists
  useEffect(() => {
    loadHomepageLists();
  }, [loadHomepageLists]);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoadingGenres(true);
        const response = await movieApi.getMovieGenres();
        setGenres(response.genres || []);
      } catch (error) {
        console.error('Error fetching genres:', error);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Reset state when navigating to home from a different route
  useEffect(() => {
    const isNavigatingFromDifferentRoute = !location.pathname.includes('/movie/');
    if (isNavigatingFromDifferentRoute) {
      setExcludedLists([]);
      setYearRange([1900, new Date().getFullYear()]);
      setRatingRange([0, 10]);
      setPopularityRange(null);
      setViewMode('scroll');
      setIsCompact(isMobile);
      setKey(prev => prev + 1);
      setSearchResults(null);
      setSearchQuery('');
      setIsSearchOpen(false);
      setWatchProviders([]);
      setWatchRegion('US');
      setVoteCountRange(null);
      setRuntimeRange(null);
      setOriginalLanguage(null);
      setSpokenLanguages([]);
      setReleaseTypes([]);
      setIncludeKeywords([]);
      setExcludeKeywords([]);
      setSortBy(null);
    }
  }, [location.pathname, isMobile]);

  // Handle search toggle
  const handleSearchToggle = () => {
    if (isFiltersOpen) {
      setIsFiltersOpen(false);
    }
    setIsSearchOpen(prev => !prev);
    if (isSearchOpen) {
      setSearchResults(null);
      setSearchQuery('');
    }
  };

  // Handle filter toggle
  const handleFilterToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchResults(null);
      setSearchQuery('');
    }
    setIsFiltersOpen(prev => !prev);
  };

  // Update view mode and compact state when screen size changes
  useEffect(() => {
    setIsCompact(isMobile);
  }, [isMobile]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await movieApi.searchMovies(searchQuery);
      setSearchResults(response.results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults(null);
    }
  };

  // Handle click outside for exclude dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (excludeRef.current && !excludeRef.current.contains(event.target)) {
        setExcludeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add this effect near the other useEffect hooks
  useEffect(() => {
    if (isMobile) {
      setIsCompact(true);
    }
  }, [isMobile]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await loadHomepageLists();
      
      const movieId = location.pathname.match(/\/movie\/(\d+)/)?.[1];
      if (movieId) {
        setIsLoadingModal(true);
        try {
          const [details, credits, videos, watchProviders] = await Promise.all([
            movieApi.getMovieDetails(movieId),
            movieApi.getMovieCredits(movieId),
            movieApi.getMovieVideos(movieId),
            movieApi.getMovieWatchProviders(movieId)
          ]);

          setMovieDetails({
            ...details,
            credits,
            videos: videos.results || [],
            similar: [], // Temporarily disabled until backend is ready
            watchProviders: watchProviders.results?.US?.flatrate || []
          });
          setSelectedMovie(details);
        } catch (error) {
          console.error('Error loading movie details:', error);
          toast.error('Failed to load movie details');
          // Don't navigate away, just clear the modal state
          setSelectedMovie(null);
          setMovieDetails(null);
        } finally {
          setIsLoadingModal(false);
        }
      }
    };

    loadInitialData();
  }, []);

  // Handle closing modal
  const handleCloseModal = useCallback(() => {
    const baseUrl = '/';
    navigate(baseUrl, { 
      replace: true
    });
  }, [navigate]);

  // Handle toggling movies in Watched list
  const onWatchedToggle = useCallback(async (movie) => {
    try {
      if (!movie || !movie.id) {
        throw new Error('Invalid movie object');
      }

      const movieId = movie.id.toString();
      const previousStatus = {
        isWatched: lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === movieId),
        isInWatchlist: lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === movieId)
      };

      // Optimistically update UI
      updateListStatus(movieId, {
        is_watched: !previousStatus.isWatched,
        in_watchlist: previousStatus.isWatched ? previousStatus.isInWatchlist : false
      });

      try {
        const response = await listsApi.toggleWatched(movieId);
        // Update with actual server response
        updateListStatus(movieId, response);
      } catch (error) {
        // Revert to previous state on error
        updateListStatus(movieId, {
          is_watched: previousStatus.isWatched,
          in_watchlist: previousStatus.isInWatchlist
        });
        throw error;
      }
    } catch (error) {
      console.error('Error toggling watched status:', error);
      toast.error('Failed to update watched status');
    }
  }, [lists, updateListStatus]);

  // Handle toggling movies in Watchlist
  const onWatchlistToggle = useCallback(async (movie) => {
    try {
      if (!movie || !movie.id) {
        throw new Error('Invalid movie object');
      }

      const movieId = movie.id.toString();
      const previousStatus = {
        isWatched: lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === movieId),
        isInWatchlist: lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === movieId)
      };

      // Optimistically update UI
      updateListStatus(movieId, {
        is_watched: previousStatus.isWatched,
        in_watchlist: !previousStatus.isInWatchlist
      });

      try {
        const response = await listsApi.toggleWatchlist(movieId);
        // Update with actual server response
        updateListStatus(movieId, response);
      } catch (error) {
        // Revert to previous state on error
        updateListStatus(movieId, {
          is_watched: previousStatus.isWatched,
          in_watchlist: previousStatus.isInWatchlist
        });
        throw error;
      }
    } catch (error) {
      console.error('Error toggling watchlist status:', error);
      toast.error('Failed to update watchlist');
    }
  }, [lists, updateListStatus]);

  return (
    <div>
      {/* Fixed Header Container */}
      <div className={variants.header.container}>
        {/* Solid colored backdrop */}
        <div className={variants.header.backdrop} />
        
        {/* Content */}
        <div className={variants.header.content}>
          <div className={variants.header.toolbar}>
            {/* Action Toolbar */}
            <div className="flex items-center justify-between w-full">
              {/* Left side - Filter and Search */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFilterToggle}
                  className={`inline-flex items-center px-4 py-2 border rounded-md transition-colors ${
                    isFiltersOpen 
                      ? variants.filter.button.active
                      : variants.filter.button.inactive
                  }`}
                  aria-label="Toggle filters"
                >
                  <span className="text-sm font-medium mr-2">FILTER & SORT</span>
                  <span className="text-lg leading-none">≡</span>
                </button>
                {/* Search Button */}
                <button
                  onClick={handleSearchToggle}
                  className={`${variants.header.button.base} ${
                    isSearchOpen 
                      ? variants.header.button.active
                      : variants.header.button.inactive
                  }`}
                  aria-label="Toggle search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Exclude Lists Filter */}
                <div className="relative" ref={excludeRef}>
                  <button
                    onClick={() => setExcludeOpen(!excludeOpen)}
                    className={`${variants.header.button.base} ${
                      excludeOpen 
                        ? variants.header.button.active 
                        : variants.header.button.inactive
                    }`}
                    aria-label="Toggle exclude lists"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Exclude Lists Dropdown */}
                  <AnimatePresence>
                    {excludeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-background-secondary border border-border-primary z-50"
                      >
                        <div className="p-4">
                          <h3 className="text-sm font-medium text-text-primary mb-2">Exclude From Results</h3>
                          <div className="space-y-2">
                            {lists.map((list) => (
                              <label key={list.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={excludedLists.includes(list.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setExcludedLists([...excludedLists, list.id]);
                                    } else {
                                      setExcludedLists(excludedLists.filter(id => id !== list.id));
                                    }
                                  }}
                                  className="form-checkbox h-4 w-4 text-primary rounded border-border-primary focus:ring-primary"
                                />
                                <span className="text-sm text-text-primary">{list.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Homepage List Manager Toggle */}
                <button
                  onClick={() => setIsHomepageManagerOpen(true)}
                  className={`${variants.header.button.base} ${
                    isHomepageManagerOpen 
                      ? variants.header.button.active
                      : variants.header.button.inactive
                  }`}
                  aria-label="Manage homepage lists"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>

              {/* Right side - View Mode and Compact Toggles */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <button
                  onClick={() => setViewMode(viewMode === 'scroll' ? 'grid' : 'scroll')}
                  className={`${variants.header.button.base} ${
                    viewMode === 'grid'
                      ? variants.header.button.active
                      : variants.header.button.inactive
                  }`}
                  aria-label={viewMode === 'scroll' ? "Switch to grid view" : "Switch to scroll view"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {viewMode === 'scroll' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                    )}
                  </svg>
                </button>

                {/* Compact Toggle - Only visible on non-mobile when in scroll view */}
                {!isMobile && viewMode !== 'grid' && (
                  <button
                    onClick={() => setIsCompact(!isCompact)}
                    className={`${variants.header.button.base} ${
                      isCompact
                        ? variants.header.button.active
                        : variants.header.button.inactive
                    }`}
                    aria-label={isCompact ? "Switch to expanded view" : "Switch to compact view"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCompact ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8v.01M4 12v.01M4 16v.01M8 8h12M8 12h12M8 16h12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar */}
            {isSearchOpen && (
              <div className="pt-3 pb-2">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                  <input
                    type="search"
                    placeholder="Search for movies..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-10 px-5 pr-12 py-2 text-sm rounded-xl
                             bg-black/75 text-text-primary
                             border border-white/10 hover:border-white/20
                             focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30
                             transition-all duration-200 ease-in-out
                             [&::-webkit-search-cancel-button]:hidden
                             placeholder:text-text-disabled"
                    aria-label="Search"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2
                             p-2 rounded-lg hover:bg-white/10
                             transition-all duration-200 ease-in-out
                             ${searchQuery.trim() && !isSearching
                               ? 'opacity-100 cursor-pointer text-white/90 hover:text-white' 
                               : 'opacity-50 cursor-not-allowed text-white/50'}`}
                    aria-label={isSearching ? 'Searching...' : 'Search'}
                  >
                    {isSearching ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel - Slide from right */}
      <AnimatePresence>
        {isFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsFiltersOpen(false)}
            />
            
            {/* Filter Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className={variants.filter.container}
            >
              <div className={variants.filter.header}>
                <h2 className="text-lg font-semibold text-black">Filter & Sort</h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className={`${variants.filter.button.base} !w-auto rounded-lg`}
                  aria-label="Close filter panel"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className={variants.filter.section}>
                <FilterBar 
                  yearRange={yearRange}
                  onYearRangeChange={setYearRange}
                  ratingRange={ratingRange}
                  onRatingRangeChange={setRatingRange}
                  popularityRange={popularityRange}
                  onPopularityRangeChange={setPopularityRange}
                  selectedGenres={selectedGenres}
                  onGenresChange={setSelectedGenres}
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Movie Lists - Add padding to account for fixed header height */}
      <div className={`space-y-12 container mx-auto px-4 md:px-8 lg:px-12 pt-24`}>
        <AnimatePresence mode="wait">
          {searchResults !== null ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <section>
                <div className="mb-8">
                  <h2 className={`${variants.header.title.base} ${variants.header.title.accent}`}>
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className={variants.header.title.description}>
                    Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </p>
                </div>
                {searchResults.length > 0 ? (
                  <MovieList 
                    key={`search-results-${searchQuery}`}
                    movies={searchResults}
                    excludedLists={excludedLists}
                    viewMode={viewMode}
                    isCompact={isCompact}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-text-secondary">No results found for "{searchQuery}"</p>
                  </div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="homepage-lists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Show filtered results section when filters are active */}
              {hasActiveFilters ? (
                <section>
                  <div className="mb-8">
                    <h2 className={`${variants.header.title.base} ${variants.header.title.accent}`}>
                      Filtered Results
                    </h2>
                    <p className={variants.header.title.description}>
                      Movies matching your selected filters
                    </p>
                  </div>
                  <MovieList
                    key={`filtered-results-${key}`}
                    type="filtered"
                    yearRange={yearRange}
                    ratingRange={ratingRange}
                    popularityRange={popularityRange}
                    selectedGenres={selectedGenres}
                    excludedLists={excludedLists}
                    viewMode={viewMode}
                    isCompact={isCompact}
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
                /* Only show default lists when no filters are active */
                <>
                  {/* Default lists section */}
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
                            <h2 className={`${variants.header.title.base} ${variants.header.title.accent}`}>
                              {list.name}
                            </h2>
                            <p className={variants.header.title.description}>
                              {list.description}
                            </p>
                          </div>
                          <MovieList
                            key={`${list.type}-${list.id}-${key}`}
                            type={list.type}
                            listId={list.id}
                            yearRange={yearRange}
                            ratingRange={ratingRange}
                            popularityRange={popularityRange}
                            selectedGenres={selectedGenres}
                            excludedLists={excludedLists}
                            viewMode={viewMode}
                            isCompact={isCompact}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Homepage Filter Manager Modal */}
      {isHomepageManagerOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50">
          <div className="bg-background-secondary rounded-lg shadow-xl mt-20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <HomepageFilterManager 
              onClose={() => setIsHomepageManagerOpen(false)}
              loadHomepageLists={loadHomepageLists}
            />
          </div>
        </div>
      )}

      {/* Movie Details Modal */}
      <AnimatePresence>
        {(selectedMovie || isLoadingModal) && (
          <MovieDetailsModal
            isOpen={true}
            onClose={handleCloseModal}
            movie={movieDetails || selectedMovie}
            cast={movieDetails?.credits?.cast}
            crew={movieDetails?.credits?.crew}
            similar={movieDetails?.similar}
            watchProviders={movieDetails?.watchProviders}
            videos={movieDetails?.videos}
            onWatchedToggle={onWatchedToggle}
            onWatchlistToggle={onWatchlistToggle}
            isWatched={lists?.find(list => list.name === 'Watched')?.items.some(item => item.movie_id === selectedMovie?.id.toString())}
            isInWatchlist={lists?.find(list => list.name === 'Watchlist')?.items.some(item => item.movie_id === selectedMovie?.id.toString())}
            isLoading={isLoadingModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage; 