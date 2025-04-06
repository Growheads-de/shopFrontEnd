import React from 'react';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, bgcolor: 'rgba(46, 125, 50, 0.05)' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
          Welcome to Green Essentials
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
          Your one-stop shop for premium cannabis growing equipment
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 3 }}>
          At Green Essentials, we provide high-quality equipment and supplies for cultivating cannabis. 
          Whether you're a beginner or an experienced grower, we have everything you need to create 
          the perfect growing environment for your plants.
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          Browse our extensive selection of seeds, lights, hydroponic systems, nutrients, and 
          accessories. All our products are carefully selected to ensure optimal results for your 
          growing endeavors.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            component={Link} 
            to="/category/1" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ px: 4 }}
          >
            Shop Seeds
          </Button>
          
          <Button 
            component={Link} 
            to="/category/2" 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ px: 4 }}
          >
            Shop Lights
          </Button>
          
          <Button 
            component={Link} 
            to="/search" 
            variant="outlined" 
            color="primary" 
            size="large"
            sx={{ px: 3 }}
          >
            Browse All Products
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
          Featured Categories
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 3 }}>
          {[
            { id: 1, name: 'Seeds' },
            { id: 2, name: 'Lights' },
            { id: 3, name: 'Hydroponics' },
            { id: 4, name: 'Nutrients' },
            { id: 5, name: 'Accessories' }
          ].map(category => (
            <Paper 
              key={category.id}
              component={Link}
              to={`/category/${category.id}`}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                textDecoration: 'none',
                color: 'text.primary',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="h6">{category.name}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 