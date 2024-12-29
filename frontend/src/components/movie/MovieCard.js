import React, { useMemo } from 'react';
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

const BookmarkIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-8 h-8"
  >
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const MovieCard = ({ movie, isCompact = false }) => {
  const { lists, loading } = useLists();

  const isInWatchlist = useMemo(() => {
    if (!lists || loading) return false;
    const watchlist = lists.find(list => list.name === "Watchlist");
    return watchlist?.items?.some(item => item.movie_id === movie.id.toString()) || false;
  }, [lists, movie.id, loading]);

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
          <div className="absolute top-0 right-0 z-20 w-16 h-16 flex items-start justify-end p-2" onClick={e => e.preventDefault()}>
            <WatchedToggle movieId={movie.id} isCompact={isCompact} />
          </div>

          {/* Watchlist Bookmark */}
          {isInWatchlist && (
            <div className="absolute top-0 right-0 text-red-500 drop-shadow-lg transform -translate-y-2 translate-x-2 z-30 pointer-events-none">
              <BookmarkIcon />
            </div>
          )}

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
              <span className="text-xs text-zinc-400">
                {new Date(movie.release_date).getFullYear()}
              </span>
            ) : (
              <span className="text-xs text-zinc-400">—</span>
            )}
            {movie.vote_average > 0 && (
              <div className="flex items-center space-x-1 text-zinc-400">
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