import React, { Component } from 'react';
import { 
  Box, 
  List, 
  Typography, 
  Button
} from '@mui/material';
import CartItem from './CartItem.js';


class CartDropdown extends Component {

  render() {
    const { cartItems = [], onClose, onCheckout } = this.props;
    console.log('cartItems', cartItems);

    return (
      <>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
          <Typography variant="h6">
            {Object.values(cartItems).length} {Object.values(cartItems).length === 1 ? 'Produkt' : 'Produkte'}
          </Typography>
        </Box>

        { cartItems && (
          <>
            <List sx={{ width: '100%' }}>
              {Object.keys(cartItems).map((item) => (
                <CartItem
                  key={item}
                  socket={this.props.socket}
                  item={cartItems[item]}
                  id={item}
                />
              ))}
            </List>

            {onClose && (
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={onClose}
              >
                Weiter einkaufen
              </Button>
            )}

            {onCheckout && Object.values(cartItems).length > 0 && (
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth
                sx={{ mt: 2 }}
                onClick={onCheckout}
              >
                Weiter zur Kasse
              </Button>
            )}
          </>
        )}
      </>
    );
  }
}

export default CartDropdown; 