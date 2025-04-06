import React, { Component } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip,
  CardActionArea,
  Rating
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';
import { Link, useParams } from 'react-router-dom';

// Wrapper component for individual product detail page
const ProductDetailPage = () => {
  const { productId } = useParams();
  
  // Mock function to get product data by ID
  // In a real app, you would fetch this from an API or context
  const getProductById = (id) => {
    const products = [
      { id: 1, name: 'Cannabis Seeds (OG Kush)', price: 49.99, available: true, categoryId: "1", description: "Premium OG Kush seeds with high germination rate. Perfect for beginners and experts alike." },
      { id: 2, name: 'LED Grow Light 1000W', price: 249.99, available: true, categoryId: "2", description: "Professional full spectrum LED grow light. Energy efficient with coverage for 4x4ft grow space." },
      { id: 3, name: 'Hydroponic System Kit', price: 189.99, available: false, categoryId: "3", description: "Complete hydroponic system for 8 plants. Includes reservoir, nutrient delivery system, and digital timer." },
      { id: 4, name: 'Nutrient Solution Pack', price: 39.99, available: true, categoryId: "4", description: "Essential nutrient pack for all growth stages. Includes micro, grow, and bloom nutrients." },
      { id: 5, name: 'Carbon Air Filter', price: 79.99, available: true, categoryId: "5", description: "Premium activated carbon filter to eliminate odors. Fits standard 6-inch ducting." }
    ];
    
    return products.find(product => product.id === parseInt(id)) || null;
  };
  
  const product = getProductById(productId);
  
  if (!product) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product Not Found
        </Typography>
        <Typography>
          The product you are looking for does not exist or has been removed.
        </Typography>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Typography color="primary" sx={{ mt: 2 }}>
            Return to Home
          </Typography>
        </Link>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Product Image */}
        <Box sx={{ flex: '0 0 40%' }}>
          <CardMedia
            component="img"
            image={`https://source.unsplash.com/600x600/?cannabis,plant,grow,${product.id}`}
            alt={product.name}
            sx={{ 
              borderRadius: 2, 
              height: '400px',
              objectFit: 'cover',
              width: '100%'
            }}
          />
        </Box>
        
        {/* Product Details */}
        <Box sx={{ flex: '1 1 60%' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={4.5} precision={0.5} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              4.5 (24 reviews)
            </Typography>
          </Box>
          
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            ${product.price.toFixed(2)}
          </Typography>
          
          {!product.available && (
            <Chip 
              label="Out of Stock" 
              color="error" 
              sx={{ mb: 2 }}
            />
          )}
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            {product.description}
          </Typography>
          
          <Box sx={{ maxWidth: '200px', mt: 3 }}>
            <AddToCartButton 
              product={product} 
              disabled={!product.available}
              fullWidth
              size="large"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

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
  
  // Get a placeholder image for the product
  getProductImage = () => {
    return `https://source.unsplash.com/300x300/?cannabis,plant,grow,${this.props.id || Math.floor(Math.random() * 100)}`;
  };

  render() {
    const { id, name, price, available } = this.props;
    
    return (
      <Card 
        sx={{ 
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 10px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <CardActionArea 
          component={Link} 
          to={`/product/${id}`}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch' 
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="180"
              image={this.props.id ? this.getProductImage() : this.getDummyImage(name)}
              alt={name}
              sx={{ objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = this.getDummyImage(name);
              }}
            />
            {!available && (
              <Chip
                label="Out of Stock"
                color="error"
                size="small"
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography
              gutterBottom
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '3.6em'
              }}
            >
              {name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={4} precision={0.5} size="small" readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                (4.0)
              </Typography>
            </Box>
            
            <Typography
              variant="h6"
              color="primary"
              sx={{ mt: 'auto', fontWeight: 'bold' }}
            >
              ${parseFloat(price).toFixed(2)}
            </Typography>
          </CardContent>
        </CardActionArea>
        
        <Box sx={{ p: 2, pt: 0 }}>
          <AddToCartButton 
            product={{ id, name, price, available }} 
            disabled={!available}
          />
        </Box>
      </Card>
    );
  }
}

export { Product as default, ProductDetailPage }; 