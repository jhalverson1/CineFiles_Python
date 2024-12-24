/**
 * MovieList component that displays a horizontally scrollable list of movies.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LazyImage({ src, alt, className = '', placeholderColor = '#2a2a2a' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => setIsLoaded(true);
            img.onerror = () => setIsError(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [src]);

  const showPlaceholder = !src || (!isLoaded && !isError);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {showPlaceholder && (
        <div className="absolute inset-0 bg-[#2a2a2a] flex items-center justify-center animate-pulse">
          <svg
            className="w-10 h-10 stroke-white/20"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
      )}
      {src && (isLoaded || isError) && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />
      )}
      {isError && (
        <div className="absolute inset-0 bg-[#3a3a3a] flex items-center justify-center text-white/60 text-sm text-center p-4">
          No Image Available
        </div>
      )}
    </div>
  );
}

function MovieList({ movies = [], title, isLoading = true }) {
  const scrollContainerRef = useRef(null);
  const [showRightButton, setShowRightButton] = useState(false);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };

    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowRightButton(scrollLeft + clientWidth < scrollWidth - 10);
        setShowLeftButton(scrollLeft > 10);
      }
    };

    window.addEventListener('resize', handleResize);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = isDesktop ? 600 : 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const movieArray = Array.isArray(movies) ? movies : [];
  const placeholderArray = Array(8).fill().map((_, index) => ({ id: `placeholder-${index}` }));
  const displayArray = isLoading ? placeholderArray : movieArray;

  if (!isLoading && !movieArray.length) {
    return (
      <div className="text-center py-10 text-white/70 text-lg">
        <p>No movies found...</p>
      </div>
    );
  }

  return (
    <div className="relative max-w-[1200px] mx-auto flex items-stretch">
      {isDesktop && (
        <div 
          className={`w-[30px] flex items-center justify-center bg-gradient-to-r from-purple-600/10 to-transparent ${!showLeftButton && 'pointer-events-none'}`}
          onMouseEnter={() => setIsHoveringLeft(true)}
          onMouseLeave={() => setIsHoveringLeft(false)}
          onClick={() => showLeftButton && handleScroll('left')}
        >
          {showLeftButton && (
            <div className={`flex items-center justify-center w-[30px] h-[40px] bg-purple-600/20 backdrop-blur rounded cursor-pointer transition-opacity duration-200 ${isHoveringLeft ? 'opacity-100' : 'opacity-0'}`}>
              <svg
                className="w-6 h-6 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
          )}
        </div>
      )}
      <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-none py-1.5 sm:py-2.5">
        <div className="flex gap-2.5 py-1.5 sm:gap-4 sm:py-2.5">
          {displayArray.map((movie, index) => (
            <div 
              key={movie.id}
              className="flex-shrink-0 w-[140px] sm:w-[200px] bg-[rgba(32,32,32,0.8)] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {movie.id.toString().startsWith('placeholder') ? (
                <>
                  <div className="relative aspect-[2/3]">
                    <LazyImage
                      src=""
                      alt="Loading..."
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 sm:p-2.5 bg-black/20">
                    <div className="h-4 w-4/5 rounded bg-white/10"></div>
                    <div className="h-3 w-2/5 rounded bg-white/10 mt-2"></div>
                  </div>
                </>
              ) : (
                <Link 
                  to={`/movies/${movie.id}`} 
                  className="block text-inherit no-underline"
                >
                  <div className="relative aspect-[2/3]">
                    <LazyImage
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 bg-black/75 text-yellow-400 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm backdrop-blur">
                        ★ {movie.vote_average.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 sm:p-2.5 bg-black/20">
                    <h3 className="m-0 mb-0.5 sm:mb-1 text-sm sm:text-base font-medium text-white truncate">
                      {movie.title}
                    </h3>
                    <p className="m-0 text-xs sm:text-sm text-gray-400">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
      {isDesktop && (
        <div 
          className={`w-[30px] flex items-center justify-center bg-gradient-to-l from-purple-600/10 to-transparent ${!showRightButton && 'pointer-events-none'}`}
          onMouseEnter={() => setIsHoveringRight(true)}
          onMouseLeave={() => setIsHoveringRight(false)}
          onClick={() => showRightButton && handleScroll('right')}
        >
          {showRightButton && (
            <div className={`flex items-center justify-center w-[30px] h-[40px] bg-purple-600/20 backdrop-blur rounded cursor-pointer transition-opacity duration-200 ${isHoveringRight ? 'opacity-100' : 'opacity-0'}`}>
              <svg
                className="w-6 h-6 stroke-current"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MovieList;