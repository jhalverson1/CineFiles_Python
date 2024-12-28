import React, { useEffect, useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import EyeIcon from '../common/EyeIcon';

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
      className={`bg-black/75 rounded-md p-1.5 transition-colors
        ${isWatched 
          ? 'text-green-400 hover:text-green-300' 
          : 'text-white/50 hover:text-white/75'
        } ${(isUpdating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
    >
      <EyeIcon />
    </button>
  );
};

export default WatchedToggle; 