import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-5">
      <div className="w-10 h-10 border-4 border-white/10 border-t-primary rounded-full animate-spin-slow"></div>
    </div>
  );
}

export default LoadingSpinner;