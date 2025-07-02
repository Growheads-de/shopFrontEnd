import React, { Component } from 'react';
import GoogleAuthContext from '../contexts/GoogleAuthContext.js';

class GoogleAuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: null,
      loadingStarted: false
    };
    
    // Initialize Google API client ID
    this.clientId = props.clientId;
  }

  componentDidMount() {
    // Load the Google Sign-In API script
    this.loadGoogleScript();
  }

  loadGoogleScript = () => {
    // Prevent multiple load attempts
    if (this.state.loadingStarted) {
      return;
    }
    
    this.setState({ loadingStarted: true });
    
    // Check if the script is already loaded
    if (window.google && window.google.accounts && window.google.accounts.id) {
      this.setState({ isLoaded: true });
      return;
    }
    
    if (document.getElementById('google-auth-script')) {
      // Script tag exists but may not be fully loaded yet
      const checkGoogleLoaded = setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          this.setState({ isLoaded: true });
          clearInterval(checkGoogleLoaded);
        }
      }, 100);
      
      // Set a timeout to stop checking after a reasonable time
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (!this.state.isLoaded) {
          this.setState({
            error: new Error('Timeout waiting for Google Sign-In API to load'),
            isLoaded: false
          });
        }
      }, 10000); // 10 second timeout
      
      return;
    }

    // Create and add the script tag
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-auth-script';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Give a small delay to ensure the API is fully initialized
      setTimeout(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          this.setState({ isLoaded: true });
        } else {
          this.setState({
            error: new Error('Google Sign-In API loaded but not initialized properly'),
            isLoaded: false
          });
        }
      }, 100);
    };
    
    script.onerror = () => {
      this.setState({
        error: new Error('Failed to load Google Sign-In API script'),
        isLoaded: false
      });
    };

    document.body.appendChild(script);
  };

  render() {
    const { children } = this.props;
    const { isLoaded, error } = this.state;

    // Context value includes loading state, clientId and any errors
    const contextValue = {
      clientId: this.clientId,
      isLoaded,
      error
    };

    return (
      <GoogleAuthContext.Provider value={contextValue}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }
}

export default GoogleAuthProvider; 