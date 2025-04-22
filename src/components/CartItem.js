import React, { Component } from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  Avatar,
  Typography, 
  Box
} from '@mui/material';
import AddToCartButton from './AddToCartButton.js';

class CartItem extends Component {
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

    console.log('item', item,this.props.key);
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
              src={item.image} 
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
              {item.name}
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
            <Box sx={{ width: '250px'}}>
              <AddToCartButton available={1} id={this.props.id} price={item.price} name={item.name}/>
            </Box>          
          </Box>         
        </ListItem>
      </>
    );
  }
}

export default CartItem; 