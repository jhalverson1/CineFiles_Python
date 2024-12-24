import React from 'react';

function NewsSection({ newsItems }) {
  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <div className="w-[95%] max-w-[1200px] mx-auto sm:w-[90%]">
      <h2 className="text-white text-lg font-semibold mb-2 pl-3 sm:pl-4 border-l-3 border-[#e50914] sm:text-xl">
        Latest from r/movies
      </h2>
      <div className="flex flex-col gap-1 px-3 pb-3 sm:gap-2 sm:px-4 sm:pb-4">
        {newsItems.map((item, index) => (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            key={index} 
            className="flex items-center gap-2 p-1.5 sm:gap-3 sm:p-2 bg-[rgba(32,32,32,0.8)] rounded hover:translate-x-[3px] hover:bg-[rgba(40,40,40,0.8)] transition-all duration-200 text-white no-underline"
          >
            {item.image && (
              <div className="flex-shrink-0 w-[60px] h-[35px] sm:w-[70px] sm:h-[40px] rounded overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium mb-0.5 text-white leading-tight truncate">
                {item.title}
              </h3>
              <p className="text-[#999] text-xs">
                {item.source}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default NewsSection; 