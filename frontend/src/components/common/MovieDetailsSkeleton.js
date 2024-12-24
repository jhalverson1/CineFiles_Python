import React from 'react';

function MovieDetailsSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto p-5 min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Poster Skeleton */}
        <div className="w-[300px] h-[450px] bg-white/10 rounded-lg animate-pulse"></div>

        {/* Info Skeleton */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Title */}
          <div className="h-10 w-[70%] bg-white/10 rounded animate-pulse"></div>
          
          {/* Director */}
          <div className="h-5 w-[40%] bg-white/10 rounded animate-pulse"></div>
          
          {/* Metadata */}
          <div className="h-5 w-[30%] bg-white/10 rounded animate-pulse"></div>
          
          {/* Overview */}
          <div className="mt-5 space-y-2.5">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-[90%] bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-[80%] bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailsSkeleton; 