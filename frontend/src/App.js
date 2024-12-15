/**
 * Main application component that sets up routing and manages the movie search functionality.
 * Uses React Router for navigation between search results and movie details.
 * 
 * Routes:
 * - "/" : Home page with search functionality and results
 * - "/movies/:id" : Individual movie details page
 */
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MovieDetails from './components/movie/MovieDetails';
import HomePage from './components/movie/HomePage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
