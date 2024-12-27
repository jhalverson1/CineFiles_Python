import React, { useState } from 'react';
import { useLists } from '../../contexts/ListsContext';

const AddToListButton = ({ movieId }) => {
  const { lists, addToList, loading } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleAddToList = async (listId) => {
    try {
      await addToList(listId, movieId);
      setIsOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to add movie to list');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={loading}
      >
        Add to List
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {error && (
              <div className="px-4 py-2 text-sm text-red-600">{error}</div>
            )}
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                {list.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToListButton; 