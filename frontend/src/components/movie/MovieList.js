/**
 * MovieList component that displays a horizontally scrollable list of movies.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { movieApi } from '../../utils/api';
import MovieCard from './MovieCard';
import { useLists } from '../../contexts/ListsContext';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import { DEFAULT_MOVIE_LISTS } from '../../constants/movieLists';

const MovieList = ({ 
  type, 
  movies: propMovies, 
  hideWatched, 
  viewMode = 'scroll', 
  isCompact = false,
  onRemoveFromList = null,
  listId = null,
  onWatchedToggle = null,
  onWatchlistToggle = null,
  excludedLists = [],
  yearRange = null,
  ratingRange = null,
  popularityRange = null,
  selectedGenres = []
}) => {
  console.log('MovieList render', { type, propMovies: !!propMovies });
  
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
  
  // Keep track of previous values for debugging
  const prevFiltersRef = useRef();
  const prevPageRef = useRef(page);
  const prevAllMoviesRef = useRef(allMovies);
  const isFirstMount = useRef(true);
  const requestCache = useRef(new Map());
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  // Create a cache key for the current request
  const getCacheKey = useCallback((page, filters) => {
    return JSON.stringify({ page, filters });
  }, []);

  // Combine all filters into a single object for comparison
  const filters = useMemo(() => {
    // Map the list ID to the correct type if it's a TMDB list
    let listType = type;
    let effectiveListId = listId;

    if (type === 'tmdb') {
      // For TMDB lists, use the list ID from DEFAULT_MOVIE_LISTS
      const defaultList = DEFAULT_MOVIE_LISTS.find(list => list.id === listId);
      listType = defaultList?.id || listId;
      effectiveListId = null; // Don't use listId for TMDB lists
    } else if (type === 'filtered') {
      // For filtered lists, keep the type as 'filtered' and use the listId
      listType = 'filtered';
      effectiveListId = listId;
    }

    const newFilters = {
      listType,
      listId: effectiveListId,
      yearRange,
      ratingRange,
      popularityRange,
      genres: selectedGenres
    };
    
    if (JSON.stringify(newFilters) !== JSON.stringify(prevFiltersRef.current)) {
      console.log('Filters changed:', { 
        prev: prevFiltersRef.current, 
        new: newFilters 
      });
      prevFiltersRef.current = newFilters;
      // Clear cache when filters change
      requestCache.current.clear();
    }
    
    return newFilters;
  }, [type, listId, yearRange, ratingRange, popularityRange, selectedGenres]);

  // Reset state when filters or propMovies change
  useEffect(() => {
    console.log('Reset effect triggered', { 
      propMovies: !!propMovies,
      filters,
      isFirstMount: isFirstMount.current
    });

    // Skip the first mount since initial state is already set
    if (isFirstMount.current) {
      isFirstMount.current = false;
      // Initialize loading state properly
      if (!propMovies) {
        setIsLoading(true);
      }
      return;
    }

    if (!propMovies) {
      // Only reset if filters have actually changed
      const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
      if (filtersChanged) {
        console.log('Resetting state due to filter change');
        setPage(1);
        setAllMovies([]);
        setHasMore(true);
        setIsLoading(true);
      }
    } else {
      // Only update if propMovies has changed
      const moviesChanged = JSON.stringify(propMovies) !== JSON.stringify(allMovies);
      if (moviesChanged) {
        console.log('Updating movies from props');
        setAllMovies(propMovies);
        setHasMore(false);
        setIsLoading(false);
      }
    }
  }, [propMovies, filters]);

  // Fetch movies function
  const fetchMovies = useCallback(async (currentPage, currentFilters) => {
    console.log('fetchMovies called', { 
      currentPage,
      currentFilters,
      allMoviesLength: allMovies.length,
      isLoading,
      retryCount
    });

    if (currentPage > 1 && !allMovies.length) {
      console.log('Skipping fetch - no movies for pagination');
      return;
    }

    const cacheKey = getCacheKey(currentPage, currentFilters);
    if (requestCache.current.has(cacheKey)) {
      console.log('Using cached response');
      const cachedData = requestCache.current.get(cacheKey);
      setAllMovies(prev => {
        if (JSON.stringify(prev) === JSON.stringify(cachedData.results)) {
          return prev;
        }
        return currentPage === 1 ? cachedData.results : [...prev, ...cachedData.results];
      });
      setHasMore(cachedData.page < cachedData.total_pages);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Making API request', { currentPage, currentFilters });
      let response;
      
      // Check if this is a custom list or a default TMDB list
      if (currentFilters.listType === 'filtered') {
        // Custom filtered list
        response = await movieApi.getFilterSettingMovies(currentFilters.listId, currentPage, {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres
        });
      } else if (currentFilters.listId) {
        // Custom user list
        response = await movieApi.getListMovies(currentFilters.listId, currentPage, {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres
        });
      } else if (!currentFilters.listType) {
        // No list type or ID provided
        throw new Error('Either listId or listType must be provided');
      } else {
        // Default TMDB lists
        const filterParams = {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres
        };

        // Find the matching default list
        const defaultList = DEFAULT_MOVIE_LISTS.find(list => list.id === currentFilters.listType);
        if (!defaultList) {
          throw new Error(`Invalid list type: ${currentFilters.listType}`);
        }

        switch (defaultList.id) {
          case 'popular':
            response = await movieApi.getPopularMovies(currentPage, filterParams);
            break;
          case 'top_rated':
            response = await movieApi.getTopRatedMovies(currentPage, filterParams);
            break;
          case 'upcoming':
            response = await movieApi.getUpcomingMovies(currentPage, filterParams);
            break;
          case 'now_playing':
            response = await movieApi.getNowPlayingMovies(currentPage, filterParams);
            break;
          default:
            console.error('Invalid list type:', currentFilters.listType);
            throw new Error(`Invalid list type: ${currentFilters.listType}`);
        }
      }
      
      // Reset retry count on success
      setRetryCount(0);
      
      // Cache the response
      requestCache.current.set(cacheKey, response);
      
      setAllMovies(prev => {
        const newMovies = currentPage === 1 ? 
          response.results || [] : 
          [...prev, ...(response.results || [])];
        
        if (JSON.stringify(prev) === JSON.stringify(newMovies)) {
          console.log('Skipping identical movies update');
          return prev;
        }
        
        console.log('Updating movies', { 
          prevLength: prev.length,
          newLength: newMovies.length,
          isFirstPage: currentPage === 1
        });
        return newMovies;
      });
      
      setHasMore(response.page < response.total_pages);
    } catch (err) {
      console.error('Error fetching movies:', err);
      
      // Check if we should retry
      if (retryCount < MAX_RETRIES && err.response?.status !== 404) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_DELAY}ms...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchMovies(currentPage, currentFilters);
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        // Max retries reached or 404 error, show error state
        setError(err.response?.status === 404 
          ? "This movie list is no longer available."
          : "Failed to load movies. Please try again later."
        );
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [allMovies, retryCount]);

  // Log state changes
  useEffect(() => {
    if (page !== prevPageRef.current) {
      console.log('Page changed:', { prev: prevPageRef.current, new: page });
      prevPageRef.current = page;
    }
  }, [page]);

  useEffect(() => {
    if (allMovies !== prevAllMoviesRef.current) {
      console.log('Movies changed:', { 
        prevLength: prevAllMoviesRef.current?.length,
        newLength: allMovies.length
      });
      prevAllMoviesRef.current = allMovies;
    }
  }, [allMovies]);

  // Debounced version of fetchMovies
  const debouncedFetchMovies = useMemo(
    () => debounce((currentPage, currentFilters) => {
      console.log('Debounced fetch triggered', { currentPage, currentFilters });
      fetchMovies(currentPage, currentFilters);
    }, 300),
    [fetchMovies]
  );

  // Fetch movies when page or filters change
  useEffect(() => {
    console.log('Fetch effect triggered', {
      propMovies: !!propMovies,
      page,
      hasMore,
      allMoviesLength: allMovies.length,
      isLoading
    });

    if (propMovies) {
      console.log('Skipping fetch - using propMovies');
      return;
    }
    
    // Skip if we're already loading or if we have cached data
    const cacheKey = getCacheKey(page, filters);
    if (requestCache.current.has(cacheKey)) {
      console.log('Skipping fetch - using cached data');
      return;
    }
    
    if (page === 1 || (hasMore && allMovies.length > 0)) {
      console.log('Initiating fetch');
      debouncedFetchMovies(page, filters);
    } else {
      console.log('Skipping fetch - conditions not met');
    }
    
    return () => {
      console.log('Cleaning up fetch effect');
      debouncedFetchMovies.cancel();
    };
  }, [debouncedFetchMovies, page, filters, propMovies, hasMore, getCacheKey]);

  // Filter movies client-side based on excluded lists
  const displayedMovies = useMemo(() => {
    if (!allMovies?.length) return [];
    if (!lists?.length || !excludedLists?.length) return allMovies;
    
    const excludedMovieIds = new Set();
    excludedLists.forEach(listId => {
      const list = lists.find(l => l.id === listId);
      if (list?.items) {
        list.items.forEach(item => excludedMovieIds.add(item.movie_id.toString()));
      }
    });
    
    return allMovies.filter(movie => !excludedMovieIds.has(movie.id.toString()));
  }, [allMovies, excludedLists, lists]);

  // Handle scroll buttons visibility
  useEffect(() => {
    if (viewMode !== 'scroll') return;
    
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 100);
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
  }, [viewMode]);

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