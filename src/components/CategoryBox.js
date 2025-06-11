import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

// Add font-face declaration
const fontFaceStyle = `
  @font-face {
    font-family: 'SwashingtonCP';
    src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
  }
`;

const CategoryBox = ({ 
  id, 
  name, 
  image, 
  bgcolor, 
  height = 250,
  fontSize = '1.2rem',
  ...props 
}) => {
  return (
    <>
      <style>{fontFaceStyle}</style>
      <Paper
        component={Link}
        to={`/category/${id}`}
        sx={{
          textDecoration: 'none',
          color: 'text.primary',
          borderRadius: 2,
          overflow: 'hidden',
          width: '100%',
          height: typeof height === 'object' ? '250px' : `${height}px`,
          minHeight: '250px',
          display: 'block',
          position: 'relative',
          bgcolor: bgcolor || '#f0f0f0',
          boxShadow: 4,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 8
          },
          ...props.sx
        }}
        {...props}
      >
                {/* Main content area - using flex to fill space */}
        <Box sx={{
          width: '100%',
          height: '100%',
          minHeight: '250px',
          bgcolor: bgcolor || '#e0e0e0',
          position: 'relative',
          backgroundImage: image ? `url("${image}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Invisible spacer to fill space */}
          <Box sx={{ flex: 1 }} />
          
          {/* Category name at bottom */}
          <Box sx={{
            bgcolor: 'rgba(0,0,0,0.7)',
            minWidth: '200px',
            p: 2
          }}>
            <Typography 
              sx={{ 
                fontSize, 
                color: 'white', 
                fontFamily: 'SwashingtonCP',
                textAlign: 'center'
              }}
            >
              {name}
            </Typography>
          </Box>
        
          
        </Box>
      </Paper>
    </>
  );
};

export default CategoryBox; 