import React, { useEffect, useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { listsApi } from '../../utils/listsApi';
import toast from 'react-hot-toast';
import BookmarkIcon from '../common/BookmarkIcon';

const WatchlistToggle = ({ movieId }) => {
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
    e.preventDefault(); // Prevent navigation when clicking the bookmark icon
    if (isUpdating || loading) return;
    
    try {
      setIsUpdating(true);
      const newWatchlistState = !inWatchlist;
      setInWatchlist(newWatchlistState); // Optimistic update
      
      const response = await listsApi.toggleWatchlist(movieId);
      await refreshLists();
      
      if (response.in_watchlist !== newWatchlistState) {
        setInWatchlist(response.in_watchlist); // Revert if server state differs
      }
      
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
    <button
      onClick={handleToggleWatchlist}
      disabled={loading || isUpdating}
      className={`bg-black/75 rounded-md p-1.5 transition-colors
        ${inWatchlist 
          ? 'text-yellow-400 hover:text-yellow-300' 
          : 'text-white/50 hover:text-white/75'
        } ${(isUpdating || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <BookmarkIcon />
    </button>
  );
};

export default WatchlistToggle; 