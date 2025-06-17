import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import CategoryBox from './CategoryBox.js';

// Add font-face declaration
const fontFaceStyle = `
  @font-face {
    font-family: 'SwashingtonCP';
    src: url('/assets/fonts/SwashingtonCP.ttf') format('truetype');
  }
`;

const CategoryBoxGrid = ({ 
  categories = [], 
  title, 
  spacing = 3,
  showTitle = true,
  titleVariant = 'h3',
  titleSx = {},
  gridProps = {},
  boxProps = {}
}) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <Box>
      <style>{fontFaceStyle}</style>
      
      {/* Optional title */}
      {showTitle && title && (
        <Typography 
          variant={titleVariant}
          component="h1" 
          sx={{ 
            mb: 4, 
            fontFamily: 'SwashingtonCP',
            color: 'primary.main',
            textAlign: 'center',
            ...titleSx
          }}
        >
          {title}
        </Typography>
      )}
      
      {/* Category boxes grid */}
      <Grid container spacing={spacing} sx={{ mt: showTitle && title ? 0 : 2, ...gridProps.sx }} {...gridProps}>
        {categories.map((category) => (
          <Grid 
           
          key={category.id} 
  
        >
            <CategoryBox
              id={category.id}
              name={category.name}
              seoName={category.seoName}
              image={category.image}
              bgcolor={category.bgcolor}
              {...boxProps}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryBoxGrid; 