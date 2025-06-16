import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import { BrowserRouter } from 'react-router-dom';


// Create a wrapper component with our class-based GoogleAuthProvider
// This avoids the "Invalid hook call" error from GoogleOAuthProvider
const AppWithProviders = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppWithProviders />);

