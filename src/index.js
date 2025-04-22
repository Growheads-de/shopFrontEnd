import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import { BrowserRouter } from 'react-router-dom';
import GoogleAuthProvider from './providers/GoogleAuthProvider.js';

// Create a wrapper component with our class-based GoogleAuthProvider
// This avoids the "Invalid hook call" error from GoogleOAuthProvider
const AppWithProviders = () => {
  return (
    <React.StrictMode>
      <GoogleAuthProvider clientId="928121624463-jbgfdlgem22scs1k9c87ucg4ffvaik6o.apps.googleusercontent.com">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleAuthProvider>
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithProviders />);

