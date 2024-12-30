import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLists } from '../../contexts/ListsContext';
import { removeMovieFromList } from '../../utils/api';
import toast from 'react-hot-toast';

const AddToListButton = ({ movieId, isCompact = false }) => {
  const { lists, addToList, loading, refreshLists } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredLists = lists.filter(list => !list.is_default);

  const isMovieInList = (list) => {
    return list.items?.some(item => item.movie_id === movieId.toString());
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleListClick = async (e, list) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isMovieInList(list)) {
        await removeMovieFromList(list.id, movieId);
        await refreshLists();
        setIsOpen(false);
        toast('Removed from ' + list.name, {
          icon: '×',
          style: {
            background: '#7f1d1d',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      } else {
        const data = {
          movie_id: String(movieId),
          notes: ''
        };
        await addToList(list.id, data);
        setIsOpen(false);
        toast.success(`Added to ${list.name}`, {
          icon: '✓',
          style: {
            background: '#065f46',
            color: '#fff',
            borderRadius: '8px',
          }
        });
      }
    } catch (err) {
      console.error('Error updating list:', err);
      toast.error('Failed to update list', {
        style: {
          background: '#7f1d1d',
          color: '#fff',
          borderRadius: '8px',
        }
      });
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`${isCompact ? 'p-1' : 'p-1.5'} bg-black/75 rounded-md text-white/50 hover:text-white/75 transition-colors`}
        disabled={loading}
        aria-label="Add to list"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'}`}
        >
          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-50 w-48 rounded-lg shadow-lg bg-zinc-900 ring-1 ring-white/10"
          style={{
            top: buttonRef.current?.getBoundingClientRect().bottom + 4,
            left: buttonRef.current?.getBoundingClientRect().left,
          }}
        >
          <div className="py-1">
            {filteredLists.length === 0 ? (
              <div className="px-4 py-2 text-sm text-zinc-400">No lists available</div>
            ) : (
              filteredLists.map((list) => (
                <button
                  key={list.id}
                  onClick={(e) => handleListClick(e, list)}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <div className="flex items-center justify-between">
                    <span>{list.name}</span>
                    {isMovieInList(list) && (
                      <svg 
                        className="w-4 h-4 text-green-500" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AddToListButton; 