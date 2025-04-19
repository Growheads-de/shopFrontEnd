/* eslint-env browser */
/* global Intl */
import React, { Component } from 'react';
import { 
  Box, 
  Typography,
  CardMedia
} from '@mui/material';
import { Link, useParams, useNavigate, useLocation} from 'react-router-dom';
import SocketContext from '../contexts/SocketContext.js';
import parse from 'html-react-parser';
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
    this.updatePics();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.mainPic !== this.props.mainPic) {
      this.updatePics();
    }
  }

  updatePics = () => {
    if (!window.tinyPicCache) window.tinyPicCache = {}; 
    if (!window.smallPicCache) window.smallPicCache = {};
    if (!window.mediumPicCache) window.mediumPicCache = {};
    if (!window.largePicCache) window.largePicCache = {};

    if(this.props.pictureList && this.props.pictureList.length > 0){
      const bildIds = this.props.pictureList.split(',');

      const pics = [];
      const mainPicId = bildIds[this.state.mainPic];

      for(const bildId of bildIds){
        if(bildId == mainPicId){
        
          if(window.mediumPicCache[bildId]){
            pics.push(window.mediumPicCache[bildId]); 
          }else if(window.smallPicCache[bildId]){
            pics.push(window.smallPicCache[bildId]);
            this.loadPic('medium',bildId,this.state.mainPic);
          }else{
            pics.push(null);
            this.loadPic('medium',bildId,this.state.mainPic);
          }  
        }else{
          if(window.tinyPicCache[bildId]){
            pics.push(window.tinyPicCache[bildId]);
          }else{
            pics.push(null);
            this.loadPic('tiny',bildId,pics.length-1);
          }
        }
      }
      this.setState({ pics });
    }else{
      if(this.state.pics.length > 0) this.setState({ pics:[] });
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

  render() {
    return (
      <>
        {this.state.pics[this.state.mainPic] && (
          <CardMedia component="img" height="400" sx={{ objectFit: 'contain'}} image={this.state.pics[this.state.mainPic]}/>
        )}

      </>
    );
  }
}

// Product detail page with image loading
class ProductDetailPage extends Component {
  constructor(props) {
    super(props);


    if(window.productDetailCache && window.productDetailCache[this.props.productId]){
      this.state = { product: window.productDetailCache[this.props.productId], loading: false, error: null, imageDialogOpen: false };
    }else{
      this.state = { product: null, loading: true, error: null, imageDialogOpen: false };
    }
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
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1400px', mx: 'auto' }}>

        {/* Breadcrumbs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            <Link to="/" onClick={() => this.props.navigate(-1)} style={{ textDecoration: 'none', color: 'inherit' }}>
              Zurück
            </Link> 
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
         
          <Box sx={{ 
            width: '555px',
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
              <Images socket={this.props.socket} pictureList={product.pictureList}/>
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
              
             {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Chip 
                  label={'dummy'} 
                  color={'primary'}
                  sx={{ fontWeight: 'medium', mb: 1 }}
                />
                
              </Box>*/}
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