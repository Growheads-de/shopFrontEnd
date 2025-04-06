import React, { Component } from 'react';
import { 
  Card, 
  CardActions, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip,
  Box 
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';
import StarIcon from '@mui/icons-material/Star';

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
  
  handleQuantityChange = (quantity) => {
    console.log(`Product: ${this.props.name}, Quantity: ${quantity}`);
    // In a real app, this would update a cart state in a parent component or Redux store
  }
  
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
              color: 'white',
              zIndex: 1,
              filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: 50,
                height: 50,
              }}
            >
              <StarIcon 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontSize: 50,
                  color: 'success.main',
                  transform: 'rotate(0deg)',
                }}
              />
              <StarIcon 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontSize: 50,
                  color: 'secondary.main',
                  transform: 'rotate(22.5deg)',
                  opacity: 0.85,
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  color: 'white',
                  textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                NEW
              </Typography>
            </Box>
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
          <AddToCartButton 
            available={available}
            productName={name}
            onQuantityChange={this.handleQuantityChange}
            initialQuantity={0}
          />
        </CardActions>
      </Card>
    );
  }
}

export default Product; 