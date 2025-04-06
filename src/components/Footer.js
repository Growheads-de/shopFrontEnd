import React, { Component } from 'react';
import { Box, Typography, Container, Link } from '@mui/material';
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ width: { xs: '100%', sm: '33.33%' }, mb: { xs: 3, sm: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalFloristIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  GrowBNB
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Ihr One-Stop-Shop für Premium-Produkte.
              </Typography>
            </Box>
            <Box sx={{ width: { xs: '50%', sm: '33.33%' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Schnelllinks
              </Typography>
              <Box component="nav">
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Produkte
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Über uns
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Kontakt
                </Link>
              </Box>
            </Box>
            <Box sx={{ width: { xs: '50%', sm: '33.33%' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                Rechtliches
              </Typography>
              <Box component="nav">
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Nutzungsbedingungen
                </Link>
                <Link href="#" color="inherit" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                  Datenschutzrichtlinie
                </Link>
              </Box>
            </Box>
          </Box>
          <Box sx={{ pt: 4, textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} GrowBNB. Alle Rechte vorbehalten.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }
}

export default Footer; 