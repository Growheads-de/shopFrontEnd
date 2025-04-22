import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container sx={{ display: 'flex', flexDirection: 'row' }}>
        {/* Seeds Category Box */}
        <Grid item xs={12} sm={6} sx={{ p:2, width: '50%' }}>
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
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            {/* Image Container - Place your seeds image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#f2e8d4',
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
                bgcolor: 'rgba(0,0,0,0.5)',
                p: 2,
              }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                  Seeds
                </Typography>
              </Box>
            </Box>

          </Paper>
        </Grid>

        {/* Cutlings Category Box */}
        <Grid item xs={12} sm={6} sx={{ p:2,width: '50%' }}>
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
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            {/* Image Container - Place your cutlings image here */}
            <Box sx={{
              height: '100%',
              bgcolor: '#f2e8d4',
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
                bgcolor: 'rgba(0,0,0,0.5)',
                p: 2,
              }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
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
