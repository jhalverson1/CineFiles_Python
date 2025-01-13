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
  selectedGenres = [],
  watchProviders = [],
  watchRegion = null,
  voteCountRange = null,
  runtimeRange = null,
  originalLanguage = null,
  spokenLanguages = [],
  releaseTypes = [],
  includeKeywords = [],
  excludeKeywords = [],
  sortBy = null
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

    // For default type, use the listId as the type for TMDB lists
    if (type === 'default' && DEFAULT_MOVIE_LISTS.some(list => list.id === listId)) {
      listType = listId;  // Use the listId as the type (e.g., 'popular', 'top_rated')
      effectiveListId = null;
    } else if (type === 'filter') {
      // For filter settings, keep the type as 'filter' and use the listId
      listType = 'filter';
      effectiveListId = listId;
    }

    const newFilters = {
      listType,
      listId: effectiveListId,
      yearRange,
      ratingRange,
      popularityRange,
      genres: selectedGenres,
      watchProviders: watchProviders?.length > 0 ? watchProviders : undefined,
      watchRegion: watchRegion || 'US',
      voteCountRange,
      runtimeRange,
      originalLanguage,
      spokenLanguages: spokenLanguages?.length > 0 ? spokenLanguages : undefined,
      releaseTypes: releaseTypes?.length > 0 ? releaseTypes : undefined,
      includeKeywords: includeKeywords?.length > 0 ? includeKeywords : undefined,
      excludeKeywords: excludeKeywords?.length > 0 ? excludeKeywords : undefined,
      sortBy
    };

    return newFilters;
  }, [
    type, 
    listId, 
    yearRange, 
    ratingRange, 
    popularityRange, 
    selectedGenres, 
    watchProviders, 
    watchRegion,
    voteCountRange,
    runtimeRange,
    originalLanguage,
    spokenLanguages,
    releaseTypes,
    includeKeywords,
    excludeKeywords,
    sortBy
  ]);

  // Reset state when filters or propMovies change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (!propMovies) {
        setIsLoading(true);
      }
      return;
    }

    if (!propMovies) {
      const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
      if (filtersChanged) {
        setPage(1);
        setAllMovies([]);
        setHasMore(true);
        setIsLoading(true);
      }
    } else {
      const moviesChanged = JSON.stringify(propMovies) !== JSON.stringify(allMovies);
      if (moviesChanged) {
        setAllMovies(propMovies);
        setHasMore(false);
        setIsLoading(false);
      }
    }
  }, [propMovies, filters]);

  // Fetch movies function
  const fetchMovies = useCallback(async (currentPage, currentFilters) => {
    if (currentPage > 1 && !allMovies.length) {
      return;
    }

    const cacheKey = getCacheKey(currentPage, currentFilters);
    if (requestCache.current.has(cacheKey)) {
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
      let response;
      
      if (currentFilters.listType === 'filter') {
        console.log('MovieList fetchMovies - Handling filter setting');
        response = await movieApi.getFilterSettingMovies(currentFilters.listId, currentPage, {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres,
          watchProviders: currentFilters.watchProviders,
          watchRegion: currentFilters.watchRegion,
          voteCountRange: currentFilters.voteCountRange,
          runtimeRange: currentFilters.runtimeRange,
          originalLanguage: currentFilters.originalLanguage,
          spokenLanguages: currentFilters.spokenLanguages,
          releaseTypes: currentFilters.releaseTypes,
          includeKeywords: currentFilters.includeKeywords,
          excludeKeywords: currentFilters.excludeKeywords,
          sortBy: currentFilters.sortBy
        });
      } else if (currentFilters.listType === 'filtered') {
        console.log('MovieList fetchMovies - Handling filtered list');
        response = await movieApi.getFilteredMovies(currentPage, {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres,
          watchProviders: currentFilters.watchProviders,
          watchRegion: currentFilters.watchRegion,
          voteCountRange: currentFilters.voteCountRange,
          runtimeRange: currentFilters.runtimeRange,
          originalLanguage: currentFilters.originalLanguage,
          spokenLanguages: currentFilters.spokenLanguages,
          releaseTypes: currentFilters.releaseTypes,
          includeKeywords: currentFilters.includeKeywords,
          excludeKeywords: currentFilters.excludeKeywords,
          sortBy: currentFilters.sortBy
        });
      } else if (DEFAULT_MOVIE_LISTS.some(list => list.id === currentFilters.listType)) {
        console.log('MovieList fetchMovies - Handling TMDB list:', {
          listType: currentFilters.listType,
          matchingList: DEFAULT_MOVIE_LISTS.find(list => list.id === currentFilters.listType)
        });
        const filterParams = {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres,
          watchProviders: currentFilters.watchProviders,
          watchRegion: currentFilters.watchRegion,
          voteCountRange: currentFilters.voteCountRange,
          runtimeRange: currentFilters.runtimeRange,
          originalLanguage: currentFilters.originalLanguage,
          spokenLanguages: currentFilters.spokenLanguages,
          releaseTypes: currentFilters.releaseTypes,
          includeKeywords: currentFilters.includeKeywords,
          excludeKeywords: currentFilters.excludeKeywords,
          sortBy: currentFilters.sortBy
        };

        // Use the listType directly as the endpoint for TMDB lists
        switch (currentFilters.listType) {
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
      } else if (currentFilters.listId) {
        console.log('MovieList fetchMovies - Handling custom user list');
        response = await movieApi.getListMovies(currentFilters.listId, currentPage, {
          yearRange: currentFilters.yearRange,
          ratingRange: currentFilters.ratingRange,
          popularityRange: currentFilters.popularityRange,
          genres: currentFilters.genres,
          watchProviders: currentFilters.watchProviders,
          watchRegion: currentFilters.watchRegion,
          voteCountRange: currentFilters.voteCountRange,
          runtimeRange: currentFilters.runtimeRange,
          originalLanguage: currentFilters.originalLanguage,
          spokenLanguages: currentFilters.spokenLanguages,
          releaseTypes: currentFilters.releaseTypes,
          includeKeywords: currentFilters.includeKeywords,
          excludeKeywords: currentFilters.excludeKeywords,
          sortBy: currentFilters.sortBy
        });
      } else {
        console.error('MovieList fetchMovies - Invalid list type:', currentFilters.listType);
        throw new Error(`Invalid list type: ${currentFilters.listType}`);
      }
      
      setRetryCount(0);
      requestCache.current.set(cacheKey, response);
      
      setAllMovies(prev => {
        const newMovies = currentPage === 1 ? 
          response.results || [] : 
          [...prev, ...(response.results || [])];
        
        if (JSON.stringify(prev) === JSON.stringify(newMovies)) {
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
      
      if (retryCount < MAX_RETRIES && err.response?.status !== 404) {
        console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES}) in ${RETRY_DELAY}ms...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchMovies(currentPage, currentFilters);
        }, RETRY_DELAY * Math.pow(2, retryCount));
      } else {
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
      prevPageRef.current = page;
    }
  }, [page]);

  useEffect(() => {
    if (allMovies !== prevAllMoviesRef.current) {
      prevAllMoviesRef.current = allMovies;
    }
  }, [allMovies]);

  // Debounced version of fetchMovies
  const debouncedFetchMovies = useMemo(
    () => debounce((currentPage, currentFilters) => {
      fetchMovies(currentPage, currentFilters);
    }, 300),
    [fetchMovies]
  );

  // Fetch movies when page or filters change
  useEffect(() => {
    if (propMovies) {
      return;
    }
    
    const cacheKey = getCacheKey(page, filters);
    if (requestCache.current.has(cacheKey)) {
      return;
    }
    
    if (page === 1 || (hasMore && allMovies.length > 0)) {
      debouncedFetchMovies(page, filters);
    }
    
    return () => {
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
          viewMode === 'grid'
            ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 px-1' 
            : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 px-2'
        }`}>
          <AnimatePresence mode="popLayout">
            {displayedMovies.map((movie) => (
              <motion.div
                key={movie.id}
                className={`w-full ${viewMode === 'grid' && 'sm:w-auto max-sm:[width:calc((100vw-0.5rem-(2*0.5rem)-(2*0.5rem))/3)]'}`}
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
          ? `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 px-1`
          : "flex gap-4 p-4"
        }>
          {Array(6).fill(null).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className={`${
                viewMode === 'scroll' 
                  ? `flex-none ${effectiveIsCompact ? 'w-[120px]' : 'w-[180px]'}`
                  : 'w-full'
              } ${viewMode === 'grid' && 'sm:w-auto max-sm:[width:calc((100vw-0.5rem-(2*0.5rem)-(2*0.5rem))/3)]'}`}
            >
              <div className="relative w-full group">
                <div className="block bg-background-secondary rounded-lg overflow-hidden relative z-10 h-full">
                  <div className="aspect-[2/3] relative">
                    {/* Action Buttons Skeleton */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-2 gap-1 md:p-2 md:gap-2">
                      <div className="flex-1">
                        <div className="w-8 h-8 rounded-full bg-background-active animate-pulse" />
                      </div>
                      <div className="flex flex-1 justify-end gap-1 md:gap-2">
                        <div className="flex-1 flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-background-active animate-pulse" />
                        </div>
                        <div className="flex-1 flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-background-active animate-pulse" />
                        </div>
                      </div>
                    </div>
                    {/* Poster Skeleton */}
                    <div className="w-full h-full bg-background-active animate-pulse" />
                  </div>
                  {/* Title and Info Skeleton */}
                  <div className="p-2">
                    <div className="h-4 bg-background-active rounded animate-pulse mb-2" />
                    <div className="flex justify-between items-center">
                      <div className="h-3 w-10 bg-background-active rounded animate-pulse" />
                      <div className="h-3 w-12 bg-background-active rounded animate-pulse" />
                    </div>
                  </div>
                </div>
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