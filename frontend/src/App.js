import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchBar from './SearchBar';
import MovieList from './MovieList';
import MovieDetails from './MovieDetails';

function App() {
  const [movies, setMovies] = useState([]);

  return (
    <Router>
      <div className="App" style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
        <h1>Movie Search</h1>
        <Routes>
          <Route path="/" element={
            <>
              <SearchBar onResults={setMovies} />
              <MovieList movies={movies} />
            </>
          } />
          <Route path="/movies/:id" element={<MovieDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
