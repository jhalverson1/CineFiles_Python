import React, { useState } from 'react';
import { useLists } from '../../contexts/ListsContext';
import toast from 'react-hot-toast';

const AddToListButton = ({ movieId, isCompact = false }) => {
  const { lists, addToList, loading } = useLists();
  const [isOpen, setIsOpen] = useState(false);

  const filteredLists = lists.filter(list => list.name !== "Watched");

  const handleButtonClick = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    setIsOpen(!isOpen);
  };

  const handleAddToList = async (e, listId, listName) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Stop event bubbling
    
    try {
      // Ensure movieId is a string and send it in the correct format
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
          className="absolute z-20 mt-2 w-48 rounded-lg shadow-lg bg-zinc-900 ring-1 ring-white/10"
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
                  {list.name}
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