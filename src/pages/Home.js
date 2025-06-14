import React, { useState, useEffect, useContext } from 'react';
import { Container, Box, Typography, Paper, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import CategoryBoxGrid from '../components/CategoryBoxGrid.js';
import SocketContext from '../contexts/SocketContext.js';

// Add font-face declaration at the top of the file
const fontFaceStyle = `
  @font-face {
    font-family: 'SwashingtonCP';
    src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
  }
`;

const Home = () => {
  const [rootCategories, setRootCategories] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Helper to process and set categories
    const processCategoryTree = (categoryTree) => {
      if (categoryTree && categoryTree.id === 209 && Array.isArray(categoryTree.children)) {
        setRootCategories(categoryTree.children);
      } else {
        setRootCategories([]);
      }
    };

    // Try cache first
    if (window.productCache && window.productCache['categoryTree_209']) {
      const cached = window.productCache['categoryTree_209'];
      const cacheAge = Date.now() - cached.timestamp;
      const tenMinutes = 10 * 60 * 1000;
      if (cacheAge < tenMinutes && cached.categoryTree) {
        processCategoryTree(cached.categoryTree);
        return;
      }
    }

    // Otherwise, fetch from socket if available
    if (socket) {
      socket.emit('categoryList', { categoryId: 209 }, (response) => {
        if (response && response.categoryTree) {
          // Store in cache
          try {
            if (!window.productCache) window.productCache = {};
            window.productCache['categoryTree_209'] = {
              categoryTree: response.categoryTree,
              timestamp: Date.now()
            };
          } catch (err) {
            console.error(err);
          }
          setRootCategories(response.categoryTree.children || []);
        }
      });
    }
  }, [socket]);

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
        <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 2, width: '50%' }}>
          <Paper
            component={Link}
            to="/category/689"
            sx={{
              p: 0,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: { xs: 250, sm: 400 },
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
        <Grid size={{ xs: 12, sm: 6 }} sx={{ p: 2, width: '50%' }}>
          <Paper
            component={Link}
            to="/category/706"
            sx={{
              p: 0,
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 2,
              overflow: 'hidden',
              height: { xs: 250, sm: 400 },
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

      {/* CategoryBoxGrid for root categories */}
      <Box sx={{ mt: 6 }}>
        <CategoryBoxGrid categories={rootCategories.filter(cat => cat.id !== 689 && cat.id !== 706)} title="Kategorien" />
      </Box>
    </Container>
  );
};

export default Home;
