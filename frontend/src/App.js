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
import { Toaster } from 'react-hot-toast';
import MovieDetails from './components/movie/MovieDetails';
import HomePage from './components/movie/HomePage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import SearchResults from './components/movie/SearchResults';
import MyLists from './components/movie/MyLists';
import Navbar from './components/common/Navbar';
import './styles/App.css';
import { ListsProvider } from './contexts/ListsContext';

function App() {
  return (
    <Router>
      <ListsProvider>
        <div className="app min-h-screen bg-[#001810] relative">
          <div className="absolute inset-0 bg-felt-texture bg-felt opacity-50 pointer-events-none z-0" />
          <div className="relative z-10">
            <Navbar />
            <main className="w-full">
              <Routes>
                <Route exact path="/" element={<HomePage />} />
                <Route path="/movies/:id" element={<MovieDetails />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/my-lists" element={<MyLists />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#27272A',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                duration: 2000,
              }}
            />
          </div>
        </div>
      </ListsProvider>
    </Router>
  );
}

export default App;
