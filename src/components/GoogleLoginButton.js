import React, { Component } from 'react';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import GoogleAuthContext from '../contexts/GoogleAuthContext.js';

class GoogleLoginButton extends Component {
  static contextType = GoogleAuthContext;

  constructor(props) {
    super(props);
    this.state = {
      isInitialized: false
    };
  }

  componentDidMount() {
    // Check if Google libraries are available
    if (window.google && this.context.clientId) {
      this.initializeGoogleSignIn();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Initialize when Google libraries become available
    if (!prevState.isInitialized && window.google && this.context.clientId) {
      this.initializeGoogleSignIn();
    }
  }

  initializeGoogleSignIn = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In API not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.context.clientId,
      callback: this.handleCredentialResponse,
    });

    this.setState({ isInitialized: true });
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
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error('Google Sign-In API not loaded');
      return;
    }

    try {
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error prompting Google Sign-In:', error);
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
  };

  render() {
    const { disabled, style, className, text = 'Sign in with Google' } = this.props;

    return (
      <Button
        variant="contained"
        startIcon={<GoogleIcon />}
        onClick={this.handleClick}
        disabled={disabled || !this.state.isInitialized}
        style={{ backgroundColor: '#4285F4', color: 'white', ...style }}
        className={className}
      >
        {text}
      </Button>
    );
  }
}

export default GoogleLoginButton; 