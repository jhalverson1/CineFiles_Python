import React, { useState, useRef, useEffect } from 'react';
import { useLists } from '../../contexts/ListsContext';
import { AnimatePresence, motion } from 'framer-motion';

const ChevronDownIcon = ({ className = "w-1 h-1" }) => (
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

const FilterDropdown = ({ label, isOpen, setIsOpen, children }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-w-[120px] h-8 px-3 
                 text-text-primary/90 bg-background-tertiary/40 rounded-lg
                 hover:bg-background-tertiary/60 focus:outline-none focus:ring-2
                 focus:ring-primary/30 transition-all duration-200 border border-border/10
                 hover:border-border/20 shadow-sm backdrop-blur-sm"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium truncate">{label}</span>
        <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] w-64 mt-2 bg-background-secondary/95 backdrop-blur-md
                      border border-border/50 rounded-xl shadow-lg overflow-hidden
                      ring-1 ring-black/5"
            style={{
              top: '100%',
              left: '0',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RangeSelect = ({ value, onChange, options, formatter = (v) => v }) => (
  <select
    value={value}
    onChange={onChange}
    className="flex-1 h-9 px-3 text-sm bg-background-tertiary/30 text-text-primary 
             rounded-lg border border-border/10 hover:border-border/20
             focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
             cursor-pointer backdrop-blur-sm"
  >
    {options.map(opt => (
      <option key={opt} value={opt}>{formatter(opt)}</option>
    ))}
  </select>
);

const Filters = ({ 
  excludedLists, 
  setExcludedLists,
  yearRange,
  setYearRange,
  ratingRange,
  setRatingRange,
  popularityRange,
  setPopularityRange,
  onApplyFilters
}) => {
  const { lists } = useLists();
  const [isListOpen, setIsListOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isPopularityOpen, setIsPopularityOpen] = useState(false);
  
  // Default filter values
  const defaultFilters = {
    excludedLists: [],
    yearRange: null,
    ratingRange: null,
    popularityRange: null
  };
  
  // Local state for filter values
  const [localExcludedLists, setLocalExcludedLists] = useState(excludedLists);
  const [localYearRange, setLocalYearRange] = useState(yearRange);
  const [localRatingRange, setLocalRatingRange] = useState(ratingRange);
  const [localPopularityRange, setLocalPopularityRange] = useState(popularityRange);
  
  // Update local state when props change
  useEffect(() => {
    setLocalExcludedLists(excludedLists);
    setLocalYearRange(yearRange);
    setLocalRatingRange(ratingRange);
    setLocalPopularityRange(popularityRange);
  }, [excludedLists, yearRange, ratingRange, popularityRange]);

  const handleListToggle = (listId) => {
    setLocalExcludedLists(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else {
        return [...prev, listId];
      }
    });
  };

  const handleApplyFilters = () => {
    setExcludedLists(localExcludedLists);
    setYearRange(localYearRange);
    setRatingRange(localRatingRange);
    setPopularityRange(localPopularityRange);
    onApplyFilters?.();
  };

  const handleResetFilters = () => {
    // Update local state
    setLocalExcludedLists(defaultFilters.excludedLists);
    setLocalYearRange(defaultFilters.yearRange);
    setLocalRatingRange(defaultFilters.ratingRange);
    setLocalPopularityRange(defaultFilters.popularityRange);
    
    // Update parent state
    setExcludedLists(defaultFilters.excludedLists);
    setYearRange(defaultFilters.yearRange);
    setRatingRange(defaultFilters.ratingRange);
    setPopularityRange(defaultFilters.popularityRange);
    
    // Close all dropdowns
    setIsListOpen(false);
    setIsYearOpen(false);
    setIsRatingOpen(false);
    setIsPopularityOpen(false);
    
    onApplyFilters?.();
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const ratingOptions = Array.from({ length: 11 }, (_, i) => i);
  const popularityOptions = [0, 100, 500, 1000, 5000, 10000, 50000, 100000, 1000000];

  const hasChanges = 
    JSON.stringify(localExcludedLists) !== JSON.stringify(excludedLists) ||
    JSON.stringify(localYearRange) !== JSON.stringify(yearRange) ||
    JSON.stringify(localRatingRange) !== JSON.stringify(ratingRange) ||
    JSON.stringify(localPopularityRange) !== JSON.stringify(popularityRange);

  const hasActiveFilters = 
    excludedLists?.length > 0 ||
    yearRange !== null ||
    ratingRange !== null ||
    popularityRange !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex-1 flex flex-wrap gap-2">
        <FilterDropdown 
          label={localExcludedLists.length === 0 ? "Exclude Lists" : `${localExcludedLists.length} Lists`}
          isOpen={isListOpen}
          setIsOpen={setIsListOpen}
        >
          <div className="py-1">
            {lists.map(list => (
              <div
                key={list.id}
                className="flex items-center px-4 py-2 hover:bg-background-active/50 cursor-pointer
                         transition-colors duration-200 group"
                onClick={() => handleListToggle(list.id)}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center 
                              transition-colors mr-3 ${
                  localExcludedLists.includes(list.id)
                    ? 'bg-primary border-primary/80'
                    : 'border-text-disabled/30 group-hover:border-text-disabled/50'
                }`}>
                  {localExcludedLists.includes(list.id) && (
                    <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-text-primary group-hover:text-text-primary/90">
                  {list.name}
                  <span className="ml-2 text-xs text-text-secondary px-2 py-0.5 rounded-full bg-background-tertiary/30">
                    {list.items?.length || 0}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={localYearRange ? `${localYearRange[0]}-${localYearRange[1]}` : "Year"}
          isOpen={isYearOpen}
          setIsOpen={setIsYearOpen}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <RangeSelect
                value={localYearRange?.[0] || currentYear}
                onChange={(e) => setLocalYearRange([parseInt(e.target.value), localYearRange?.[1] || currentYear])}
                options={yearOptions}
              />
              <span className="text-sm text-text-secondary font-medium">to</span>
              <RangeSelect
                value={localYearRange?.[1] || currentYear}
                onChange={(e) => setLocalYearRange([localYearRange?.[0] || 1900, parseInt(e.target.value)])}
                options={yearOptions}
              />
            </div>
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={localRatingRange ? `${localRatingRange[0]}-${localRatingRange[1]}★` : "Rating"}
          isOpen={isRatingOpen}
          setIsOpen={setIsRatingOpen}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <RangeSelect
                value={localRatingRange?.[0] || 0}
                onChange={(e) => setLocalRatingRange([parseFloat(e.target.value), localRatingRange?.[1] || 10])}
                options={ratingOptions}
              />
              <span className="text-sm text-text-secondary font-medium">to</span>
              <RangeSelect
                value={localRatingRange?.[1] || 10}
                onChange={(e) => setLocalRatingRange([localRatingRange?.[0] || 0, parseFloat(e.target.value)])}
                options={ratingOptions}
              />
            </div>
          </div>
        </FilterDropdown>

        <FilterDropdown
          label={localPopularityRange ? `${localPopularityRange[0]/1000}k-${localPopularityRange[1]/1000}k` : "Popularity"}
          isOpen={isPopularityOpen}
          setIsOpen={setIsPopularityOpen}
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <RangeSelect
                value={localPopularityRange?.[0] || 0}
                onChange={(e) => setLocalPopularityRange([parseInt(e.target.value), localPopularityRange?.[1] || 1000000])}
                options={popularityOptions}
                formatter={(v) => v.toLocaleString()}
              />
              <span className="text-sm text-text-secondary font-medium">to</span>
              <RangeSelect
                value={localPopularityRange?.[1] || 1000000}
                onChange={(e) => setLocalPopularityRange([localPopularityRange?.[0] || 0, parseInt(e.target.value)])}
                options={popularityOptions}
                formatter={(v) => v.toLocaleString()}
              />
            </div>
          </div>
        </FilterDropdown>
      </div>

      <div className="flex items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="h-8 px-3 rounded-lg font-medium text-sm transition-all duration-200
                     flex items-center gap-2 bg-background-tertiary/40 text-text-primary/80
                     hover:bg-background-tertiary/60 hover:text-text-primary border border-border/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}
        
        <button
          onClick={handleApplyFilters}
          disabled={!hasChanges}
          className={`h-8 px-4 rounded-lg font-medium text-sm transition-all duration-200
                     flex items-center gap-2 ${
            hasChanges
              ? 'bg-primary hover:bg-primary/90 text-white'
              : 'bg-background-tertiary/40 text-text-disabled cursor-not-allowed'
          }`}
        >
          Apply Filters
          {hasChanges && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Filters; 