import React, { useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import EyeIcon from '../common/EyeIcon';
import { motion } from 'framer-motion';

const WatchedToggle = ({ movieId, isCompact = false, onToggle }) => {
  const { lists, updateListStatus } = useLists();
  const [isLoading, setIsLoading] = useState(false);

  const watchedList = lists?.find(list => list.name === 'Watched');
  const watchlist = lists?.find(list => list.name === 'Watchlist');
  const isWatched = watchedList?.items?.some(item => item.movie_id === movieId.toString());
  const isInWatchlist = watchlist?.items?.some(item => item.movie_id === movieId.toString());

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistically update UI
    const previousStatus = { isWatched, isInWatchlist };
    updateListStatus(movieId, {
      is_watched: !isWatched,
      in_watchlist: isWatched ? isInWatchlist : false // Remove from watchlist if marking as watched
    });
    
    try {
      const response = await listsApi.toggleWatched(movieId.toString());
      // Update with actual server response
      updateListStatus(movieId, response);
      onToggle?.(movieId);
    } catch (error) {
      console.error('Error toggling watched status:', error);
      // Revert to previous state on error
      updateListStatus(movieId, {
        is_watched: previousStatus.isWatched,
        in_watchlist: previousStatus.isInWatchlist
      });
      toast.error('Failed to update watched status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${isCompact ? 'p-1' : 'p-1.5'} bg-black/75 rounded-md transition-colors
        ${isWatched 
          ? 'text-green-400 hover:text-green-300' 
          : 'text-white/50 hover:text-white/75'
        } ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
      whileTap={!isLoading ? { scale: 0.9 } : {}}
      whileHover={!isLoading ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        animate={{ 
          rotate: isWatched ? 360 : 0,
          scale: isWatched ? 1.1 : 1
        }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 10
        }}
      >
        <EyeIcon className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
      </motion.div>
    </motion.button>
  );
};

export default WatchedToggle; 