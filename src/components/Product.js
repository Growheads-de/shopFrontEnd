import React, { Component } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';
import { Link } from 'react-router-dom';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

class Product extends Component {
  constructor(props) {
    super(props);
    
    this._isMounted = false;
    
    if (!window.smallPicCache) {
      window.smallPicCache = {};
    }

    if(this.props.pictureList && this.props.pictureList.length > 0 && this.props.pictureList.split(',').length > 0) {
      const bildId = this.props.pictureList.split(',')[0];
      if(window.smallPicCache[bildId]){
        this.state = {image:window.smallPicCache[bildId],loading:false, error: false}
      }else{
        this.state = {image: null, loading: true, error: false};
        this.props.socket.emit('getPic', { bildId, size:'small' }, (res) => {
          if(res.success){
            window.smallPicCache[bildId] = URL.createObjectURL(new Blob([res.imageBuffer], { type: 'image/jpeg' }));
            if (this._isMounted) {
              this.setState({image: window.smallPicCache[bildId], loading: false});
            } else {
              this.state.image = window.smallPicCache[bildId];
              this.state.loading = false;
            }
          }else{
            console.log('Fehler beim Laden des Bildes:', res);
            if (this._isMounted) {
              this.setState({error: true, loading: false});
            } else {
              this.state.error = true;
              this.state.loading = false;
            }
          }
        })
      }
    }else{
      this.state = {image: null, loading: false, error: false};
    }
  }
  
  componentDidMount() {
    this._isMounted = true;
  }
  
  componentWillUnmount() {
    this._isMounted = false;
  }

  handleQuantityChange = (quantity) => {
    console.log(`Product: ${this.props.name}, Quantity: ${quantity}`);
    // In a real app, this would update a cart state in a parent component or Redux store
  }

  render() {
    const { id, name, price, available, manufacturer, currency, vat, massMenge, massEinheit, thc, floweringWeeks,incoming, neu } = this.props;
    const isNew = neu && (new Date().getTime() - new Date(neu).getTime() < 30 * 24 * 60 * 60 * 1000);
    const showThcBadge = thc > 0;
    let thcBadgeColor = '#4caf50'; // Green default
    if (thc > 30) {
      thcBadgeColor = '#f44336'; // Red for > 30
    } else if (thc > 25) {
      thcBadgeColor = '#ffeb3b'; // Yellow for > 25
    }
    const showFloweringWeeksBadge = floweringWeeks > 0;
    let floweringWeeksBadgeColor = '#4caf50'; // Green default
    if (floweringWeeks > 12) {
      floweringWeeksBadgeColor = '#f44336'; // Red for > 12
    } else if (floweringWeeks > 8) {
      floweringWeeksBadgeColor = '#ffeb3b'; // Yellow for > 8
    }


    
    return (
      <Box sx={{ 
        position: 'relative', 
        height: '100%',
        width: { xs: '100%', sm: 'auto' }
      }}>
        {isNew && (
          <div
            style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '60px',
              height: '60px',
              zIndex: 999,
              pointerEvents: 'none'
            }}
          >
            {/* Background star - slightly larger and rotated */}
            <svg 
              viewBox="0 0 60 60" 
              width="56" 
              height="56"
              style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                transform: 'rotate(20deg)'
              }}
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#20403a" 
                stroke="none"
              />
            </svg>
            
            {/* Middle star - medium size with different rotation */}
            <svg 
              viewBox="0 0 60 60" 
              width="53" 
              height="53"
              style={{
                position: 'absolute',
                top: '-1.5px',
                left: '-1.5px',
                transform: 'rotate(-25deg)'
              }}
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#40736b" 
                stroke="none"
              />
            </svg>
            
            {/* Foreground star - main star with text */}
            <svg 
              viewBox="0 0 60 60" 
              width="50" 
              height="50"
            >
              <polygon 
                points="30,0 38,20 60,22 43,37 48,60 30,48 12,60 17,37 0,22 22,20"
                fill="#609688" 
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
        
        <Card 
          sx={{ 
            width: { xs: 'calc(100vw - 48px)', sm: '250px' },
            minWidth: { xs: 'calc(100vw - 48px)', sm: '250px' },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0px 10px 20px rgba(0,0,0,0.1)'
            }
          }}
        >
          {showThcBadge && (
            <div aria-label={`THC Anteil: ${thc}%`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: thcBadgeColor,
                color: thc > 25 && thc <= 30 ? '#000000' : '#ffffff',
                fontWeight: 'bold',
                padding: '2px 0',
                width: '80px',
                textAlign: 'center',
                zIndex: 999,
                fontSize: '9px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                transform: 'rotate(-45deg) translateX(-40px) translateY(15px)',
                transformOrigin: 'top left'
              }}
            >
              THC {thc}%
            </div>
          )}

          {showFloweringWeeksBadge && (
            <div aria-label={`Flowering Weeks: ${floweringWeeks}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: floweringWeeksBadgeColor,
                color: floweringWeeks > 8 && floweringWeeks <= 12 ? '#000000' : '#ffffff',
                fontWeight: 'bold',
                padding: '1px 0',
                width: '100px',
                textAlign: 'center',
                zIndex: 999,
                fontSize: '9px',
                boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                transform: 'rotate(-45deg) translateX(-50px) translateY(32px)',
                transformOrigin: 'top left'
              }}
            >
              {floweringWeeks} Wochen
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
              height: { xs: '240px', sm: '180px' },
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              {this.state.loading ? (
                <CircularProgress sx={{ color: '#90ffc0' }} />

              ) : this.state.image === null ? (
                <CardMedia
                component="img"
                height={ window.innerWidth < 600 ? "240" : "180" }
                image="/assets/images/nopicture.jpg"
                alt={name}
                sx={{ 
                  objectFit: 'contain', 
                  borderTopLeftRadius: '8px', 
                  borderTopRightRadius: '8px',
                  width: '100%'
                }}
              />  
              ) : (
                <CardMedia
                  component="img"
                  height={ window.innerWidth < 600 ? "240" : "180" }
                  image={this.state.image}
                  alt={name}
                  sx={{ 
                    objectFit: 'contain', 
                    borderTopLeftRadius: '8px', 
                    borderTopRightRadius: '8px',
                    width: '100%'
                  }}
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
                  minHeight: '3.4em'
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
                <small style={{ color: '#77aa77', fontSize: '0.6em' }}>(incl. {vat}% USt.,*)</small>
                

           
              </Typography>
              {massMenge != 1 && massEinheit && (<Typography variant="body2" color="text.secondary" sx={{ m: 0,p: 0 }}>
                  ({new Intl.NumberFormat('de-DE', {style: 'currency', currency: currency || 'EUR'}).format(price/massMenge)}/{massEinheit})
              </Typography>   )}
              </div>
                 {/*incoming*/}
            </CardContent>
          </Box>
          
          <Box sx={{ p: 2, pt: 0, display: 'flex', alignItems: 'center' }}>
            <IconButton
              component={Link}
              to={`/product/${id}`}
              size="small"
              sx={{ mr: 1, color: 'text.secondary' }}
            >
              <ZoomInIcon />
            </IconButton>
            <AddToCartButton cartButton={true} available={available} incoming={incoming} pictureList={this.props.pictureList} id={id} price={price} name={name}/>
          </Box>
        </Card>
      </Box>
    );
  }
}

export default Product; 
