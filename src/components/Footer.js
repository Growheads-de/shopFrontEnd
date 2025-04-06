import React, { Component } from 'react';
import { Box, Typography, Container } from '@mui/material';

class Footer extends Component {
  render() {
    return (
      <Box 
        component="footer" 
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'primary.dark',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2">
              © {new Date().getFullYear()}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default Footer; 