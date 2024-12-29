import React, { useState, useEffect } from 'react';
import MovieList from './MovieList';
import Filters from '../common/Filters';
import { useLocation } from 'react-router-dom';

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
  const isMobile = useResponsiveDefaults();
  const [hideWatched, setHideWatched] = useState(true);
  const [viewMode, setViewMode] = useState('scroll');
  const [isCompact, setIsCompact] = useState(isMobile);
  const [key, setKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Reset state when navigating to home from home
  useEffect(() => {
    setHideWatched(true);
    setViewMode('scroll');
    setIsCompact(isMobile);
    setKey(prev => prev + 1);
  }, [location.key]);

  // Update view mode and compact state when screen size changes
  useEffect(() => {
    setViewMode('scroll');
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

  return (
    <div className="min-h-screen text-primary">
      {/* Fixed Header Container */}
      <div className={`fixed top-14 left-0 right-0 z-10 transition-transform duration-200 ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}>
        {/* Header Background */}
        <div className="relative w-full h-16 bg-background/80 backdrop-blur-sm border-b border-border">
          {/* Content Container */}
          <div className="container mx-auto px-4 md:px-8 lg:px-12 h-full flex items-center justify-between">
            {/* Filter Section */}
            <div className="flex items-center">
              <Filters hideWatched={hideWatched} setHideWatched={setHideWatched} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
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