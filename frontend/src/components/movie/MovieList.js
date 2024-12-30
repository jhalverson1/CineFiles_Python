/**
 * MovieList component that displays a horizontally scrollable list of movies.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { movieApi } from '../../utils/api';
import MovieCard from './MovieCard';
import { useLists } from '../../contexts/ListsContext';
import { AnimatePresence, motion } from 'framer-motion';

const MovieList = ({ 
  type, 
  movies: propMovies, 
  hideWatched, 
  viewMode = 'scroll', 
  isCompact = false,
  onRemoveFromList = null,
  listId = null,
  onWatchedToggle = null,
  onWatchlistToggle = null
}) => {
  // Force compact mode when grid view is selected
  const effectiveIsCompact = viewMode === 'grid' ? true : isCompact;
  
  const [allMovies, setAllMovies] = useState(propMovies || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(!propMovies);
  const [isLoading, setIsLoading] = useState(!propMovies);
  const [error, setError] = useState(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const scrollContainerRef = useRef(null);
  const { lists, loading: listsLoading } = useLists();

  // Fetch movies when type or page changes
  useEffect(() => {
    // If we have propMovies, don't fetch
    if (propMovies) {
      setAllMovies(propMovies);
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    const fetchMovies = async () => {
      if (!hasMore && page > 1) return;
      
      setIsLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case 'popular':
            response = await movieApi.getPopularMovies(page);
            break;
          case 'top-rated':
            response = await movieApi.getTopRatedMovies(page);
            break;
          case 'upcoming':
            response = await movieApi.getUpcomingMovies(page);
            break;
          case 'hidden-gems':
            response = await movieApi.getHiddenGems(page);
            break;
          case 'news':
            response = await movieApi.getMovieNews(page);
            break;
          default:
            throw new Error('Invalid movie list type');
        }
        
        if (page === 1) {
          setAllMovies(response.results || []);
        } else {
          setAllMovies(prev => [...prev, ...(response.results || [])]);
        }
        
        setHasMore(response.page < response.total_pages);
      } catch (err) {
        console.error(`Error fetching ${type} movies:`, err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [type, page, propMovies]);

  // Filter movies client-side when hideWatched or lists change
  const displayedMovies = useMemo(() => {
    if (!hideWatched || !lists || lists.length === 0) return allMovies;
    
    const watchedList = lists.find(list => list.name === "Watched");
    if (!watchedList) return allMovies;
    
    const watchedMovieIds = new Set(watchedList.items?.map(item => item.movie_id) || []);
    const filteredMovies = allMovies.filter(movie => !watchedMovieIds.has(movie.id.toString()));

    // If we're hiding watched movies and don't have enough movies, fetch more
    if (hideWatched && !isLoading && hasMore && filteredMovies.length < 20) {
      setPage(prev => prev + 1);
    }

    return filteredMovies;
  }, [allMovies, hideWatched, lists, isLoading, hasMore]);

  useEffect(() => {
    if (viewMode !== 'scroll') return;
    
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft + clientWidth < scrollWidth - 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [displayedMovies, viewMode]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      if (direction === 'right' && scrollLeft + clientWidth + scrollAmount >= scrollWidth - 100) {
        scrollContainerRef.current.scrollTo({
          left: scrollWidth,
          behavior: 'smooth'
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: direction === 'right' ? scrollAmount : -scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderMovieCard = (movie) => (
    <MovieCard 
      movie={movie} 
      isCompact={effectiveIsCompact}
      onRemove={onRemoveFromList}
      listId={listId}
      onWatchedToggle={onWatchedToggle}
      onWatchlistToggle={onWatchlistToggle}
    />
  );

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading movies: {error}
      </div>
    );
  }

  const renderMovieList = () => {
    if (viewMode === 'scroll') {
      return (
        <div className="relative group">
          {showLeftButton && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-background-secondary/80 text-primary p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {showRightButton && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-background-secondary/80 text-primary p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div ref={scrollContainerRef} className="overflow-x-auto scrollbar-hide relative">
            <div className="flex gap-4 p-4">
              <AnimatePresence mode="popLayout">
                {displayedMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    className={`flex-none ${effectiveIsCompact ? 'w-[120px]' : 'w-[180px]'}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ 
                      opacity: 0,
                      scale: 0.8,
                      y: -20,
                      transition: {
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                    layout
                  >
                    {renderMovieCard(movie)}
                  </motion.div>
                ))}
                {hasMore && (
                  <div className={`flex-none ${effectiveIsCompact ? 'w-[60px]' : 'w-[90px]'} flex items-center justify-center`}>
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/20" />
                    ) : (
                      <button
                        onClick={handleLoadMore}
                        className="p-3 rounded-full bg-background-secondary text-primary hover:bg-background-active transition-colors"
                        aria-label="Load more movies"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className={`grid ${
          effectiveIsCompact 
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-0.5 px-0.5' 
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 px-2'
        }`}>
          <AnimatePresence mode="popLayout">
            {displayedMovies.map((movie) => (
              <motion.div
                key={movie.id}
                className="w-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ 
                  opacity: 0,
                  scale: 0.8,
                  y: -20,
                  transition: {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                layout
              >
                {renderMovieCard(movie)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Load More Button (only for grid view) */}
        {hasMore && (
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg bg-background-secondary text-primary transition-colors
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-background-active'}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {isLoading && displayedMovies.length === 0 ? (
        <div className={viewMode === 'grid' 
          ? `grid ${
              effectiveIsCompact 
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-0.5 px-0.5'
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 px-2'
            }`
          : "flex gap-4 p-4"
        }>
          {Array(6).fill(null).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className={`${
                viewMode === 'scroll' ? 'flex-none' : 'w-full'
              } ${
                effectiveIsCompact ? 'w-[120px]' : 'w-[180px]'
              } bg-background-secondary rounded-lg overflow-hidden animate-pulse`}
            >
              <div className="aspect-[2/3] bg-background-active" />
              <div className="p-4">
                <div className="h-4 bg-background-active rounded w-3/4 mb-2" />
                <div className="h-4 bg-background-active rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        renderMovieList()
      )}
    </div>
  );
};

export default MovieList;