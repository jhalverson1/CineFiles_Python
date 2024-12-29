import React, { useState, useRef, useEffect } from 'react';
import { useLists } from '../../contexts/ListsContext';
import toast from 'react-hot-toast';

const AddToListButton = ({ movieId, isCompact = false }) => {
  const { lists, addToList, loading } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const filteredLists = lists.filter(list => list.name !== "Watched");

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
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    setIsOpen(!isOpen);
  };

  const handleAddToList = async (e, listId, listName) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    try {
      const data = {
        movie_id: String(movieId),
        notes: ''
      };
      await addToList(listId, data);
      setIsOpen(false);
      toast.success(`Added to ${listName}`, {
        icon: '✓',
        style: {
          background: '#065f46',
          color: '#fff',
          borderRadius: '8px',
        }
      });
    } catch (err) {
      console.error('Error adding to list:', err);
      toast.error('Failed to add to list', {
        style: {
          background: '#7f1d1d',
          color: '#fff',
          borderRadius: '8px',
        }
      });
    }
  };

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
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

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed z-50 w-48 rounded-lg shadow-lg bg-zinc-900 ring-1 ring-white/10"
          style={{
            bottom: buttonRef.current ? window.innerHeight - buttonRef.current.getBoundingClientRect().top + 4 : 0,
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left - 20 : 0,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="py-1" role="menu">
            {filteredLists.length === 0 ? (
              <div className="px-4 py-2 text-sm text-zinc-400">No lists available</div>
            ) : (
              filteredLists.map((list) => (
                <button
                  key={list.id}
                  onClick={(e) => handleAddToList(e, list.id, list.name)}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  role="menuitem"
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
        </div>
      )}
    </div>
  );
};

export default AddToListButton; 