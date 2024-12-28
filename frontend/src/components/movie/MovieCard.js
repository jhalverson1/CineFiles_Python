import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import EyeIcon from '../common/EyeIcon';

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
  const { lists, loading, refreshLists } = useLists();
  const [isWatched, setIsWatched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!lists || loading) return;
    
    const watchedList = lists.find(list => list.name === "Watched");
    if (watchedList) {
      const isInWatchedList = watchedList.items.some(item => item.movie_id === movie.id.toString());
      setIsWatched(isInWatchedList);
    }
  }, [lists, movie.id, loading]);

  const handleToggleWatched = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the eye icon
    if (isUpdating || loading) return;
    
    try {
      setIsUpdating(true);
      const newWatchedState = !isWatched;
      setIsWatched(newWatchedState); // Optimistic update
      
      const response = await listsApi.toggleWatched(movie.id);
      await refreshLists();
      
      if (response.is_watched !== newWatchedState) {
        setIsWatched(response.is_watched); // Revert if server state differs
      }

      if (newWatchedState) {
        toast.success('Watched', {
          icon: '✓',
          style: {
            background: '#065f46',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      } else {
        toast('Unwatched', {
          icon: '×',
          style: {
            background: '#7f1d1d',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle watched status:', err);
      setIsWatched(!isWatched); // Revert on error
      toast.error('Update failed', {
        style: {
          background: '#7f1d1d',
          color: '#fff',
          borderRadius: '8px',
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative ${isCompact ? 'w-[120px]' : 'w-[180px]'} group`}>
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-zinc-900 rounded-lg overflow-hidden relative z-10 h-full"
      >
        <div className="aspect-[2/3] relative">
          {/* Rating Badge */}
          <div className={`absolute top-2 left-2 z-20 flex items-center bg-black/75 rounded-md px-1.5 ${isCompact ? 'py-0.5' : 'py-1'}`}>
            <div className="flex items-center text-yellow-400 text-xs">
              <StarIcon />
              <span className="ml-0.5">{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
            </div>
          </div>

          {/* Eye Icon Button */}
          <button 
            onClick={handleToggleWatched}
            disabled={isUpdating || loading}
            className={`absolute top-2 right-2 z-20 bg-black/75 rounded-md ${isCompact ? 'p-1' : 'p-1'} transition-colors
              ${isWatched 
                ? 'text-green-400 hover:text-green-300' 
                : 'text-white/50 hover:text-white/75'
              } ${(isUpdating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
          >
            <EyeIcon className={isCompact ? 'w-5 h-5' : 'w-5 h-5'} />
          </button>

          <img
            src={getImageUrl(movie.poster_path, isCompact ? 'w342' : 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>
        <div className={`${isCompact ? 'p-2' : 'p-3'} space-y-0.5`}>
          <div className="flex items-baseline gap-1.5">
            <h3 className={`text-white font-medium truncate flex-1 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {movie.title}
            </h3>
            <span className={`text-zinc-500 shrink-0 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 