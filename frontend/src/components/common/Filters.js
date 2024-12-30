import React, { useState, useRef, useEffect } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { AnimatePresence, motion } from 'framer-motion';

const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Filters = ({ excludedLists, setExcludedLists }) => {
  const { lists } = useLists();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleListToggle = (listId) => {
    setExcludedLists(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-text-primary">Filters</h3>
      </div>
      
      <div className="space-y-3">
        {/* List Exclusion Filter */}
        <div className="relative w-64" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium
                     text-text-primary bg-background-tertiary rounded-lg
                     hover:bg-background-active focus:outline-none focus:ring-2
                     focus:ring-primary/20 transition-colors"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <span className="flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              {excludedLists.length === 0 ? (
                "Filter by Lists"
              ) : (
                `Excluding ${excludedLists.length} list${excludedLists.length === 1 ? '' : 's'}`
              )}
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="fixed z-[100] w-64 mt-2 bg-background-secondary border border-border
                          rounded-lg shadow-lg overflow-hidden"
                style={{
                  top: dropdownRef.current?.getBoundingClientRect().bottom ?? 0,
                  left: dropdownRef.current?.getBoundingClientRect().left ?? 0,
                }}
              >
                <div className="py-1 max-h-[300px] overflow-y-auto">
                  {lists.map(list => (
                    <div
                      key={list.id}
                      className="flex items-center px-4 py-2 hover:bg-background-active cursor-pointer"
                      onClick={() => handleListToggle(list.id)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors mr-3 ${
                        excludedLists.includes(list.id)
                          ? 'bg-primary border-primary/80'
                          : 'border-text-disabled'
                      }`}>
                        {excludedLists.includes(list.id) && (
                          <svg className="w-2.5 h-2.5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-text-primary">
                        {list.name}
                        <span className="ml-2 text-xs text-text-secondary">
                          ({list.items?.length || 0} movies)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Filters; 