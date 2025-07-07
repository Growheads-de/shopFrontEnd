import React, { Component } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import AddToCartButton from './AddToCartButton.js';

class CartItem extends Component {

  componentDidMount() {
    if (!window.tinyPicCache) {
      window.tinyPicCache = {};
    }
    if(this.props.item && this.props.item.pictureList && this.props.item.pictureList.split(',').length > 0) {
      const picid = this.props.item.pictureList.split(',')[0];
      if(window.tinyPicCache[picid]){
        this.setState({image:window.tinyPicCache[picid],loading:false, error: false})
      }else{
        this.setState({image: null, loading: true, error: false});
        if(this.props.socket){
          this.props.socket.emit('getPic', { bildId:picid, size:'tiny' }, (res) => {
            if(res.success){
              window.tinyPicCache[picid] = URL.createObjectURL(new Blob([res.imageBuffer], { type: 'image/jpeg' }));
              this.setState({image: window.tinyPicCache[picid], loading: false});
            }
          })
        }
      }
    }
  }

  handleIncrement = () => {
    const { item, onQuantityChange } = this.props;
    onQuantityChange(item.quantity + 1);
  };

  handleDecrement = () => {
    const { item, onQuantityChange } = this.props;
    if (item.quantity > 1) {
      onQuantityChange(item.quantity - 1);
    }
  };

  render() {
    const { item } = this.props;

    return (
      <>
        <ListItem 
          alignItems="flex-start"
          sx={{ py: 2, width: '100%' }}
        >
          <ListItemAvatar>
            <Avatar 
              variant="rounded" 
              alt={item.name} 
              src={this.state?.image} 
              sx={{ 
                width: 60, 
                height: 60, 
                mr: 2,
                bgcolor: 'primary.light',
                color: 'white'
              }}
            >
              
            </Avatar>
          </ListItemAvatar>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
            <Typography 
              variant="subtitle1" 
              component="div" 
              sx={{ fontWeight: 'bold', mb: 0.5 }}
            >
              <Link to={`/Artikel/${item.seoName}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {item.name}
              </Link>
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, mt: 1 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                component="div"
              >
                {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(item.price)} x {item.quantity}
              </Typography>
              <Typography 
                variant="body2" 
                color="primary.dark"
                fontWeight="bold"
                component="div"
              >
                {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(item.price * item.quantity)}
              </Typography>
            </Box>
            
            {/* Weight and VAT display - conditional layout based on weight */}
            {(item.weight > 0 || item.vat) && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: item.weight > 0 || (item.versandklasse && item.versandklasse != 'standard' && item.versandklasse != 'kostenlos') ? 'space-between' : 'flex-end', 
                mb: 1 
              }}>
                {item.weight > 0 && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    component="div"
                  >
                    {item.weight.toFixed(1).replace('.',',')} kg
                  </Typography>
                )}
                {item.versandklasse && item.versandklasse != 'standard' && item.versandklasse != 'kostenlos' && (
                  <Typography variant="body2" color="warning.main" fontWeight="medium" component="div">
                    {item.versandklasse}
                  </Typography>
                )}
                {item.vat && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    fontStyle="italic"
                    component="div"
                  >
                    inkl. {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(
                      (item.price * item.quantity) - ((item.price * item.quantity) / (1 + item.vat / 100))
                    )} MwSt. ({item.vat}%)
                  </Typography>               
                )}

              </Box>
            )}
            
            <Box sx={{ width: '250px'}}>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontStyle: "italic",
                  color: "text.secondary",
                  textAlign: "center",
                  mb: 1,
                  display: "block"
                }}
              >
                {this.props.id.toString().endsWith("steckling") ? "Lieferzeit: 14 Tage" :
                 item.available == 1 ? "Lieferzeit: 2-3 Tage" : 
                 item.availableSupplier == 1 ? "Lieferzeit: 7-9 Tage" : ""}
              </Typography>
              <AddToCartButton available={1} id={this.props.id} komponenten={item.komponenten} availableSupplier={item.availableSupplier} price={item.price} seoName={item.seoName} name={item.name} weight={item.weight} vat={item.vat} versandklasse={item.versandklasse}/>
            </Box>          
          </Box>         
        </ListItem>
      </>
    );
  }
}

export default CartItem; 