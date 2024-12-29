import React, { useState, useEffect } from 'react';
import MovieList from './MovieList';
import Filters from '../common/Filters';
import { useLocation, useNavigate } from 'react-router-dom';
import { colorVariants } from '../../utils/theme';
import { movieApi } from '../../utils/api';

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
  const [hideWatched, setHideWatched] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isCompact, setIsCompact] = useState(false);
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reset state when navigating to home from home
  useEffect(() => {
    setHideWatched(false);
    setViewMode('grid');
    setIsCompact(false);
    setKey(prev => prev + 1);
  }, [location.key]);

  // Update view mode and compact state when screen size changes
  useEffect(() => {
    setViewMode('grid');
    setIsCompact(false);
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
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await movieApi.searchMovies(searchQuery);
      navigate('/search', { 
        state: { 
          results: response.results,
          query: searchQuery 
        } 
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={`min-h-screen text-primary ${colorVariants.feltTexture.base}`}>
      {/* Fixed Header Container */}
      <div className={`fixed top-14 left-0 right-0 z-10 transition-transform duration-200 ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}>
        {/* Header Background */}
        <div className="relative w-full bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 md:px-8 lg:px-12">
            {/* Action Toolbar */}
            <div className="flex items-center justify-between py-4">
              {/* Left side - Filter */}
              <div className="flex items-center">
                <Filters hideWatched={hideWatched} setHideWatched={setHideWatched} />
              </div>

              {/* Right side - Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Search Button and Input */}
                <div className="relative">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`p-2 rounded-lg transition-colors ${
                      isSearchOpen 
                        ? 'bg-background-active text-primary' 
                        : 'bg-background-secondary text-text-disabled hover:text-primary'
                    }`}
                    aria-label="Toggle search"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-background-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('scroll')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'scroll'
                        ? 'bg-background-active text-primary'
                        : 'text-text-disabled hover:text-primary'
                    }`}
                    aria-label="Switch to scroll view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-background-active text-primary'
                        : 'text-text-disabled hover:text-primary'
                    }`}
                    aria-label="Switch to grid view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                </div>

                {/* Size Toggle - Hide on mobile */}
                {!isMobile && (
                  <button
                    onClick={() => setIsCompact(!isCompact)}
                    className="p-2 rounded-lg bg-background-secondary text-text-disabled hover:text-primary transition-colors"
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

            {/* Expandable Search Bar */}
            {isSearchOpen && (
              <div className="pb-4">
                <form onSubmit={handleSearch} className="relative flex items-center w-full">
                  <input
                    type="search"
                    placeholder="Search for movies..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full h-10 px-4 pr-10 py-2 text-sm rounded-md 
                             bg-background-secondary text-primary
                             focus:outline-none focus:ring-1 focus:ring-primary
                             [&::-webkit-search-cancel-button]:hidden
                             placeholder:text-text-disabled"
                    aria-label="Search"
                    autoFocus
                  />
                  <button 
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2
                             transition-opacity
                             ${searchQuery.trim() && !isSearching
                               ? 'opacity-100 cursor-pointer text-primary' 
                               : 'opacity-50 cursor-not-allowed text-text-disabled'}`}
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
      <div className="space-y-12 container mx-auto px-4 md:px-8 lg:px-12 pt-24">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary pl-2 border-l-[6px] border-primary">Hidden Gems</h2>
          <MovieList 
            key={`hidden-gems-${key}`}
            type="hidden-gems" 
            hideWatched={hideWatched} 
            viewMode={viewMode}
            isCompact={isCompact}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary pl-2 border-l-[6px] border-primary">Top Rated Movies</h2>
          <MovieList 
            key={`top-rated-${key}`}
            type="top-rated" 
            hideWatched={hideWatched} 
            viewMode={viewMode}
            isCompact={isCompact}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary pl-2 border-l-[6px] border-primary">Upcoming Movies</h2>
          <MovieList 
            key={`upcoming-${key}`}
            type="upcoming" 
            hideWatched={hideWatched} 
            viewMode={viewMode}
            isCompact={isCompact}
          />
        </section>
      </div>
    </div>
  );
};

export default HomePage; 