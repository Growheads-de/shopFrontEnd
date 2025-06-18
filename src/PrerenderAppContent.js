import React from 'react';
import { Box, AppBar, Toolbar, Container} from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Footer from './components/Footer.js';
import { Logo, CategoryList } from './components/header/index.js';
import Home from './pages/Home.js';

const PrerenderAppContent = (socket) => (
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

 
<AppBar position="sticky" color="primary" elevation={0} sx={{ zIndex: 1100 }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
            {/* First row: Logo and ButtonGroup on xs, all items on larger screens */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              width: '100%',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              {/* Top row for xs, single row for larger screens */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                justifyContent: { xs: 'space-between', sm: 'flex-start' }
              }}>
                <Logo />              
              </Box>
            </Box>
          </Container>
        </Toolbar>
        <CategoryList categoryId={209} activeCategoryId={null} socket={socket}/>
      </AppBar>
 
      <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
      </Box>

      <Footer/>



    </Box>
);

export default PrerenderAppContent; 