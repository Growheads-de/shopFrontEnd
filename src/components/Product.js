/* eslint-env browser */
/* global Intl */
import React, { Component } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography,
  CircularProgress
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
            this.setState({ imageError: true });
            return;
          } else if (imageUrl !== undefined) {
            // This is a cached successful response
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
          this.setState({ 
            image: URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType }))
          });
        } else {
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
    const { id, name, price, available, manufacturer, currency, steuersatz, massMenge, massEinheit,/* incoming,*/ neu } = this.props;
    const { image, imageError } = this.state;
    
    const isNew = neu && (new Date().getTime() - new Date(neu).getTime() < 30 * 24 * 60 * 60 * 1000);
    
    return (
      <Card 
        sx={{ 
          width: '250px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 10px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {isNew && (
          <div
            style={{
              position: 'absolute',
              top: '-35px',
              right: '-35px',
              width: '80px',
              height: '80px',
              zIndex: 999,
              pointerEvents: 'none'
            }}
          >
            {/* Background star - slightly larger and rotated */}
            <svg 
              viewBox="0 0 60 60" 
              width="76" 
              height="76"
              style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                transform: 'rotate(20deg)'
              }}
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#00403a" 
                stroke="none"
              />
            </svg>
            
            {/* Middle star - medium size with different rotation */}
            <svg 
              viewBox="0 0 60 60" 
              width="73" 
              height="73"
              style={{
                position: 'absolute',
                top: '-1.5px',
                left: '-1.5px',
                transform: 'rotate(-25deg)'
              }}
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#00736b" 
                stroke="none"
              />
            </svg>
            
            {/* Foreground star - main star with text */}
            <svg 
              viewBox="0 0 60 60" 
              width="70" 
              height="70"
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#009688" 
                stroke="none"
              />
            </svg>
            
            {/* Text as a separate element to position it at the top */}
            <div
              style={{
                position: 'absolute',
                top: '45%',
                left: '45%',
                transform: 'translate(-50%, -50%) rotate(-10deg)',
                color: 'white',
                fontWeight: '900',
                fontSize: '16px',
                textShadow: '0px 1px 2px rgba(0,0,0,0.5)',
                zIndex: 1000
              }}
            >
              NEU
            </div>
          </div>
        )}
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
          <Box sx={{ 
            position: 'relative', 
            height: '180px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}>
            {imageError ? (
              <CardMedia
                component="img"
                height="180"
                image="/assets/images/nopicture.jpg"
                alt={name}
                sx={{ objectFit: 'cover' }}
              />
            ) : image === null ? (
              <CircularProgress sx={{ color: '#90ffc0' }} />
            ) : (
              <CardMedia
                component="img"
                height="180"
                image={image}
                alt={name}
                sx={{ objectFit: 'cover' }}
              />
            )}
          </Box>
          
          <CardContent sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            '&.MuiCardContent-root:last-child': {
              paddingBottom: 0
            }
          }}>
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
              <Typography variant="body2" color="text.secondary" style={{minHeight:'1.5em'}}>
                {manufacturer || ''}
              </Typography>
            </Box>
            
            <div style={{padding:'0px',margin:'0px',minHeight:'3.8em'}}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ mt: 'auto', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>{new Intl.NumberFormat('de-DE', {style: 'currency', currency: currency || 'EUR'}).format(price)}</span>
              <small style={{ color: '#77aa77', fontSize: '0.6em' }}>(incl. {steuersatz}% USt.,*)</small>
              

         
            </Typography>
            {massMenge != 1 && massEinheit && (<Typography variant="body2" color="text.secondary" sx={{ m: 0,p: 0 }}>
                ({new Intl.NumberFormat('de-DE', {style: 'currency', currency: currency || 'EUR'}).format(price/massMenge)}/{massEinheit})
            </Typography>   )}
            </div>
               {/*incoming*/}
          </CardContent>
        </Box>
        
        <Box sx={{ p: 2, pt: 0 }}>
          <AddToCartButton 
            available={available}
          />
        </Box>
      </Card>
    );
  }
}

export default Product; 
