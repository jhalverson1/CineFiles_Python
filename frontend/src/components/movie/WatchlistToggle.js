import React, { useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const BookmarkIcon = ({ className = "w-5 h-5" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
  </svg>
);

const WatchlistToggle = ({ movieId, isCompact = false, onToggle }) => {
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
      is_watched: isWatched,
      in_watchlist: !isInWatchlist
    });
    
    try {
      const response = await listsApi.toggleWatchlist(movieId.toString());
      // Update with actual server response
      updateListStatus(movieId, response);
      onToggle?.(movieId);
    } catch (error) {
      console.error('Error toggling watchlist status:', error);
      // Revert to previous state on error
      updateListStatus(movieId, {
        is_watched: previousStatus.isWatched,
        in_watchlist: previousStatus.isInWatchlist
      });
      toast.error('Failed to update watchlist status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${isCompact ? 'p-1' : 'p-1.5'} bg-black/75 rounded-md transition-colors
        ${isInWatchlist 
          ? 'text-yellow-400 hover:text-yellow-300' 
          : 'text-white/50 hover:text-white/75'
        } ${isLoading ? 'opacity-50' : ''}`}
      aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      whileTap={!isLoading ? { scale: 0.9 } : {}}
      whileHover={!isLoading ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <svg className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
      </svg>
    </motion.button>
  );
};

export default WatchlistToggle; 