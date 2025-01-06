import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MovieList from './MovieList';
import FilterBar from '../filters/FilterBar';
import HomepageFilterManager from '../filters/HomepageFilterManager';
import { useLocation, useNavigate } from 'react-router-dom';
import { colorVariants } from '../../utils/theme';
import { movieApi, filterSettingsApi } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { useLists } from '../../contexts/ListsContext';
import { DEFAULT_MOVIE_LISTS } from '../../constants/movieLists';

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
  const isMobile = useResponsiveDefaults();
  const { lists } = useLists();
  const [excludedLists, setExcludedLists] = useState([]);
  const [yearRange, setYearRange] = useState([1990, new Date().getFullYear()]);
  const [ratingRange, setRatingRange] = useState([7.0, 10.0]);
  const [popularityRange, setPopularityRange] = useState([10000, 1000000]);
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
  const excludeRef = useRef(null);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      yearRange || 
      ratingRange || 
      popularityRange || 
      (selectedGenres && selectedGenres.length > 0)
    );
  }, [yearRange, ratingRange, popularityRange, selectedGenres]);

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

  // Reset state when navigating to home from home
  useEffect(() => {
    setExcludedLists([]);
    setYearRange([1990, new Date().getFullYear()]);
    setRatingRange([7.0, 10.0]);
    setPopularityRange([10000, 1000000]);
    setViewMode('scroll');
    setIsCompact(isMobile);
    setKey(prev => prev + 1);
    setSearchResults(null);
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [location.key, isMobile]);

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

  return (
    <div>
      {/* Fixed Header Container */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-background-secondary border-b border-border shadow-lg">
        {/* Solid colored backdrop */}
        <div className="absolute inset-0 bg-background-secondary" />
        
        {/* Content */}
        <div className="relative container mx-auto px-4 md:px-8 lg:px-12">
          <div className="py-4">
            {/* Action Toolbar */}
            <div className="flex items-center justify-between">
              {/* Left side - Filter and Search */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFilterToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    isFiltersOpen 
                      ? 'bg-background-tertiary text-text-primary' 
                      : 'bg-background-primary text-text-disabled hover:text-text-primary'
                  }`}
                  aria-label="Toggle filters"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                </button>
                {/* Search Button */}
                <button
                  onClick={handleSearchToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    isSearchOpen 
                      ? 'bg-background-tertiary text-text-primary' 
                      : 'bg-background-primary text-text-disabled hover:text-text-primary'
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
                    className={`p-2 rounded-lg transition-colors ${
                      excludeOpen 
                        ? 'bg-background-tertiary text-text-primary' 
                        : 'bg-background-primary text-text-disabled hover:text-text-primary'
                    }`}
                    aria-label="Toggle exclude lists"
                  >
                    <div className="relative">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        <circle cx="12" cy="12" r="10" strokeWidth={2} className="opacity-50" />
                      </svg>
                      {excludedLists.length > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-text-secondary/20 opacity-75"></div>
                          <div className="relative inline-flex h-3 w-3 rounded-full bg-text-secondary/40"></div>
                        </div>
                      )}
                    </div>
                  </button>
                  {excludeOpen && (
                    <div className="absolute z-[100] mt-2 w-64 bg-background-secondary/95 backdrop-blur-md border border-border/50 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-3 border-b border-border/10">
                        <h3 className="font-medium text-sm text-text-primary mb-1">Exclude movies from lists</h3>
                        <p className="text-xs text-text-secondary">Movies from selected lists will be hidden from results</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto scrollbar-hide py-1">
                        {lists.map((list) => (
                          <button
                            key={list.id}
                            className="w-full flex items-center px-4 py-3 md:py-2 hover:bg-background-active/50 cursor-pointer transition-colors duration-200 group text-left"
                            onClick={() => setExcludedLists(
                              excludedLists.includes(list.id)
                                ? excludedLists.filter(id => id !== list.id)
                                : [...excludedLists, list.id]
                            )}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mr-3 ${
                              excludedLists.includes(list.id)
                                ? 'bg-primary border-primary/80'
                                : 'border-text-disabled/30 group-hover:border-text-disabled/50'
                            }`}>
                              {excludedLists.includes(list.id) && (
                                <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-text-primary group-hover:text-text-primary/90">
                              {list.name}
                              <span className="ml-2 text-xs text-text-secondary px-2 py-0.5 rounded-full bg-background-tertiary/30">
                                {list.items?.length || 0}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Homepage Manager Button */}
                <button
                  onClick={() => setIsHomepageManagerOpen(true)}
                  className="p-2 rounded-lg bg-background-primary text-text-disabled hover:text-text-primary transition-colors"
                  aria-label="Manage homepage lists"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-background-primary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('scroll')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'scroll'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-disabled hover:text-text-primary'
                    }`}
                    aria-label="Switch to scroll view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('grid');
                      setIsCompact(true); // Force compact mode when switching to grid
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-background-tertiary text-text-primary'
                        : 'text-text-disabled hover:text-text-primary'
                    }`}
                    aria-label="Switch to grid view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>

                {/* Size Toggle - Hide on mobile and when grid view is active */}
                {!isMobile && viewMode !== 'grid' && (
                  <button
                    onClick={() => setIsCompact(!isCompact)}
                    className="p-2 rounded-lg bg-background-primary text-text-disabled hover:text-text-primary transition-colors"
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

            {/* Expandable Filter Banner */}
            <div className={isFiltersOpen ? "pt-3 pb-2" : ""}>
              {isFiltersOpen && (
                <div className="bg-black/75 rounded-xl border border-white/10 p-4">
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
                  />
                </div>
              )}
            </div>

            {/* Expandable Search Bar */}
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

      {/* Movie Lists - Add padding to account for fixed header height */}
      <div className={`space-y-12 container mx-auto px-4 md:px-8 lg:px-12 transition-[padding] duration-300 ease-in-out ${
        isSearchOpen && isFiltersOpen ? 'pt-72' : // Both open
        isFiltersOpen ? 'pt-52' : // Only filters open
        isSearchOpen ? 'pt-40' : // Only search open
        'pt-24' // None open
      }`}>
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
                  <h2 className="text-2xl font-semibold mb-2 text-text-primary pl-2 border-l-[6px] border-gold">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-text-secondary pl-2">
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
                    <h2 className="text-2xl font-semibold mb-2 text-text-primary pl-2 border-l-[6px] border-gold">
                      Filtered Results
                    </h2>
                    <p className="text-text-secondary pl-2">
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
                          <h2 className="text-2xl font-semibold mb-4 text-text-primary pl-2 border-l-[6px] border-gold">
                            {list.name}
                          </h2>
                          {list.type === 'default' ? (
                            <MovieList
                              key={`${list.id}-${key}`}
                              type="tmdb"
                              listId={list.id}
                              excludedLists={excludedLists}
                              viewMode={viewMode}
                              isCompact={isCompact}
                            />
                          ) : (
                            <MovieList
                              key={`filtered-${list.id}-${key}`}
                              type="filtered"
                              listId={list.id}
                              yearRange={list.year_range ? JSON.parse(list.year_range) : null}
                              ratingRange={list.rating_range ? JSON.parse(list.rating_range) : null}
                              popularityRange={list.popularity_range ? JSON.parse(list.popularity_range) : null}
                              genres={list.genres ? JSON.parse(list.genres) : []}
                              excludedLists={excludedLists}
                              viewMode={viewMode}
                              isCompact={isCompact}
                            />
                          )}
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
    </div>
  );
};

export default HomePage; 