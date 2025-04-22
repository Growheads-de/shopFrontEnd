import React, { Component } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import GoogleLoginButton from './GoogleLoginButton.js';

class GoogleAuthTest extends Component {
  handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);
    alert('Google login successful! Check console for details.');
  };

  handleGoogleError = (error) => {
    console.error('Google Login Failed:', error);
    alert('Google login failed!');
  };

  render() {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 500 }}>
          <Typography variant="h5" gutterBottom>
            Google OAuth Test
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Google Login Button:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLoginButton
                onSuccess={this.handleGoogleSuccess}
                onError={this.handleGoogleError}
                text="Sign in with Google"
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default GoogleAuthTest; 