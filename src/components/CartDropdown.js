import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  List, 
  Divider, 
  Typography, 
  Button
} from '@mui/material';
import CartItem from './CartItem.js';

class CartDropdown extends Component {
  calculateTotal = () => {
    const { cartItems } = this.props;
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  getTotalItems = () => {
    const { cartItems } = this.props;
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  render() {
    const { cartItems = [], onClose, onQuantityChange, onRemoveItem } = this.props;
    const totalItems = this.getTotalItems();
    const totalPrice = this.calculateTotal();
    
    // Debug output to console
    console.log('CartDropdown render:', { cartItems, totalItems });

    return (
      <Paper
        elevation={5}
        sx={{
          width: '100%',
          maxHeight: '70vh',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
          <Typography variant="h6">
            Your Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </Typography>
        </Box>

        {(!cartItems || cartItems.length === 0) ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Your cart is empty</Typography>
            <Button 
              color="primary" 
              onClick={onClose} 
              sx={{ mt: 2 }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <>
            <List 
              sx={{ 
                maxHeight: 350, 
                overflow: 'auto',
                px: 2,
                py: 1
              }}
            >
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => onQuantityChange(item.id, qty)}
                  onRemove={() => onRemoveItem(item.id)}
                />
              ))}
            </List>

            <Divider />

            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary.dark" fontWeight="bold">
                  ${totalPrice.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => alert('Checkout functionality would go here')}
                >
                  Checkout
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    );
  }
}

export default CartDropdown; 