import React, { useState, useEffect } from 'react';

function LazyImage({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (!src) {
      setError(true);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setLoaded(true);
    };

    img.onerror = () => {
      setError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const renderPlaceholder = () => (
    <div className={`bg-white/5 flex items-center justify-center ${className}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );

  if (error || !src) {
    return renderPlaceholder();
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-white/5 flex items-center justify-center">
          <div className="w-[30px] h-[30px] border-2 border-white/10 border-t-primary rounded-full animate-spin-slow" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`block w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}

export default LazyImage; 