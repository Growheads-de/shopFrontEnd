import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

// Add font-face declaration at the top of the file
const fontFaceStyle = `
  @font-face {
    font-family: 'SwashingtonCP';
    src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
  }
`;

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Inject the font-face style */}
      <style>{fontFaceStyle}</style>

      <Box sx={{ width: '100%', paddingTop: '17.09%', position: 'relative' }}>
        <img 
          src="/assets/images/claim.jpg" 
          style={{ 
            width: '100%', 
            height: '100%', 
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover'
          }}
        />
      </Box>

      <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
        {/* Seeds Category Box */}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ p:2, width: '50%' }}>
          <Paper
            component={Link}
            to="/category/689"
            sx={{
              p: 0,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              boxShadow: 10,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 20
              }
            }}
          >
            {/* Image Container - Place your seeds image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#e1f0d3',
              backgroundImage: 'url("/assets/images/seeds.jpg")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* Overlay text - optional */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(27, 94, 32, 0.8)',
                p: 2,
              }}>
                <Typography sx={{ fontSize: '2rem', color: 'white', fontFamily: 'SwashingtonCP' }}>
                  Seeds
                </Typography>
              </Box>
            </Box>

          </Paper>
        </Grid>

        {/* Cutlings Category Box */}
        <Grid size={{ xs: 12, sm: 6 }} sx={{ p:2,width: '50%' }}>
          <Paper
            component={Link}
            to="/category/706"
            sx={{
              p: 0,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 10,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 20
              }
            }}
          >
            {/* Image Container - Place your cutlings image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#e8f5d6',
              backgroundImage: 'url("/assets/images/cutlings.jpg")',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative'
            }}>
              {/* Overlay text - optional */}
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'rgba(27, 94, 32, 0.8)',
                p: 2,
              }}>
                <Typography sx={{ fontSize: '2rem', color: 'white', fontFamily: 'SwashingtonCP' }}>
                  Stecklinge
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
