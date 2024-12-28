import React, { useEffect, useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';

const WatchedToggle = ({ movieId }) => {
  const { lists, loading, refreshLists } = useLists();
  const [isWatched, setIsWatched] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!lists || loading) return;
    
    const watchedList = lists.find(list => list.name === "Watched");
    if (watchedList) {
      const isInWatchedList = watchedList.items.some(item => item.movie_id === movieId.toString());
      setIsWatched(isInWatchedList);
    }
  }, [lists, movieId, loading]);

  const handleToggleWatched = async () => {
    if (isUpdating || loading) return;
    
    try {
      setIsUpdating(true);
      const newWatchedState = !isWatched;
      setIsWatched(newWatchedState); // Optimistic update
      
      const response = await listsApi.toggleWatched(movieId);
      await refreshLists();
      
      if (response.is_watched !== newWatchedState) {
        setIsWatched(response.is_watched); // Revert if server state differs
      }
    } catch (err) {
      console.error('Failed to toggle watched status:', err);
      setIsWatched(!isWatched); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleToggleWatched}
      disabled={loading || isUpdating}
      className={`w-full text-left px-3 py-1.5 text-xs text-white hover:bg-zinc-700/50 transition-colors
        ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
    >
      <div className="flex items-center">
        <span className="mr-2">
          {isWatched ? (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </span>
        {isWatched ? 'Watched' : 'Mark Watched'}
      </div>
    </button>
  );
};

export default WatchedToggle; 