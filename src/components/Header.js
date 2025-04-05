import React, { Component } from 'react';
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

class Header extends Component {
  render() {
    return (
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LocalFloristIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Green Essentials
            </Typography>
          </Box>
          <Button 
            color="inherit" 
            startIcon={<ShoppingCartIcon />}
            sx={{ 
              borderRadius: 2,
              fontWeight: 'bold',
              border: '1px solid rgba(255,255,255,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cart
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header; 