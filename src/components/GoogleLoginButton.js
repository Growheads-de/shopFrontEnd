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
      promptShown: false,
      isPrompting: false  // @note Added to prevent multiple simultaneous prompts
    };
    this.promptTimeout = null;  // @note Added to track timeout
    this.prevContextLoaded = false;  // @note Track previous context loaded state
  }

  componentDidMount() {
    // Check if Google libraries are already available
    const hasGoogleLoaded = window.google && window.google.accounts && window.google.accounts.id;
    const contextLoaded = this.context && this.context.isLoaded;
    
    // @note Initialize the tracked context loaded state
    this.prevContextLoaded = contextLoaded;
    
    // @note Only initialize immediately if context is already loaded, otherwise let componentDidUpdate handle it
    if (hasGoogleLoaded && this.context.clientId && contextLoaded) {
      this.initializeGoogleSignIn();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Initialize when all conditions are met and we haven't initialized before
    const hasGoogleLoaded = window.google && window.google.accounts && window.google.accounts.id;
    const contextLoaded = this.context && this.context.isLoaded;
    
    // @note Only initialize when context becomes loaded for the first time
    if (!this.state.isInitialized && 
        !this.state.isInitializing && 
        hasGoogleLoaded && 
        this.context.clientId &&
        contextLoaded && 
        !this.prevContextLoaded) {
      this.initializeGoogleSignIn();
    }
    
    // @note Update the tracked context loaded state
    this.prevContextLoaded = contextLoaded;

    // Auto-prompt if initialization is complete and autoInitiate is true
    if (this.props.autoInitiate && 
        this.state.isInitialized && 
        !this.state.promptShown && 
        !this.state.isPrompting &&  // @note Added check to prevent multiple prompts
        (!prevState.isInitialized || !prevProps.autoInitiate)) {
      this.setState({ promptShown: true });
      this.schedulePrompt(100);
    }
  }

  componentWillUnmount() {
    // @note Clear timeout on unmount to prevent memory leaks
    if (this.promptTimeout) {
      clearTimeout(this.promptTimeout);
    }
  }

  schedulePrompt = (delay = 0) => {
    // @note Clear any existing timeout
    if (this.promptTimeout) {
      clearTimeout(this.promptTimeout);
    }
    
    this.promptTimeout = setTimeout(() => {
      this.tryPrompt();
    }, delay);
  };

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
        if (this.props.autoInitiate && !this.state.promptShown && !this.state.isPrompting) {
          this.setState({ promptShown: true });
          this.schedulePrompt(100);
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
    console.log('cred',response);
    const { onSuccess, onError } = this.props;
    
    // @note Reset prompting state when response is received
    this.setState({ isPrompting: false });
    
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
    // @note Prevent multiple clicks while prompting
    if (this.state.isPrompting) {
      return;
    }
    
    // If not initialized yet, try initializing first
    if (!this.state.isInitialized && !this.state.isInitializing) {
      this.initializeGoogleSignIn();
      // Add a small delay before attempting to prompt
      this.schedulePrompt(300);
      return;
    }
    
    this.tryPrompt();
  };
  
  tryPrompt = () => {
    // @note Prevent multiple simultaneous prompts
    if (this.state.isPrompting) {
      return;
    }
    
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In API not loaded');
      return;
    }

    try {
      this.setState({ isPrompting: true });
      window.google.accounts.id.prompt();
      this.setState({ promptShown: true });
      console.log('Google Sign-In prompt displayed');
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      this.setState({ isPrompting: false });
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
  };

  render() {
    const { disabled, style, className, text = 'Mit Google anmelden' } = this.props;
    const { isInitializing, isPrompting } = this.state;
    const isLoading = isInitializing || isPrompting || (this.context && !this.context.isLoaded);

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