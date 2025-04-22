import React, { Component } from 'react';
import GoogleAuthContext from '../contexts/GoogleAuthContext.js';

class GoogleAuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: null
    };
    
    // Initialize Google API client ID
    this.clientId = props.clientId;
  }

  componentDidMount() {
    // Load the Google Sign-In API script
    this.loadGoogleScript();
  }

  loadGoogleScript = () => {
    if (document.getElementById('google-auth-script')) {
      this.initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-auth-script';
    script.async = true;
    script.defer = true;
    script.onload = this.initializeGoogleSignIn;
    script.onerror = () => {
      this.setState({
        error: new Error('Failed to load Google Sign-In API script'),
        isLoaded: false
      });
    };

    document.body.appendChild(script);
  };

  initializeGoogleSignIn = () => {
    if (window.google && this.clientId) {
      this.setState({ isLoaded: true });
    } else {
      this.setState({
        error: new Error('Google Sign-In API not available'),
        isLoaded: false
      });
    }
  };

  render() {
    const { children } = this.props;
    const { isLoaded } = this.state;

    // Context value includes loading state and clientId
    const contextValue = {
      clientId: this.clientId,
      isLoaded
    };

    return (
      <GoogleAuthContext.Provider value={contextValue}>
        {children}
      </GoogleAuthContext.Provider>
    );
  }
}

export default GoogleAuthProvider; 