import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CategoryBox from './CategoryBox.js';

// @note SwashingtonCP font is now loaded globally via index.css

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
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
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