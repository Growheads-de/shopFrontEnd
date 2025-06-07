import React, { Component, Fragment } from 'react';
import { 
  Box, 
  Typography,
  CardMedia,
  Stack,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useParams, useNavigate, useLocation} from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import parse from 'html-react-parser';
import AddToCartButton from './AddToCartButton.js';
//import CircleIcon from '@mui/icons-material/Circle';
//import CloseIcon from '@mui/icons-material/Close';

// Transition component for dialog
//const Transition = React.forwardRef(function Transition(props, ref) {
//  return <Slide direction="up" ref={ref} {...props} />;
//});

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
class Images extends Component {
  constructor(props) {
    super(props);
    this.state = { mainPic:0,pics:[]};

    console.log('Images constructor',props);
  }

  componentDidMount  () {
    this.updatePics(0);
  }

  updatePics = (newMainPic = this.state.mainPic) => {
    if (!window.tinyPicCache) window.tinyPicCache = {}; 
    if (!window.smallPicCache) window.smallPicCache = {};
    if (!window.mediumPicCache) window.mediumPicCache = {};
    if (!window.largePicCache) window.largePicCache = {};

    if(this.props.pictureList && this.props.pictureList.length > 0){
      const bildIds = this.props.pictureList.split(',');
     

      const pics = [];
      const mainPicId = bildIds[newMainPic];

      for(const bildId of bildIds){
        if(bildId == mainPicId){
        
          if(window.mediumPicCache[bildId]){
            pics.push(window.mediumPicCache[bildId]); 
          }else if(window.smallPicCache[bildId]){
            pics.push(window.smallPicCache[bildId]);
            this.loadPic('medium',bildId,newMainPic);
          }else if(window.tinyPicCache[bildId]){
            pics.push(bildId);
            this.loadPic('medium',bildId,newMainPic);
          }else{
            pics.push(bildId);
            this.loadPic('medium',bildId,newMainPic);
          }  
        }else{
          if(window.tinyPicCache[bildId]){
            pics.push(window.tinyPicCache[bildId]);
          }else if(window.mediumPicCache[bildId]){
            pics.push(window.mediumPicCache[bildId]);
            this.loadPic('tiny',bildId,newMainPic);
          }else{
            pics.push(null);
            this.loadPic('tiny',bildId,pics.length-1);
          }
        }
      }
      console.log('pics',pics);
      this.setState({ pics, mainPic: newMainPic });
    }else{
      if(this.state.pics.length > 0) this.setState({ pics:[], mainPic: newMainPic });
    }
  }

  loadPic = (size,bildId,index) => {
    this.props.socket.emit('getPic', { bildId, size }, (res) => {
      if(res.success){
        const url = URL.createObjectURL(new Blob([res.imageBuffer], { type: 'image/jpeg' }));

        if(size === 'medium') window.mediumPicCache[bildId] = url;
        if(size === 'small') window.smallPicCache[bildId] = url;
        if(size === 'tiny') window.tinyPicCache[bildId] = url;
        if(size === 'large') window.largePicCache[bildId] = url;
        const pics = this.state.pics;
        pics[index] = url
        this.setState({ pics });
      }
    })
  }

  handleThumbnailClick = (clickedPic) => {
    // Find the original index of the clicked picture in the full pics array
    const originalIndex = this.state.pics.findIndex(pic => pic === clickedPic);
    if (originalIndex !== -1) {
      this.updatePics(originalIndex);
    }
  }

  render() {
    return (
      <>
        {this.state.pics[this.state.mainPic] && (
          <CardMedia 
            component="img" 
            height="400" 
            sx={{ 
              objectFit: 'contain',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)'
              }
            }} 
            image={this.state.pics[this.state.mainPic]}
            onClick={this.props.onOpenFullscreen}
          />
        )}
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', mt: 2 }}>
        {this.state.pics.filter(pic => pic !== null && pic !== this.state.pics[this.state.mainPic]).map((pic, index) => (
          <CardMedia 
            key={index} 
            component="img" 
            height="80" 
            sx={{ 
              objectFit: 'contain',
              cursor: 'pointer',
              borderRadius: 1,
              border: '2px solid transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                border: '2px solid #1976d2',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }
            }} 
            image={pic}
            onClick={() => this.handleThumbnailClick(pic)}
          />
        ))}
        </Stack>

        {/* Fullscreen Dialog */}
        <Dialog
          open={this.props.fullscreenOpen || false}
          onClose={this.props.onCloseFullscreen}
          maxWidth={false}
          fullScreen
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }
          }}
        >
          <DialogContent 
            sx={{ 
              p: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: '100vh',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              // Only close if clicking on the background (DialogContent itself)
              if (e.target === e.currentTarget) {
                this.props.onCloseFullscreen();
              }
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={this.props.onCloseFullscreen}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Main Image in Fullscreen */}
            {this.state.pics[this.state.mainPic] && (
                              <CardMedia 
                  component="img" 
                  sx={{                               
                    objectFit: 'contain',
                    width: '90vw',
                    height: '80vh'
                  }} 
                  image={this.state.pics[this.state.mainPic]}
                  onClick={this.props.onCloseFullscreen}
                />
            )}

            {/* Thumbnail Stack in Fullscreen */}
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '90%',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', py: 2 }}>
                {this.state.pics.filter(pic => pic !== null && pic !== this.state.pics[this.state.mainPic]).map((pic, index) => (
                  <CardMedia 
                    key={index} 
                    component="img" 
                    height="60" 
                    sx={{ 
                      objectFit: 'contain',
                      cursor: 'pointer',
                      borderRadius: 1,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        border: '2px solid #1976d2',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 8px rgba(25, 118, 210, 0.5)'
                      }
                    }} 
                    image={pic}
                    onClick={() => this.handleThumbnailClick(pic)}
                  />
                ))}
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

// Product detail page with image loading
class ProductDetailPage extends Component {
  constructor(props) {
    super(props);

    if(window.productDetailCache && window.productDetailCache[this.props.productId]){
      this.state = { 
        product: window.productDetailCache[this.props.productId], 
        loading: false, 
        error: null, 
        imageDialogOpen: false
      };
    }else{
      this.state = { 
        product: null, 
        loading: true, 
        error: null, 
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
    const { product, loading, error } = this.state;
    
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
                <AddToCartButton cartButton={true} pictureList={product.pictureList} available={product.available} id={product.id} price={product.price} name={product.name}/>
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

export default ProductDetailWithSocket;