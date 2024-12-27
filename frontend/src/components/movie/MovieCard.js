import React from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/image';
import WatchedToggle from './WatchedToggle';

const MovieCard = ({ movie }) => {
  return (
    <div className="relative w-[180px]">
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
        <div className="bg-black/50 rounded-full px-1.5 py-0.5 text-white text-xs">
          {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </div>
        <div className="bg-black/50 rounded-full p-0.5">
          <WatchedToggle movieId={movie.id} />
        </div>
      </div>
      <Link 
        to={`/movies/${movie.id}`}
        className="block bg-zinc-900 rounded-lg overflow-hidden relative z-10"
      >
        <div className="aspect-[2/3] relative">
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="text-white font-medium truncate text-sm">{movie.title}</h3>
          <p className="text-gray-400 text-xs">
            {new Date(movie.release_date).getFullYear()}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard; 