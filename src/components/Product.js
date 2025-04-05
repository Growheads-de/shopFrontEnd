import React, { Component } from 'react';
import { 
  Card, 
  CardActions, 
  CardContent, 
  CardMedia, 
  Button, 
  Typography, 
  Chip,
  Box 
} from '@mui/material';

class Product extends Component {
  // Generate a dummy image URL based on product name
  getDummyImage = (name) => {
    const category = this.getCategoryFromName(name);
    const width = 300;
    const height = 200;
    // Use various green tones for the background
    const greenTones = [
      '2E7D32', // Forest green
      '388E3C', // Medium green
      '43A047', // Regular green
      '4CAF50', // Medium light green
      '66BB6A', // Light green
      '81C784', // Very light green
      '1B5E20', // Very dark green
      '33691E', // Dark green
    ];
    
    // Select a green tone based on the product name
    const hash = this.hashString(name);
    const bgColor = greenTones[hash % greenTones.length];
    const textColor = 'FFFFFF'; // White text
    return `https://dummyimage.com/${width}x${height}/${bgColor}/${textColor}&text=${category}`;
  }

  // Helper function to hash a string
  hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  // Map product name to a generic cannabis growing category for image
  getCategoryFromName = (name) => {
    const nameToCategory = {
      'Seeds': 'Seeds',
      'Grow Light': 'Lighting',
      'Hydroponic': 'Hydro',
      'Nutrient': 'Nutrients',
      'Filter': 'Filters',
      'Tent': 'Tents',
      'pH': 'Testing',
      'Scissors': 'Harvest',
      'Trellis': 'Support',
      'Soil': 'Soil',
      'Fan': 'Ventilation',
      'Drying': 'Drying',
      'Cannabis': 'Cannabis'
    };

    // Find a keyword match in the product name
    for (const keyword in nameToCategory) {
      if (name.includes(keyword)) {
        return nameToCategory[keyword];
      }
    }
    
    // Default if no category is matched
    return 'GrowEquip';
  }

  // Green toned getColorFromName is no longer needed
  
  render() {
    const { name, price, image, available } = this.props;
    const productImage = image || this.getDummyImage(name);
    
    return (
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        maxWidth: 300,
        mx: 'auto',
        borderRadius: 2,
        boxShadow: 3,
        position: 'relative',
        overflow: 'visible'
      }}>
        {available && (
          <Box
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              backgroundColor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              zIndex: 1,
              boxShadow: 2,
            }}
          >
            NEW
          </Box>
        )}
        <CardMedia
          component="img"
          height="200"
          image={productImage}
          alt={name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1, bgcolor: 'background.paper' }}>
          <Typography gutterBottom variant="h5" component="h2" sx={{ color: 'text.primary' }}>
            {name}
          </Typography>
          <Typography variant="h6" color="primary.dark" fontWeight="bold">
            ${price.toFixed(2)}
          </Typography>
          <Chip 
            label={available ? "In Stock" : "Out of Stock"} 
            color={available ? "success" : "error"} 
            size="small" 
            sx={{ mt: 1 }}
          />
        </CardContent>
        <CardActions sx={{ bgcolor: 'background.paper', pb: 2, px: 2 }}>
          <Button 
            size="medium" 
            variant="contained" 
            color="primary" 
            disabled={!available}
            onClick={() => alert(`Added ${name} to cart!`)}
            fullWidth
            sx={{ 
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }}
          >
            Add to Cart
          </Button>
        </CardActions>
      </Card>
    );
  }
}

export default Product; 