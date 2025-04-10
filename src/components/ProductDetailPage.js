/* eslint-env browser */
/* global Intl */
import React, { Component } from 'react';
import { 
  Box, 
  CardMedia, 
  Typography, 
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  Slide
} from '@mui/material';
import { Link, useParams, useNavigate, useLocation} from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import CircleIcon from '@mui/icons-material/Circle';
import CloseIcon from '@mui/icons-material/Close';

// Transition component for dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Wrapper component for individual product detail page with socket
const ProductDetailWithSocket = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SocketContext.Consumer>
      {socket => <ProductDetailPage productId={productId} navigate={navigate} location={location} socket={socket} />}
    </SocketContext.Consumer>
  );
};

// Product detail page with image loading
class ProductDetailPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      loading: true,
      error: null,
      images: [],
      currentImageIndex: 0,
      dialogOpen: false
    };

    console.log('ProductDetailPage constructor',this.props);

    if (window.individualProductCache && window.individualProductCache[this.props.productId]) {
      const cachedProduct = window.individualProductCache[this.props.productId].data;
      const cacheTimestamp = window.individualProductCache[this.props.productId].timestamp;
      const isFresh = (Date.now() - cacheTimestamp) < (10 * 60 * 1000);
      if (isFresh){
        console.log('Using cached product:', cachedProduct);
        this.state.product = {cArtNr:cachedProduct.articleNumber,cName:cachedProduct.name,fPreis:cachedProduct.price,fVerfuegbar:cachedProduct.available};
        this.state.loading = false;
      }
    }
  }

  componentDidMount() {
    this.loadProductData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.productId !== this.props.productId) {
      //this.loadProductData();
    }
  }

  loadProductData = () => {
    const { socket, productId } = this.props;
    
    if (!socket) {
      this.setState({ 
        loading: false,
        error: "Socket connection not available" 
      });
      return;
    }

    // Get product data from socket
    socket.emit('getProductView', { articleId: parseInt(productId) }, (res) => {
      if (res.success) {
        console.log('Product data received:', res);
        
        let productImages = [];
        if (res.images && Array.isArray(res.images)) {
          console.log('Images data:', res.images);
          
          // Process images with error handling
          productImages = res.images.map((image, index) => {
            try {
              if (image) {
                // Handle different image buffer formats
                let blobData;
                if (typeof image === 'object' && image !== null) {
                  blobData = new Uint8Array(image);
                  // If we have processable data, create a blob URL
                  if (blobData) {
                    return URL.createObjectURL(new Blob([blobData], { type: "image/jpeg" }));
                  }
                }
              }
              console.warn(`Image at index ${index} could not be processed:`, image);
              return null;
            } catch (err) {
              console.error(`Error processing image at index ${index}:`, err);
              return null;
            }
          }).filter(img => img !== null); // Remove null entries
        } else {
          console.warn('No images array in response or invalid format');
        }
        
        console.log('Processed images:', productImages);
        
        res.product.attributes = res.attributes;

        this.setState({ 
          product: res.product,
          images: productImages,
          loading: false
        });
      } else {
        console.error('Error loading product:', res.error || 'Unknown error');
        this.setState({ 
          loading: false, 
          error: res.error || 'Unknown error loading product' 
        });
      }
    });
  }

  // Safely render HTML content
  createMarkup = (htmlContent) => {
    return { __html: htmlContent || "" };
  }

  // Determine availability status and message
  getAvailabilityInfo = (fVerfuegbar, fZulauf, dLieferdatum) => {
    if (fVerfuegbar > 0) {
      return {
        status: "in-stock",
        message: "Auf Lager",
        color: "success"
      };
    } else if (fZulauf > 0 && dLieferdatum) {
      const deliveryDate = new Date(dLieferdatum).toLocaleDateString('de-DE');
      return {
        status: "restock",
        message: `Lieferbar ab ${deliveryDate} (${fZulauf} Stück)`,
        color: "warning"
      };
    } else {
      return {
        status: "unavailable",
        message: "Nicht verfügbar",
        color: "error"
      };
    }
  }

  handlePrevImage = () => {
    this.setState(prevState => ({
      currentImageIndex: prevState.currentImageIndex === 0 
        ? prevState.images.length - 1 
        : prevState.currentImageIndex - 1
    }));
  }

  handleNextImage = () => {
    this.setState(prevState => ({
      currentImageIndex: prevState.currentImageIndex === prevState.images.length - 1 
        ? 0 
        : prevState.currentImageIndex + 1
    }));
  }

  handleSelectImage = (index) => {
    this.setState({
      currentImageIndex: index
    });
  }

  handleOpenDialog = () => {
    this.setState({ dialogOpen: true });
  }

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false });
  }

  render() {
    const { product, loading, error, images, currentImageIndex, dialogOpen } = this.state;
    
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
    
    // Get availability information
    const availability = this.getAvailabilityInfo(
      product.fVerfuegbar, 
      product.fZulauf, 
      product.dLieferdatum
    );
    
    // Format price with tax
    const priceWithTax = new Intl.NumberFormat("de-DE", {style: "currency", currency: "EUR",}).format(product.fPreis);
    
    // Determine if we have images or need to use default
    const hasImages = images && images.length > 0;
    const defaultImageSrc = '/assets/images/nopicture.jpg';
    const currentImageSrc = hasImages ? images[currentImageIndex] : defaultImageSrc;
    
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>
        {/* Image Viewer Dialog */}
        <Dialog
          fullScreen
          open={dialogOpen}
          onClose={this.handleCloseDialog}
          TransitionComponent={Transition}
          sx={{
            '& .MuiDialog-paper': {
              background: 'rgba(0, 0, 0, 0.2)'
            }
          }}
        >
          <IconButton
            onClick={this.handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              zIndex: 1,
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            p: 0
          }}
          onClick={this.handleCloseDialog}
          >
            <Box sx={{ 
              position: 'relative', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}>
              <CardMedia
                component="img"
                image={currentImageSrc}
                alt={product ? product.cName : ''}
                sx={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </DialogContent>
          
          {/* Thumbnails in dialog */}
          {hasImages && images.length > 1 && (
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              bgcolor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              padding: 2,
              overflowX: 'auto',
              zIndex: 1
            }}
            onClick={(e) => e.stopPropagation()} // Prevent dialog from closing when clicking thumbnails
            >
              <Box sx={{ 
                display: 'flex',
                gap: 1,
                maxWidth: '100%'
              }}>
                {images.map((img, index) => (
                  <Box 
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent dialog from closing
                      this.handleSelectImage(index);
                    }}
                    sx={{ 
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                      border: index === currentImageIndex ? '2px solid white' : '2px solid transparent',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      opacity: index === currentImageIndex ? 1 : 0.7,
                      '&:hover': {
                        opacity: 1
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Dialog>

        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <Link to="/" onClick={() => this.props.navigate(-1)} style={{ textDecoration: 'none', color: 'inherit' }}>
              Zurück
            </Link> 
            {/*{' > '} 
            {product.cName}*/}
          </Typography>
        </Box>
      
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          background: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {/* Product Image Carousel */}
          <Box sx={{ 
            flex: '0 0 40%', 
            minHeight: '400px',
            position: 'relative',
            background: '#f8f8f8',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Main Image */}
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-in'
            }}
            onClick={this.handleOpenDialog}
            >
              <CardMedia
                component="img"
                image={currentImageSrc}
                alt={product.cName}
                sx={{ 
                  objectFit: 'contain',
                  maxHeight: '400px',
                  maxWidth: '100%'
                }}
              />
            </Box>
            
            {/* Thumbnail navigation */}
            {hasImages && images.length > 1 && (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                mt: 2,
                flexWrap: 'wrap'
              }}>
                {images.map((img, index) => (
                  <Box 
                    key={index}
                    onClick={() => this.handleSelectImage(index)}
                    sx={{ 
                      width: 60,
                      height: 60,
                      border: index === currentImageIndex ? '2px solid #1976d2' : '2px solid transparent',
                      borderRadius: 1,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
            
            {/* Dot indicators for mobile */}
            {hasImages && images.length > 1 && (
              <Box sx={{ 
                display: { xs: 'flex', sm: 'none' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                mt: 2
              }}>
                {images.map((_, index) => (
                  <CircleIcon 
                    key={index}
                    fontSize="small"
                    onClick={() => this.handleSelectImage(index)}
                    sx={{ 
                      fontSize: index === currentImageIndex ? 12 : 8,
                      color: index === currentImageIndex ? 'primary.main' : 'grey.400',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
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
                Artikelnummer: {product.cArtNr}
              </Typography>
            </Box>
            
            {/* Product title */}
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: '#333' }}
            >
              {product.cName}
            </Typography>
            
            {/* Manufacturer if available */}
            {product.HerstellerName && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Hersteller: {product.HerstellerName}
                </Typography>
              </Box>
            )}
            
            {/* Product short description - HTML rendered */}
            {product.cKurzBeschreibung && (
              <Box 
                sx={{ 
                  my: 2,
                  '& p': { mt: 0 }
                }}
                dangerouslySetInnerHTML={this.createMarkup(product.cKurzBeschreibung)}
              />
            )}
            
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
                  inkl. {product.fSteuersatz}% MwSt.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Chip 
                  label={availability.message} 
                  color={availability.color}
                  sx={{ fontWeight: 'medium', mb: 1 }}
                />
                
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Product full description */}
        {product.cBeschreibung && (
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
              dangerouslySetInnerHTML={this.createMarkup(product.cBeschreibung)} 
            />
          </Box>
        )}

        {/* Product attributes table */}
        <Box sx={{ 
          mt: 4, 
          p: 4, 
          background: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <Box sx={{
            display: 'table',
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            {/* Weight row - only show if weight > 0 */}
            {product.fGewicht > 0 && (
              <Box sx={{
                display: 'table-row',
                '&:nth-of-type(odd)': {
                  backgroundColor: '#f9f9f9',
                },
              }}>
                <Box sx={{
                  display: 'table-cell',
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  fontWeight: 600,
                  width: '40%'
                }}>
                  Gewicht
                </Box>
                <Box sx={{
                  display: 'table-cell',
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee'
                }}>
                  {product.fGewicht} g
                </Box>
              </Box>
            )}
            
            {/* Attribute rows */}
            {product.attributes && Array.isArray(product.attributes) &&  product.attributes.map((attr, index) => (
              <Box key={index} sx={{
                display: 'table-row',
                '&:nth-of-type(odd)': {
                  backgroundColor: '#f9f9f9',
                },
              }}>
                <Box sx={{
                  display: 'table-cell',
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  fontWeight: 600
                }}>
                  {attr.cName}
                </Box>
                <Box sx={{
                  display: 'table-cell',
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee'
                }}>
                  {attr.cWert}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
}

export default ProductDetailWithSocket;