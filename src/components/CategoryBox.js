import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

// Add font-face declaration only once at module level
if (typeof document !== 'undefined' && !document.getElementById('swashington-font')) {
  const style = document.createElement('style');
  style.id = 'swashington-font';
  style.textContent = `
    @font-face {
      font-family: 'SwashingtonCP';
      src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
    }
  `;
  document.head.appendChild(style);
}

const CategoryBox = ({ 
  id, 
  name, 
  seoName,
  image, 
  bgcolor, 
  height = 130,
  fontSize = '0.8rem',
  ...props 
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    
    // Handle different image types
    if (image) {
      if (typeof image === 'string') {
        // It's already a URL string
        setImageUrl(image);
        setImageError(false);
      } else if (image instanceof ArrayBuffer) {
        // Convert ArrayBuffer to data URL
        try {
          const blob = new Blob([image], { type: 'image/jpeg' }); // Assume JPEG, could be PNG
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
          setImageError(false);
        } catch (error) {
          console.error('Error converting ArrayBuffer to image URL:', error);
          setImageError(true);
          setImageUrl(null);
        }
      } else {
        // Unknown image type
        console.warn('Unknown image type for category', id, typeof image);
        setImageError(true);
        setImageUrl(null);
      }
    } else {
      setImageUrl(null);
      setImageError(false);
    }
    
    // Clean up the object URL when component unmounts or image changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [image, id]);

  return (
    <Paper
      component={Link}
      to={`/Kategorie/${seoName}`}
      sx={{
        textDecoration: 'none',
        color: 'text.primary',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
        height: typeof height === 'object' ? '130px' : `${height}px`,
        minHeight: '130px',
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
        width: '130px',
        height: '100%',
        minHeight: '130px',
        bgcolor: bgcolor || '#e0e0e0',
        position: 'relative',
        backgroundImage: imageUrl && !imageError ? `url("${imageUrl}")` : 'none',
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
          minWidth: '130px',
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
  );
};

export default CategoryBox;