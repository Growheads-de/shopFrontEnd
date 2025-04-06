/* eslint-env browser */
/* global Intl */
import React, { Component, useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Chip,
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';
import { Link, useParams } from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';

// Wrapper component for individual product detail page with socket
const ProductDetailWithSocket = () => {
  const { productId } = useParams();
  
  return (
    <SocketContext.Consumer>
      {socket => <ProductDetailPage productId={productId} socket={socket} />}
    </SocketContext.Consumer>
  );
};

// Product detail page with image loading
const ProductDetailPage = ({ productId, socket }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productImage, setProductImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // Load product data
  useEffect(() => {
    // Mock function to get product data by ID
    // In a real app, you would fetch this from an API or context
    const getProductById = (id) => {
      const products = [
        { id: 1, name: 'Cannabis Seeds (OG Kush)', price: 49.99, available: true, categoryId: "1", description: "Premium OG Kush seeds with high germination rate. Perfect for beginners and experts alike.", manufacturer: "Green Thumb Seeds" },
        { id: 2, name: 'LED Grow Light 1000W', price: 249.99, available: true, categoryId: "2", description: "Professional full spectrum LED grow light. Energy efficient with coverage for 4x4ft grow space.", manufacturer: "GrowTech" },
        { id: 3, name: 'Hydroponic System Kit', price: 189.99, available: false, categoryId: "3", description: "Complete hydroponic system for 8 plants. Includes reservoir, nutrient delivery system, and digital timer.", manufacturer: "AquaGrow" },
        { id: 4, name: 'Nutrient Solution Pack', price: 39.99, available: true, categoryId: "4", description: "Essential nutrient pack for all growth stages. Includes micro, grow, and bloom nutrients.", manufacturer: "GrowPro" },
        { id: 5, name: 'Carbon Air Filter', price: 79.99, available: true, categoryId: "5", description: "Premium activated carbon filter to eliminate odors. Fits standard 6-inch ducting.", manufacturer: "AirClean" }
      ];
      
      return products.find(product => product.id === parseInt(id)) || null;
    };
    
    const fetchedProduct = getProductById(productId);
    setProduct(fetchedProduct);
    setLoading(false);
  }, [productId]);
  
  // Load product image using socket
  useEffect(() => {
    if (!product || !socket) return;
    
    // Initialize global cache object if it doesn't exist
    if (!window.productCache) {
      window.productCache = {};
    }
    
    const cacheKey = `productImage_${product.id}`;
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
            console.log(`Using cached error response for product ${product.id}, error: ${error}, age:`, Math.round(cacheAge/1000), 'seconds');
            setImageError(true);
            return;
          } else if (imageUrl !== undefined) {
            // This is a cached successful response
            console.log(`Using cached image for product ${product.id}, age:`, Math.round(cacheAge/1000), 'seconds');
            setProductImage(imageUrl);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error reading image from cache:', err);
    }
    
    // If no valid cache, fetch from socket
    socket.emit('getPreviewPic', { articleId: product.id }, (res) => {
      // Cache both successful and error responses
      try {
        // Store result in global cache with information about the type of response
        window.productCache[cacheKey] = {
          imageUrl: res.success ? URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType })) : null,
          error: res.success ? null : (res.error || "Unknown error"),
          timestamp: Date.now()
        };
        
        if (res.success) {
          console.log(`Cached successful image response for product ${product.id}`);
          setProductImage(URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType })));
        } else {
          console.log(`Cached error response for product ${product.id}: ${res.error || "Unknown error"}`);
          setImageError(true);
        }
      } catch (err) {
        console.error('Error writing to cache:', err);
        
        // Still update state if successful, even if caching failed
        if (res.success) {
          setProductImage(URL.createObjectURL(new Blob([res.imageBuffer], { type: res.mimeType })));
        } else {
          setImageError(true);
        }
      }
    });
  }, [product, socket]);
  
  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Loading Product...
        </Typography>
      </Box>
    );
  }
  
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
  
  // Determine image source - use fallback if no image or error
  const imageSrc = (!productImage || imageError) ? '/assets/nopicture.jpg' : productImage;
  
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Product Image */}
        <Box sx={{ flex: '0 0 40%' }}>
          <CardMedia
            component="img"
            image={imageSrc}
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
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Manufacturer: {product.manufacturer || 'Unknown'}
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

export { Product as default, ProductDetailWithSocket as ProductDetailPage }; 