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
import { classes } from './utils/theme';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className={classes.pageContainer}>
          <Navbar />
          <main className={classes.pageContainer}>
            <AppRoutes />
          </main>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#000',
                color: '#fff',
                border: '1px solid #333'
              }
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
