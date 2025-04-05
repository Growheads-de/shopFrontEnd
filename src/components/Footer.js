import React, { Component } from 'react';
import { Box, Typography, Container, Link, Grid } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

class Footer extends Component {
  render() {
    return (
      <Box 
        component="footer" 
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          backgroundColor: 'primary.dark',
          color: 'white',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} justifyContent="space-between">
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalFloristIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  Green Essentials
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Your one-stop shop for premium products.
              </Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Quick Links
              </Typography>
              <Box component="nav">
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Products
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  About Us
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Contact
                </Link>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Legal
              </Typography>
              <Box component="nav">
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Terms of Service
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Privacy Policy
                </Link>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ pt: 4, textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Green Essentials. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default Footer; 