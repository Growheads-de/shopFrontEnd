import React, { Component } from 'react';
import { 
  Box, 
  Typography,
  CardMedia,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import parse from 'html-react-parser';
import AddToCartButton from './AddToCartButton.js';
import Images from './Images.js';


// Product detail page with image loading
class ProductDetailPage extends Component {
  constructor(props) {
    super(props);

    if(window.productDetailCache && window.productDetailCache[this.props.productId]){
      this.state = { 
        product: window.productDetailCache[this.props.productId], 
        loading: false, 
        error: null,
        attributeImages: {},
        imageDialogOpen: false
      };
    }else{
      this.state = { 
        product: null, 
        loading: true, 
        error: null, 
        attributeImages: {},
        imageDialogOpen: false
      };
    }
    
  }

  componentDidMount() {
    this.loadProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.productId !== this.props.productId)
      this.setState({product: null, loading: true, error: null, imageDialogOpen: false },this.loadProductData);
  }

  loadProductData = () => {
    this.props.socket.emit('getProductView', { articleId: parseInt(this.props.productId) }, (res) => {
      console.log('Product data received:', res);
      if (res.success) {        
        this.setState({ product: res.product, loading: false, error: null, imageDialogOpen: false });

        // Initialize window-level attribute image cache if it doesn't exist
        if (!window.attributeImageCache) {
          window.attributeImageCache = {};
        }

        if(res.attributes && res.attributes.length > 0){
          const attributeImages = {};
          
          for(const attribute of res.attributes){
            const cacheKey = attribute.kMerkmalWert;
            
            // Check if we have a cached result (either URL or negative result)
            if (window.attributeImageCache[cacheKey]) {
              const cached = window.attributeImageCache[cacheKey];
              if (cached.url) {
                // Use cached URL
                attributeImages[cacheKey] = cached.url;         
              }
            } else {
              // Not in cache, fetch from server
              this.props.socket.emit('getAttributePicture', { id: cacheKey }, (res) => {
                if(res.success){
                  const blob = new Blob([res.imageBuffer], { type: 'image/jpeg' }); 
                  const url = URL.createObjectURL(blob);
                  
                  // Cache the successful URL
                  window.attributeImageCache[cacheKey] = { url: url, timestamp: Date.now() };
                  
                  // Update state
                  const updatedImages = { ...this.state.attributeImages };
                  updatedImages[cacheKey] = url;
                  this.setState({ attributeImages: updatedImages });
                } else {
                  // Cache negative result to avoid future requests
                  window.attributeImageCache[cacheKey] = { noImage: true, timestamp: Date.now() };                
                }
              });
            }
          }
          
          // Set initial state with cached images
          if (Object.keys(attributeImages).length > 0) {
            this.setState({ attributeImages });
          }
        }
      } else {
        console.error('Error loading product:', res.error || 'Unknown error',res);
        this.setState({ product: null, loading: false, error: 'Error loading product', imageDialogOpen: false });
      }
    });
  }

  handleOpenDialog = () => {
    this.setState({ imageDialogOpen: true });
  }

  handleCloseDialog = () => {
    this.setState({ imageDialogOpen: false });
  }

  render() {
    const { product, loading, error, attributeImages } = this.state;
    
    if (loading) {
      return (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
        }}>
          <Typography variant="h5" gutterBottom>
            Produkt wird geladen...
          </Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom color="error">
            Fehler
          </Typography>
          <Typography>
            {error}
          </Typography>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography color="primary" sx={{ mt: 2 }}>
              Zurück zur Startseite
            </Typography>
          </Link>
        </Box>
      );
    }
    
    if (!product) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Produkt nicht gefunden
          </Typography>
          <Typography>
            Das gesuchte Produkt existiert nicht oder wurde entfernt.
          </Typography>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography color="primary" sx={{ mt: 2 }}>
              Zurück zur Startseite
            </Typography>
          </Link>
        </Box>
      );
    }    
    // Format price with tax
    const priceWithTax = new Intl.NumberFormat("de-DE", {style: "currency", currency: "EUR",}).format(product.price);
    
    
    return (
      <Box sx={{ p: { xs: 2, md: 2 },pb: { xs: 4, md: 8 },maxWidth: '1400px', mx: 'auto' }}>

        {/* Breadcrumbs */}
        <Box sx={{ 
          mb: 2, 
          position: ['-webkit-sticky','sticky'], // Provide both prefixed and standard
          top: { xs: '80px', sm: '80px', md: '80px',lg: '80px' }, /* Offset to sit below the header 120 mith menu for md and lg*/
          left: 0,
          width: '100%',
          display: 'flex',
          zIndex: (theme) => theme.zIndex.appBar - 1, /* Just below the AppBar */
          py: 0,px:2
        }}>
          <Box 
            sx={{ 
              ml: { xs: 0, md: 0 },
              display: 'inline-flex',
              px: 0,
              py: 1,
              backgroundColor: '#2e7d32', //primary dark green             
              borderRadius: 1
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <Link to="/" onClick={() => this.props.navigate(-1)} style={{ paddingLeft:16, paddingRight:16,paddingTop:8,paddingBottom:8, textDecoration: 'none', color: '#fff', fontWeight: 'bold' }}>
                Zurück
              </Link> 
            </Typography>
          </Box>
        </Box>
      
       <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          background: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
         
          <Box sx={{ 
            width: { xs: '100%', sm: '555px' },
            maxWidth: '100%',
            minHeight: '400px',
            background: '#f8f8f8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!product.pictureList && (
              <CardMedia
                component="img"
                height="400"
                image="/assets/images/nopicture.jpg"
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />  
            )}
            {product.pictureList && (
              <Images 
                socket={this.props.socket} 
                pictureList={product.pictureList}
                fullscreenOpen={this.state.imageDialogOpen}
                onOpenFullscreen={this.handleOpenDialog}
                onCloseFullscreen={this.handleCloseDialog}
              />
            )}
          </Box>
         
          {/* Product Details */}
          <Box sx={{ 
            flex: '1 1 60%',
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Product identifiers */}
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Artikelnummer: {product.articleNumber}
              </Typography>
            </Box>
            
            {/* Product title */}
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: '#333' }}
            >
              {product.name}
            </Typography>
            
            {/* Manufacturer if available */}
            {product.manufacturer && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Hersteller: {product.manufacturer}
                </Typography>
              </Box>
            )}

            {/* Attribute pictures */}
            <Stack direction="row" spacing={2}>
              {Object.keys(attributeImages).map((key) => (
                <Box key={key} sx={{ mb: 2 }}>
                  <CardMedia component="img" image={attributeImages[key]} alt={`Attribute ${key}`} sx={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }} />
                </Box>
              ))}
            </Stack>

            {/* Weight */}
            {product.weight > 0 && <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Gewicht: {product.weight.toFixed(1).replace('.',',')} kg
              </Typography>
            </Box>}
                        
            {/* Price and availability section */}
            <Box 
              sx={{ 
                mt: 'auto',
                p: 3, 
                background: '#f9f9f9', 
                borderRadius: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}
            >
              <Box>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {priceWithTax}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  inkl. {product.vat}% MwSt.
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, pt: 0 }}>
                <AddToCartButton cartButton={true} pictureList={product.pictureList} available={product.available} id={product.id} price={product.price} vat={product.vat} weight={product.weight} name={product.name}/>
              </Box>

            </Box>
          </Box>
        </Box>
        
        {/* Product full description */}
        {product.description && (
          <Box sx={{ 
            mt: 4, 
            p: 4, 
            background: '#fff',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>      
            <Box 
              sx={{ 
                mt: 2,
                lineHeight: 1.7,
                '& p': { mt: 0, mb: 2 },
                '& strong': { fontWeight: 600 }
              }}
              
            >
              {parse(product.description)} 
            </Box>
          </Box>
        )} 
      </Box>
    );
  }
}

export default ProductDetailPage;