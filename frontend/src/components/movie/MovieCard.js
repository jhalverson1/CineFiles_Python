import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import { useLists } from '../../contexts/ListsContext';
import WatchedToggle from './WatchedToggle';
import AddToListButton from './AddToListButton';

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

const MovieCard = ({ movie, isCompact = false }) => {
  const { lists, loading } = useLists();

  return (
    <div className={`relative ${isCompact ? 'w-[120px]' : 'w-[180px]'} group`}>
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-zinc-900 rounded-lg overflow-hidden relative z-10 h-full"
      >
        <div className="aspect-[2/3] relative">
          {/* Action Buttons */}
          <div className="absolute top-2 left-2 z-20">
            <AddToListButton movieId={movie.id} isCompact={isCompact} />
          </div>
          <div className="absolute top-2 right-2 z-20">
            <WatchedToggle movieId={movie.id} isCompact={isCompact} />
          </div>

          {/* Movie Poster */}
          <img
            src={getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/75 text-white rounded-md px-1.5 py-0.5 text-xs font-medium">
              <StarIcon />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Movie Title */}
        <div className="p-2">
          <h3 className="text-sm font-medium text-white line-clamp-2">
            {movie.title}
          </h3>
          {movie.release_date && (
            <p className="text-xs text-zinc-400 mt-1">
              {new Date(movie.release_date).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 