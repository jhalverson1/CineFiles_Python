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

const MovieList = ({ type, hideWatched }) => {
  const [allMovies, setAllMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const scrollContainerRef = useRef(null);
  const { lists, loading: listsLoading } = useLists();

  // Fetch movies only when type changes
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case 'popular':
            response = await movieApi.getPopularMovies();
            break;
          case 'top-rated':
            response = await movieApi.getTopRatedMovies();
            break;
          case 'upcoming':
            response = await movieApi.getUpcomingMovies();
            break;
          case 'news':
            response = await movieApi.getMovieNews();
            break;
          default:
            throw new Error('Invalid movie list type');
        }
        console.log(`Fetched ${type} movies:`, response);
        setAllMovies(response.results || []);
      } catch (err) {
        console.error(`Error fetching ${type} movies:`, err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [type]); // Only depend on type

  // Filter movies client-side when hideWatched or lists change
  const displayedMovies = useMemo(() => {
    if (!hideWatched || !lists) return allMovies;
    
    const watchedList = lists.find(list => list.name === "Watched");
    if (!watchedList) return allMovies;
    
    const watchedMovieIds = new Set(watchedList.items.map(item => item.movie_id));
    return allMovies.filter(movie => !watchedMovieIds.has(movie.id.toString()));
  }, [allMovies, hideWatched, lists]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftButton(scrollLeft > 0);
        setShowRightButton(scrollLeft + clientWidth < scrollWidth);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [displayedMovies]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading movies: {error}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Left scroll button */}
      {showLeftButton && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Right scroll button */}
      {showRightButton && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/80 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide relative"
      >
        <div className="flex gap-4 p-4">
          {isLoading
            ? Array(6).fill(null).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex-none w-[180px] bg-zinc-900 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-[2/3] bg-zinc-800" />
                  <div className="p-4">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-zinc-800 rounded w-1/2" />
                  </div>
                </div>
              ))
            : (
              <AnimatePresence mode="popLayout">
                {displayedMovies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    className="flex-none w-[180px]"
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.2 }
                    }}
                    layout
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
        </div>
      </div>
    </div>
  );
};

export default MovieList;