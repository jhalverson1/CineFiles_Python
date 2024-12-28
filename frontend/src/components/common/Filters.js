import React from 'react';

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

const Filters = ({ hideWatched, setHideWatched }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${
          isOpen 
            ? 'bg-background-active text-primary' 
            : 'bg-background-secondary text-text-disabled hover:text-primary'
        }`}
        aria-label="Toggle filters"
      >
        <FilterIcon />
      </button>
      
      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-64 p-3 bg-background-secondary rounded-lg shadow-lg border border-border">
          <button
            onClick={() => setHideWatched(!hideWatched)}
            className="flex items-center gap-2 focus:outline-none group w-full"
            role="checkbox"
            aria-checked={hideWatched}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              hideWatched 
                ? 'bg-primary border-primary/80' 
                : 'border-text-disabled group-hover:border-text-secondary'
            }`}>
              {hideWatched && (
                <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-primary font-medium group-hover:text-text-secondary">
              Hide Watched Movies
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters; 