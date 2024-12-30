import React, { useEffect, useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import EyeIcon from '../common/EyeIcon';
import { motion, AnimatePresence } from 'framer-motion';

const WatchedToggle = ({ movieId, isCompact = false }) => {
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

  const handleToggleWatched = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
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
    <motion.button
      onClick={handleToggleWatched}
      disabled={loading || isUpdating}
      className={`${isCompact ? 'p-1' : 'p-1.5'} bg-black/75 rounded-md transition-colors
        ${isWatched 
          ? 'text-green-400 hover:text-green-300' 
          : 'text-white/50 hover:text-white/75'
        } ${(isUpdating || loading) ? 'opacity-50' : ''}`}
      aria-label={isWatched ? "Mark as unwatched" : "Mark as watched"}
      whileTap={!(loading || isUpdating) ? { scale: 0.9 } : {}}
      whileHover={!(loading || isUpdating) ? { scale: 1.05 } : {}}
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