import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import WatchedToggle from './WatchedToggle';
import WatchlistToggle from './WatchlistToggle';
import AddToListButton from './AddToListButton';
import { useLists } from '../../contexts/ListsContext';

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

const MovieCard = ({ 
  movie, 
  isCompact = false,
  onRemove = null,
  listId = null,
  onWatchedToggle = null,
  onWatchlistToggle = null
}) => {
  const navigate = useNavigate();
  const { lists } = useLists();

  // Check if this is a default list
  const currentList = lists?.find(list => list.id === listId);
  const isDefaultList = currentList?.is_default;

  return (
    <div className="relative w-full group">
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-background-secondary rounded-lg overflow-hidden relative z-10 h-full"
      >
        <div className="aspect-[2/3] relative">
          {/* Action Buttons Container with Animation */}
          <div className={`absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-2 gap-1 md:p-2 md:gap-2 ${!isCompact ? 'transition-all duration-300 ease-in-out group-hover:scale-125 sm:group-hover:scale-100' : ''}`}>
            {/* Left Button - Show Delete button for non-default lists only, otherwise show Add to List */}
            <div className={`flex-1 ${!isCompact ? 'transition-transform duration-300 group-hover:-translate-x-2 sm:group-hover:translate-x-0' : ''}`}>
              {onRemove && !isDefaultList ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(movie.id);
                  }}
                  className="p-1.5 rounded-full bg-black/75 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  aria-label="Remove from list"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : (
                <AddToListButton movieId={movie.id} isCompact={isCompact} dropdownPosition="top-right" />
              )}
            </div>
            {/* Right Buttons */}
            <div className="flex flex-1 justify-end gap-1 md:gap-2">
              <div className={`flex-1 flex justify-center ${!isCompact ? 'transition-transform duration-300 group-hover:-translate-x-3 sm:group-hover:translate-x-0' : ''}`}>
                <WatchedToggle 
                  movieId={movie.id} 
                  isCompact={isCompact}
                  onToggle={onWatchedToggle}
                />
              </div>
              <div className={`flex-1 flex justify-center ${!isCompact ? 'transition-transform duration-300 group-hover:translate-x-2 sm:group-hover:translate-x-0' : ''}`}>
                <WatchlistToggle 
                  movieId={movie.id} 
                  isCompact={isCompact}
                  onToggle={onWatchlistToggle}
                />
              </div>
            </div>
          </div>

          {/* Movie Poster */}
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Movie Title and Info */}
        <div className="p-2">
          <h3 className="text-sm font-medium text-white truncate">
            {movie.title}
          </h3>
          <div className="flex justify-between items-center mt-1">
            {movie.release_date ? (
              <span className="text-xs text-text-secondary">
                {new Date(movie.release_date).getFullYear()}
              </span>
            ) : (
              <span className="text-xs text-text-secondary">—</span>
            )}
            {movie.vote_average > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <StarIcon />
                <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 