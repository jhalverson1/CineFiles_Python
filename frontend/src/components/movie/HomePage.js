import React, { useState, useEffect } from 'react';
import MovieList from './MovieList';
import Filters from '../common/Filters';

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
  const isMobile = useResponsiveDefaults();
  const [hideWatched, setHideWatched] = useState(false);
  const [viewMode, setViewMode] = useState(isMobile ? 'scroll' : 'scroll');
  const [isCompact, setIsCompact] = useState(true);

  // Update view mode and compact state when screen size changes
  useEffect(() => {
    setViewMode('scroll');
    setIsCompact(true);
  }, [isMobile]);

  return (
    <div className="min-h-screen text-white bg-[#1E1118]">
      {/* Hero Section with Controls */}
      <div className="w-full px-4 py-8 sticky top-0 z-10 bg-[#1E1118]/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Filters hideWatched={hideWatched} setHideWatched={setHideWatched} />
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('scroll')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'scroll'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
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
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
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
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
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

      {/* Movie Lists */}
      <div className="space-y-12 px-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Movies</h2>
          <MovieList 
            type="popular" 
            hideWatched={hideWatched} 
            viewMode={viewMode}
            isCompact={isCompact}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Top Rated Movies</h2>
          <MovieList 
            type="top-rated" 
            hideWatched={hideWatched} 
            viewMode={viewMode}
            isCompact={isCompact}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Movies</h2>
          <MovieList 
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