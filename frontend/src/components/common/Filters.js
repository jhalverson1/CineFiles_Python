import React from 'react';

const Filters = ({ hideWatched, setHideWatched }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="w-full max-w-md mx-auto bg-white/5 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-rose-100 hover:bg-white/5 transition-colors"
      >
        <span className="font-medium">Filters</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={() => setHideWatched(!hideWatched)}
            className="flex items-center gap-2 focus:outline-none group"
            role="checkbox"
            aria-checked={hideWatched}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${hideWatched ? 'bg-rose-500 border-rose-400' : 'border-gray-400 group-hover:border-gray-300'}`}>
              {hideWatched && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-rose-100 font-medium group-hover:text-rose-50">
              Hide Watched Movies
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters; 