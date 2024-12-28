import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import WatchedToggle from './WatchedToggle';

const StarIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-3.5 h-3.5"
  >
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

const EllipsisIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-4 h-4"
  >
    <path fillRule="evenodd" d="M4.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm6 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" clipRule="evenodd" />
  </svg>
);

const MovieCard = ({ movie }) => {
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-[180px] group">
      {/* Rating Badge */}
      <div className="absolute top-2 left-2 z-20 flex items-center bg-black/75 rounded-md px-2 py-1">
        <div className="flex items-center text-yellow-400 text-xs">
          <StarIcon />
          <span className="ml-0.5">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      {/* Actions Menu */}
      <div className="absolute top-2 right-2 z-20">
        <div className="relative">
          <button 
            ref={buttonRef}
            onClick={() => setShowActions(!showActions)}
            className="bg-black/75 rounded-md p-1.5 text-white hover:text-gray-300 transition-colors"
            aria-label="Show actions"
          >
            <EllipsisIcon />
          </button>
          
          {showActions && (
            <div 
              ref={menuRef}
              className="absolute top-0 right-0 translate-x-1 -translate-y-full mt-1 w-36 bg-zinc-800/95 rounded-md shadow-lg overflow-hidden backdrop-blur-sm"
            >
              <WatchedToggle movieId={movie.id} />
            </div>
          )}
        </div>
      </div>
      
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-zinc-900 rounded-lg overflow-hidden relative z-10"
      >
        <div className="aspect-[2/3] relative">
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium truncate text-sm">{movie.title}</h3>
          <p className="text-gray-400 text-xs">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 