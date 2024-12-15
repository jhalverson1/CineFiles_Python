/**
 * MovieList component that displays a list of movies from search results.
 * Each movie item is clickable and navigates to its details page.
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.movies - Array of movie objects to display
 */
import React from 'react';
import { Link } from 'react-router-dom';

function MovieList({ movies }) {
  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {movies.map(movie => (
        <li key={movie.id} style={{ margin: '10px 0' }}>
          <Link to={`/movies/${movie.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h3>{movie.title}</h3>
            <p>{movie.overview}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default MovieList;