import React, { useEffect, useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const WatchlistToggle = ({ movieId, isCompact = false }) => {
  const { lists, loading, refreshLists } = useLists();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!lists || loading) return;
    
    const watchlist = lists.find(list => list.name === "Watchlist");
    if (watchlist) {
      const isInWatchlist = watchlist.items.some(item => item.movie_id === movieId.toString());
      setInWatchlist(isInWatchlist);
    }
  }, [lists, movieId, loading]);

  const handleToggleWatchlist = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (isUpdating || loading) return;
    
    try {
      setIsUpdating(true);
      const newWatchlistState = !inWatchlist;
      setInWatchlist(newWatchlistState); // Optimistic update
      
      await listsApi.toggleWatchlist(movieId);
      await refreshLists();
      
      if (newWatchlistState) {
        toast.success('Added to Watchlist', {
          icon: '✓',
          style: {
            background: '#065f46',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      } else {
        toast('Removed from Watchlist', {
          icon: '×',
          style: {
            background: '#7f1d1d',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle watchlist status:', err);
      setInWatchlist(!inWatchlist); // Revert on error
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
    <motion.button
      onClick={handleToggleWatchlist}
      disabled={loading || isUpdating}
      className={`${isCompact ? 'p-1' : 'p-1.5'} bg-black/75 rounded-md transition-colors
        ${inWatchlist 
          ? 'text-red-500 hover:text-red-400' 
          : 'text-white/50 hover:text-white/75'
        } ${(isUpdating || loading) ? 'opacity-50' : ''}`}
      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      whileTap={!(loading || isUpdating) ? { scale: 0.9 } : {}}
      whileHover={!(loading || isUpdating) ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        animate={{ 
          scale: inWatchlist ? 1.1 : 1,
          y: inWatchlist ? -2 : 0
        }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 10
        }}
      >
        <BookmarkIcon className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
      </motion.div>
    </motion.button>
  );
};

export default WatchlistToggle; 