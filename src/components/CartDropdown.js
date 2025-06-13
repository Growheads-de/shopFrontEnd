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

    // Calculate the total weight of all items in the cart
    const totalWeight = Object.values(cartItems).reduce((sum, item) => {
      const weightPerItem = item.weight || 0;
      const quantity = item.quantity || 1;
      return sum + weightPerItem * quantity;
    }, 0);

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

            {/* Display total weight if greater than 0 */}
            {totalWeight > 0 && (
              <Typography variant="subtitle2" sx={{ px: 2, mb: 1 }}>
                Gesamtgewicht: {totalWeight.toFixed(2)} kg
              </Typography>
            )}

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