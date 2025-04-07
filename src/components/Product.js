/* eslint-env browser */
/* global Intl */
import React, { Component } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';
import { Link } from 'react-router-dom';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: null,
      imageError: false
    };
  }

  componentDidMount() {
    // Initialize global cache object if it doesn't exist
    if (!window.productCache) {
      window.productCache = {};
    }
    
    const cacheKey = `productImage_${this.props.id}`;
    try {
      const cachedData = window.productCache[cacheKey];
      if (cachedData) {
        const { imageUrl, error, timestamp } = cachedData;
        const cacheAge = Date.now() - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If cache is less than 10 minutes old, use it
        if (cacheAge < tenMinutes) {
          if (error) {
            // This is a cached error response, no need to call socket again
            console.log(`Using cached error response for product ${this.props.id}, error: ${error}, age:`, Math.round(cacheAge/1000), 'seconds');
            this.setState({ imageError: true });
            return;
          } else if (imageUrl !== undefined) {
            // This is a cached successful response
            console.log(`Using cached image for product ${this.props.id}, age:`, Math.round(cacheAge/1000), 'seconds');
            this.setState({ image: imageUrl });
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error reading image from cache:', err);
    }
    
    // If no valid cache, fetch from socket
    const socket = this.props.socket;
    socket.emit('getPreviewPic', { articleId: this.props.id }, (res) => {
      // Cache both successful and error responses
      try {
        // Store result in global cache with information about the type of response
        window.productCache[cacheKey] = {
          imageUrl: res.success ? URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType })) : null,
          error: res.success ? null : (res.error || "Unknown error"),
          timestamp: Date.now()
        };
        
        if (res.success) {
          console.log(`Cached successful image response for product ${this.props.id}`);
          this.setState({ 
            image: URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType }))
          });
        } else {
          console.log(`Cached error response for product ${this.props.id}: ${res.error || "Unknown error"}`);
          this.setState({ imageError: true });
        }
      } catch (err) {
        console.error('Error writing to cache:', err);
        
        // Still update state if successful, even if caching failed
        if (res.success) {
          this.setState({ 
            image: URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType }))
          });
        } else {
          this.setState({ imageError: true });
        }
      }
    });
  }

  handleQuantityChange = (quantity) => {
    console.log(`Product: ${this.props.name}, Quantity: ${quantity}`);
    // In a real app, this would update a cart state in a parent component or Redux store
  }

  render() {
    const { id, name, price, available, manufacturer, currency } = this.props;
    const { image, imageError } = this.state;
    
    // Determine image source - use fallback if no image or error
    const imageSrc = (!image || imageError) ? '/assets/images/nopicture.jpg' : image;
    
    console.log(imageSrc);

    return (
      <Card 
        sx={{ 
          width: '250px',
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
        <Box
          component={Link}
          to={`/product/${id}`}
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'stretch',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="180"
              image={imageSrc}
              alt={name}
              sx={{ objectFit: 'cover' }}
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
              <Typography variant="body2" color="text.secondary">
                {manufacturer || 'Unknown Manufacturer'}
              </Typography>
            </Box>
            
            <Typography
              variant="h6"
              color="primary"
              sx={{ mt: 'auto', fontWeight: 'bold' }}
            >
              {new Intl.NumberFormat('de-DE', {style: 'currency', currency: currency || 'EUR'}).format(price)}
            </Typography>
          </CardContent>
        </Box>
        
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

export default Product; 
