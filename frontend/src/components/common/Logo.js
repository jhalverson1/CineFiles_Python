import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img 
        src="/logo.png" 
        alt="CineFiles" 
        className="h-10 w-auto"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          imageRendering: 'crisp-edges',
          WebkitFontSmoothing: 'antialiased'
        }}
      />
      <span className="text-2xl font-bold text-[#A37E2C]">
        CineFiles
      </span>
    </Link>
  );
};

export default Logo; 