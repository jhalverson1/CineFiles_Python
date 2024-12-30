/**
 * Main application component that sets up routing and manages the movie search functionality.
 * Uses React Router for navigation between search results and movie details.
 * 
 * Routes:
 * - "/" : Home page with search functionality and results
 * - "/movies/:id" : Individual movie details page
 */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './AppRoutes';
import Navbar from './components/common/Navbar';
import { Toaster } from 'react-hot-toast';
import { colorVariants } from './utils/theme';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-background-primary">
          <Navbar />
          <div className="min-h-screen bg-background-primary dot-texture text-text-primary">
            <AppRoutes />
          </div>
          <Toaster position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
