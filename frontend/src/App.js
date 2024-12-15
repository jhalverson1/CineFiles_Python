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
  const [movies, setMovies] = useState([]);

  return (
    <Router>
      <div style={styles.app}>
        <Routes>
          <Route path="/" element={
            <div style={styles.homeContainer}>
              <h1 style={styles.title}>CineFiles</h1>
              <SearchBar onResults={setMovies} />
              <MovieList movies={movies} />
            </div>
          } />
          <Route path="/movies/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#141414',
    color: '#fff',
  },
  homeContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #1a1a1a 0%, #0a0a0a 100%)',
  },
  title: {
    textAlign: 'center',
    padding: '40px 0 20px',
    margin: 0,
    fontSize: '2.5em',
    fontWeight: '600',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
};

export default App;
