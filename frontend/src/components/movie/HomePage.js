import React, { useState, useEffect } from 'react';
import MovieList from './MovieList';
import Filters from '../common/Filters';
import { useLocation, useNavigate } from 'react-router-dom';
import { colorVariants } from '../../utils/theme';
import { movieApi } from '../../utils/api';
import { AnimatePresence, motion } from 'framer-motion';

// Custom hook for responsive design
const useResponsiveDefaults = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // Changed from 768px to 1000px
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
  const [excludedLists, setExcludedLists] = useState([]);
  const [viewMode, setViewMode] = useState('scroll');
  const [isCompact, setIsCompact] = useState(isMobile);
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Reset state when navigating to home from home
  useEffect(() => {
    setExcludedLists([]);
    setViewMode('scroll');
    setIsCompact(isMobile);
    setKey(prev => prev + 1);
    setSearchResults(null);
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [location.key, isMobile]);

  // Handle search toggle
  const handleSearchToggle = () => {
    setIsSearchOpen(prev => !prev);
    if (isSearchOpen) {
      setSearchResults(null);
      setSearchQuery('');
    }
  };

  // Update view mode and compact state when screen size changes
  useEffect(() => {
    setIsCompact(isMobile);
  }, [isMobile]);

  // Handle scroll events
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div>
      {/* Fixed Header Container */}
      <div className={`fixed top-14 left-0 right-0 z-40 bg-background-secondary border-b border-border shadow-lg transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
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
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
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
            {isFiltersOpen && (
              <div className="pt-3 pb-2">
                <div className="bg-black/75 rounded-xl border border-white/10 p-4">
                  <Filters 
                    excludedLists={excludedLists} 
                    setExcludedLists={setExcludedLists} 
                  />
                </div>
              </div>
            )}

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
              key="default-lists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-text-primary pl-2 border-l-[6px] border-gold bg-background-primary relative z-10">Hidden Gems</h2>
                <MovieList 
                  key={`hidden-gems-${key}`}
                  type="hidden-gems" 
                  excludedLists={excludedLists}
                  viewMode={viewMode}
                  isCompact={isCompact}
                />
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-text-primary pl-2 border-l-[6px] border-gold bg-background-primary relative z-10">Top Rated Movies</h2>
                <MovieList 
                  key={`top-rated-${key}`}
                  type="top-rated" 
                  excludedLists={excludedLists}
                  viewMode={viewMode}
                  isCompact={isCompact}
                />
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-text-primary pl-2 border-l-[6px] border-gold bg-background-primary relative z-10">Upcoming Movies</h2>
                <MovieList 
                  key={`upcoming-${key}`}
                  type="upcoming" 
                  excludedLists={excludedLists}
                  viewMode={viewMode}
                  isCompact={isCompact}
                />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HomePage; 