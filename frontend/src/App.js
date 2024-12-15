/**
 * Main application component that sets up routing and manages the movie search functionality.
 * Uses React Router for navigation between search results and movie details.
 * 
 * Routes:
 * - "/" : Home page with search functionality and results
 * - "/movies/:id" : Individual movie details page
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import MovieDetails from './MovieDetails';

function App() {
  // State to store the list of movies returned from search
  const [movies, setMovies] = useState([]);

  return (
    <Router>
      <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
        <Routes>
          {/* Home route with search functionality */}
          <Route path="/" element={
            <>
              <h1>Movie Search</h1>
              <SearchBar onResults={setMovies} />
              <MovieList movies={movies} />
            </>
          } />
          {/* Movie details route with dynamic ID parameter */}
          <Route path="/movies/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
