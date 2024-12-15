import React from 'react';

function MovieList({ movies }) {
  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {movies.map(movie => (
        <li key={movie.id} style={{ margin: '10px 0' }}>
          <h3>{movie.title}</h3>
          <p>{movie.overview}</p>
        </li>
      ))}
    </ul>
  );
}

export default MovieList;