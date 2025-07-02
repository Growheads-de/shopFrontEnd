import React, { Component } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { Logo, CategoryList } from './components/header/index.js';

class PrerenderProfile extends Component {
  render() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          mb: 0,
          pb: 0,
          bgcolor: 'background.default'
        }}
      >
        <AppBar
          position="sticky"
          color="primary"
          elevation={0}
          sx={{ zIndex: 1100 }}
        >
          <Toolbar sx={{ minHeight: 64 }}>
            <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
              <Logo />
            </Container>
          </Toolbar>
          <CategoryList categoryId={209} activeCategoryId={null} />
        </AppBar>
      </Box>
    );
  }
}

export default PrerenderProfile; 