import React, { Component } from 'react';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import GoogleAuthContext from '../contexts/GoogleAuthContext.js';

class GoogleLoginButton extends Component {
  static contextType = GoogleAuthContext;

  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false,
      isInitializing: false,
      promptShown: false
    };
  }

  componentDidMount() {
    // Check if Google libraries are already available
    if (window.google && window.google.accounts && window.google.accounts.id && this.context.clientId) {
      this.initializeGoogleSignIn();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Initialize when Google libraries become available
    const hasGoogleLoaded = window.google && window.google.accounts && window.google.accounts.id;
    
    if (!prevState.isInitialized && !this.state.isInitializing && hasGoogleLoaded && this.context.clientId) {
      this.initializeGoogleSignIn();
    }
    
    // Check for context changes (like isLoaded becoming true)
    if (!prevState.isInitialized && this.context.isLoaded) {
      this.initializeGoogleSignIn();
    }

    // Auto-prompt if initialization is complete and autoInitiate is true
    if (this.props.autoInitiate && 
        this.state.isInitialized && 
        !this.state.promptShown && 
        (!prevState.isInitialized || !prevProps.autoInitiate)) {
      this.setState({ promptShown: true });
      setTimeout(() => {
        this.tryPrompt();
      }, 100);
    }
  }

  initializeGoogleSignIn = () => {
    // Avoid multiple initialization attempts
    if (this.state.isInitialized || this.state.isInitializing) {
      return;
    }
    
    this.setState({ isInitializing: true });

    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In API not loaded yet');
      this.setState({ isInitializing: false });
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: this.context.clientId,
        callback: this.handleCredentialResponse,
      });
      
      this.setState({ 
        isInitialized: true,
        isInitializing: false 
      }, () => {
        // Auto-prompt immediately if autoInitiate is true
        if (this.props.autoInitiate && !this.state.promptShown) {
          this.setState({ promptShown: true });
          setTimeout(() => {
            this.tryPrompt();
          }, 100);
        }
      });
      
      console.log('Google Sign-In initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Sign-In:', error);
      this.setState({ 
        isInitializing: false 
      });
      
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
  };

  handleCredentialResponse = (response) => {
    const { onSuccess, onError } = this.props;
    
    if (response && response.credential) {
      // Call onSuccess with the credential
      if (onSuccess) {
        onSuccess(response);
      }
    } else {
      // Call onError if something went wrong
      if (onError) {
        onError(new Error('Failed to get credential from Google'));
      }
    }
  };

  handleClick = () => {
    // If not initialized yet, try initializing first
    if (!this.state.isInitialized && !this.state.isInitializing) {
      this.initializeGoogleSignIn();
      // Add a small delay before attempting to prompt
      setTimeout(() => {
        if (this.state.isInitialized) {
          this.tryPrompt();
        }
      }, 300);
      return;
    }
    
    this.tryPrompt();
  };
  
  tryPrompt = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In API not loaded');
      return;
    }

    try {
      window.google.accounts.id.prompt();
      this.setState({ promptShown: true });
      console.log('Google Sign-In prompt displayed');
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
  };

  render() {
    const { disabled, style, className, text = 'Mit Google anmelden' } = this.props;
    const { isInitializing } = this.state;
    const isLoading = isInitializing || (this.context && !this.context.isLoaded);

    return (
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={this.handleClick}
        disabled={disabled || isLoading}
        style={{ backgroundColor: '#4285F4', color: 'white', ...style }}
        className={className}
      >
        {isLoading ? 'Loading...' : text}
      </Button>
    );
  }
}

export default GoogleLoginButton; 