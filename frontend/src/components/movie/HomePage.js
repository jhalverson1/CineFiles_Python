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
  const [viewMode, setViewMode] = useState('grid');
  const [isCompact, setIsCompact] = useState(true);
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
  const [openSections, setOpenSections] = useState(new Set());
  const [paginationState, setPaginationState] = useState({});
  const [loadingMore, setLoadingMore] = useState({});
  const [hasMore, setHasMore] = useState({});
  const searchObserverRef = useRef(null);
  const filteredObserverRef = useRef(null);
  const listObserverRefs = useRef({});
  const [listMovies, setListMovies] = useState({});

  // Update MovieList component to handle new movies
  const handleMoviesUpdate = useCallback((listKey, newMovies, totalPages) => {
    setListMovies(prev => {
      const existingMovies = prev[listKey] || [];
      const existingIds = new Set(existingMovies.map(movie => movie.id));
      
      // Filter out any duplicate movies
      const uniqueNewMovies = newMovies.filter(movie => !existingIds.has(movie.id));
      
      return {
        ...prev,
        [listKey]: [...existingMovies, ...uniqueNewMovies]
      };
    });
  }, []);

  // Define handleLoadMore before other functions that use it
  const handleLoadMore = useCallback(async (listKey) => {
    if (loadingMore[listKey] || hasMore[listKey] === false) return;

    const currentPage = (paginationState[listKey]?.page || 1) + 1;
    
    // Don't proceed if we're already loading this page
    if (loadingMore[listKey]) return;
    
    setLoadingMore(prev => ({ ...prev, [listKey]: true }));
    
    try {
      let response;

      if (listKey === 'search-results') {
        response = await movieApi.searchMovies(searchQuery, currentPage);
        if (response) {
          setSearchResults(prev => {
            const existingIds = new Set((prev || []).map(movie => movie.id));
            const uniqueNewMovies = response.results.filter(movie => !existingIds.has(movie.id));
            return [...(prev || []), ...uniqueNewMovies];
          });
        }
      } else if (listKey === 'filtered-results') {
        response = await movieApi.getFilteredMovies(currentPage, {
          yearRange,
          ratingRange,
          popularityRange,
          genres: selectedGenres,
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
        });
      } else {
        const [type, id] = listKey.split('-');
        if (type === 'default') {
          switch (id) {
            case 'popular':
              response = await movieApi.getPopularMovies(currentPage);
              break;
            case 'top_rated':
              response = await movieApi.getTopRatedMovies(currentPage);
              break;
            case 'upcoming':
              response = await movieApi.getUpcomingMovies(currentPage);
              break;
            case 'now_playing':
              response = await movieApi.getNowPlayingMovies(currentPage);
              break;
            default:
              throw new Error(`Invalid default list type: ${id}`);
          }
        } else if (type === 'filter') {
          response = await movieApi.getFilterSettingMovies(id, currentPage);
        } else {
          response = await movieApi.getListMovies(id, currentPage);
        }
      }

      if (response) {
        if (listKey !== 'search-results') {
          handleMoviesUpdate(listKey, response.results, response.total_pages);
        }

        setPaginationState(prev => ({
          ...prev,
          [listKey]: {
            page: currentPage,
            totalPages: response.total_pages
          }
        }));

        const hasMorePages = currentPage < response.total_pages;
        setHasMore(prev => ({
          ...prev,
          [listKey]: hasMorePages
        }));
      }
    } catch (error) {
      console.error('Error loading more movies:', error);
      toast.error('Failed to load more movies');
      setHasMore(prev => ({
        ...prev,
        [listKey]: false
      }));
    } finally {
      setLoadingMore(prev => ({ ...prev, [listKey]: false }));
    }
  }, [
    loadingMore,
    hasMore,
    paginationState,
    searchQuery,
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
    sortBy,
    handleMoviesUpdate
  ]);

  // Define loadInitialMovies before toggleSection
  const loadInitialMovies = useCallback(async (listKey) => {
    setLoadingMore(prev => ({ ...prev, [listKey]: true }));
    
    try {
      let firstPageResponse;
      let secondPageResponse;

      const loadPage = async (page) => {
        if (listKey === 'search-results') {
          return await movieApi.searchMovies(searchQuery, page);
        } else if (listKey === 'filtered-results') {
          return await movieApi.getFilteredMovies(page, {
            yearRange,
            ratingRange,
            popularityRange,
            genres: selectedGenres,
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
          });
        } else {
          const [type, id] = listKey.split('-');
          if (type === 'default') {
            switch (id) {
              case 'popular':
                return await movieApi.getPopularMovies(page);
              case 'top_rated':
                return await movieApi.getTopRatedMovies(page);
              case 'upcoming':
                return await movieApi.getUpcomingMovies(page);
              case 'now_playing':
                return await movieApi.getNowPlayingMovies(page);
              default:
                throw new Error(`Invalid default list type: ${id}`);
            }
          } else if (type === 'filter') {
            return await movieApi.getFilterSettingMovies(id, page);
          } else {
            return await movieApi.getListMovies(id, page);
          }
        }
      };

      // Load first two pages in parallel
      [firstPageResponse, secondPageResponse] = await Promise.all([
        loadPage(1),
        loadPage(2)
      ]);

      if (firstPageResponse) {
        // Ensure unique movies across both pages
        const allMovies = [...firstPageResponse.results];
        const firstPageIds = new Set(allMovies.map(movie => movie.id));
        
        // Only add movies from second page that aren't in first page
        if (secondPageResponse?.results) {
          const uniqueSecondPageMovies = secondPageResponse.results.filter(
            movie => !firstPageIds.has(movie.id)
          );
          allMovies.push(...uniqueSecondPageMovies);
        }

        if (listKey === 'search-results') {
          setSearchResults(allMovies);
        } else {
          handleMoviesUpdate(listKey, allMovies, firstPageResponse.total_pages);
        }

        setPaginationState(prev => ({
          ...prev,
          [listKey]: {
            page: 2,
            totalPages: firstPageResponse.total_pages
          }
        }));

        const hasMorePages = 2 < firstPageResponse.total_pages;
        setHasMore(prev => ({
          ...prev,
          [listKey]: hasMorePages
        }));
      }
    } catch (error) {
      console.error('Error loading initial movies:', error);
      toast.error('Failed to load movies');
      setHasMore(prev => ({
        ...prev,
        [listKey]: false
      }));
    } finally {
      setLoadingMore(prev => ({ ...prev, [listKey]: false }));
    }
  }, [
    searchQuery,
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
    sortBy,
    handleMoviesUpdate
  ]);

  // Then define toggleSection with loadInitialMovies in its dependencies
  const toggleSection = useCallback((sectionId) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
        // Load initial movies when section is opened
        if (!listMovies[sectionId]) {
          loadInitialMovies(sectionId);
        }
      }
      return newSet;
    });
  }, [listMovies, loadInitialMovies]);

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
  }, [location.pathname]);

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

  // Initialize hasMore state when lists are loaded
  useEffect(() => {
    const initialHasMore = {};
    const initialPagination = {};
    const initialLoadingMore = {};
    
    homepageLists.forEach(list => {
      const listKey = `${list.type}-${list.id}`;
      initialHasMore[listKey] = true;
      initialPagination[listKey] = { page: 1 };
      initialLoadingMore[listKey] = false;
    });

    // Also initialize for filtered results if filters are active
    if (hasActiveFilters) {
      initialHasMore['filtered-results'] = true;
      initialPagination['filtered-results'] = { page: 1 };
      initialLoadingMore['filtered-results'] = false;
    }

    setHasMore(prev => ({ ...prev, ...initialHasMore }));
    setPaginationState(prev => ({ ...prev, ...initialPagination }));
    setLoadingMore(prev => ({ ...prev, ...initialLoadingMore }));
  }, [homepageLists, hasActiveFilters]);

  // Intersection Observer hook
  const useIntersectionObserver = (ref, callback, enabled = true) => {
    useEffect(() => {
      if (!enabled || !ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [callback, enabled, ref]);
  };

  // Set up observers for each list type
  useIntersectionObserver(
    searchObserverRef,
    () => handleLoadMore('search-results'),
    hasMore['search-results'] && !loadingMore['search-results']
  );

  useIntersectionObserver(
    filteredObserverRef,
    () => handleLoadMore('filtered-results'),
    hasMore['filtered-results'] && !loadingMore['filtered-results']
  );

  // Reset movies when filters change
  useEffect(() => {
    setListMovies({});
  }, [
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

  // Set up observers for dynamic lists
  useEffect(() => {
    const observers = {};
    
    homepageLists.forEach((list) => {
      const listKey = `${list.type}-${list.id}`;
      const element = listObserverRefs.current[listKey];
      
      if (element && hasMore[listKey] && !loadingMore[listKey]) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              handleLoadMore(listKey);
            }
          },
          { 
            root: element.parentElement,
            threshold: 0.1,
            rootMargin: '100px'
          }
        );
        
        const sentinel = element.querySelector('.sentinel-element');
        if (sentinel) {
          observer.observe(sentinel);
          observers[listKey] = observer;
        }
      }
    });
    
    return () => {
      Object.values(observers).forEach(observer => observer.disconnect());
    };
  }, [homepageLists, hasMore, loadingMore, handleLoadMore]);

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
                {/* View mode and compact toggles removed but preserved in comments for future use */}
                {/* 
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
                )} */}
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
                  onClose={() => setIsFiltersOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Movie Lists - Add padding to account for fixed header height */}
      <div className={`w-full ${
        isSearchOpen ? 'pt-36 pb-24' : 'pt-24 pb-24'
      } px-2 md:px-8`}>
        <AnimatePresence mode="wait">
          {searchResults !== null ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              <motion.div
                className="w-full bg-white border border-[#ECEFF1] rounded-lg overflow-hidden"
                initial={false}
              >
                <button
                  onClick={() => toggleSection('search-results')}
                  className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-300"
                >
                  <div>
                    <h2 className={`${variants.header.title.base} relative flex items-stretch !mb-1 !pl-4`}>
                      <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#996515]"></span>
                      <span>Search Results for "{searchQuery}"</span>
                    </h2>
                    <p className="pl-4 text-base font-medium text-[#4A4A4A]">
                      Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                    </p>
                  </div>
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${
                      openSections.has('search-results') ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence initial={false}>
                  {openSections.has('search-results') && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden bg-gray-100"
                    >
                      <div className="relative">
                        {/* Add top shadow overlay */}
                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-300/50 to-transparent z-10" />
                        
                        {/* Add bottom shadow overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-300/50 to-transparent z-10" />
                        
                        <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto
                                            scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent
                                            hover:scrollbar-thumb-gray-600
                                            bg-gradient-to-b from-gray-100 to-gray-50
                                            shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]">
                          <MovieList
                            key={`search-results-${searchQuery}`}
                            movies={searchResults}
                            excludedLists={excludedLists}
                            viewMode={viewMode}
                            isCompact={isCompact}
                            isMobile={isMobile}
                          />
                          {hasMore['search-results'] && (
                            <div 
                              ref={searchObserverRef}
                              className="w-full py-4 flex justify-center"
                            >
                              {loadingMore['search-results'] ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              ) : (
                                <div className="h-8" /> /* Sentinel element */
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="homepage-lists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full"
            >
              {/* Show filtered results section when filters are active */}
              {hasActiveFilters ? (
                <motion.div
                  className="w-full bg-white border-y border-[#ECEFF1]"
                  initial={false}
                >
                  <button
                    onClick={() => toggleSection('filtered-results')}
                    className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-300"
                  >
                    <div>
                      <h2 className={`${variants.header.title.base} relative flex items-stretch !mb-1 !pl-4`}>
                        <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#996515]"></span>
                        <span>Filtered Results</span>
                      </h2>
                      <p className="pl-4 text-base font-medium text-[#4A4A4A]">
                        Movies matching your selected filters
                      </p>
                    </div>
                    <svg
                      className={`w-6 h-6 transform transition-transform duration-300 ${
                        openSections.has('filtered-results') ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {openSections.has('filtered-results') && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-gray-100"
                      >
                        <div className="relative">
                          {/* Add top shadow overlay */}
                          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-300/50 to-transparent z-10" />
                          
                          {/* Add bottom shadow overlay */}
                          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-300/50 to-transparent z-10" />
                          
                          <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto
                                              scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent
                                              hover:scrollbar-thumb-gray-600
                                              bg-gradient-to-b from-gray-100 to-gray-50
                                              shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]">
                            <MovieList
                              key={`filtered-results-${key}`}
                              type="filtered"
                              movies={listMovies['filtered-results']}
                              yearRange={yearRange}
                              ratingRange={ratingRange}
                              popularityRange={popularityRange}
                              selectedGenres={selectedGenres}
                              excludedLists={excludedLists}
                              viewMode={viewMode}
                              isCompact={isCompact}
                              isMobile={isMobile}
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
                              onLoadMore={() => handleLoadMore('filtered-results')}
                              hasMore={hasMore['filtered-results']}
                              isLoadingMore={loadingMore['filtered-results']}
                            />
                            {hasMore['filtered-results'] && (
                              <div 
                                ref={filteredObserverRef}
                                className="w-full py-4 flex justify-center"
                              >
                                {loadingMore['filtered-results'] ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                ) : (
                                  <div className="sentinel-element h-8" /> /* Sentinel element with class for observer */
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
                    <div className="divide-y divide-[#ECEFF1]">
                      {homepageLists.map((list) => (
                        <motion.div
                          key={`${list.type}-${list.id}`}
                          className="w-full bg-white first:rounded-t-lg last:rounded-b-lg"
                          initial={false}
                        >
                          <button
                            onClick={() => toggleSection(`${list.type}-${list.id}`)}
                            className="w-full px-8 py-6 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-300"
                          >
                            <div>
                              <h2 className={`${variants.header.title.base} relative flex items-stretch !mb-1 !pl-4`}>
                                <span className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#996515]"></span>
                                <span>{list.name}</span>
                              </h2>
                              <p className="pl-4 text-base font-medium text-[#4A4A4A]">
                                {list.description}
                              </p>
                            </div>
                            <svg
                              className={`w-6 h-6 transform transition-transform duration-300 ${
                                openSections.has(`${list.type}-${list.id}`) ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <AnimatePresence initial={false}>
                            {openSections.has(`${list.type}-${list.id}`) && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden bg-gray-100"
                              >
                                <div className="relative">
                                  {/* Add top shadow overlay */}
                                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-300/50 to-transparent z-10" />
                                  
                                  {/* Add bottom shadow overlay */}
                                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-300/50 to-transparent z-10" />
                                  
                                  <div className="p-4 md:p-8 max-h-[70vh] overflow-y-auto
                                              scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent
                                              hover:scrollbar-thumb-gray-600
                                              bg-gradient-to-b from-gray-100 to-gray-50
                                              shadow-[inset_0_0_8px_rgba(0,0,0,0.1)]">
                                    <MovieList
                                      key={`${list.type}-${list.id}-${key}`}
                                      type={list.type}
                                      listId={list.id}
                                      movies={listMovies[`${list.type}-${list.id}`]}
                                      yearRange={yearRange}
                                      ratingRange={ratingRange}
                                      popularityRange={popularityRange}
                                      selectedGenres={selectedGenres}
                                      excludedLists={excludedLists}
                                      viewMode={viewMode}
                                      isCompact={isCompact}
                                      isMobile={isMobile}
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
                                      onLoadMore={() => handleLoadMore(`${list.type}-${list.id}`)}
                                      hasMore={hasMore[`${list.type}-${list.id}`]}
                                      isLoadingMore={loadingMore[`${list.type}-${list.id}`]}
                                    />
                                    {hasMore[`${list.type}-${list.id}`] && (
                                      <div 
                                        ref={el => listObserverRefs.current[`${list.type}-${list.id}`] = el}
                                        className="w-full py-4 flex justify-center"
                                      >
                                        {loadingMore[`${list.type}-${list.id}`] ? (
                                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        ) : (
                                          <div className="sentinel-element h-8" /> /* Sentinel element with class for observer */
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
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
      <AnimatePresence>
        {isHomepageManagerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={variants.modal.backdrop}
          >
            <div className={variants.modal.container.base}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`${variants.modal.content.base} max-w-2xl w-full`}
              >
                <HomepageFilterManager 
                  onClose={() => setIsHomepageManagerOpen(false)}
                  loadHomepageLists={loadHomepageLists}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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