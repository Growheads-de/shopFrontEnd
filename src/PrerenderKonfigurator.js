import React, { Component } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  AppBar,
  Toolbar
} from '@mui/material';
import { Logo } from './components/header/index.js';

class PrerenderKonfigurator extends Component {
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
        </AppBar>
        
        <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              🌱 Growbox Konfigurator
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Stelle dein perfektes Indoor Grow Setup zusammen
            </Typography>
            
            {/* Bundle Discount Information */}
            <Paper 
              elevation={1} 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#f8f9fa', 
                border: '1px solid #e9ecef',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2 }}>
                🎯 Bundle-Rabatt sichern!
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    15%
                  </Typography>
                  <Typography variant="body2">
                    ab 3 Produkten
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#ed6c02', fontWeight: 'bold' }}>
                    24%
                  </Typography>
                  <Typography variant="body2">
                    ab 5 Produkten
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    36%
                  </Typography>
                  <Typography variant="body2">
                    ab 7 Produkten
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
                Je mehr Produkte du auswählst, desto mehr sparst du!
              </Typography>
            </Paper>
          </Box>

          {/* Section 1 Header - Only show the title and subtitle */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              1. Growbox-Form auswählen
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Wähle zuerst die Grundfläche deiner Growbox aus
            </Typography>
          </Box>
          </Paper>
        </Container>
      </Box>
    );
  }
}

export default PrerenderKonfigurator; 