import React, { Component } from 'react';
import { 
  Box, 
  List, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';
import CartItem from './CartItem.js';


class CartDropdown extends Component {

  render() {
    const { cartItems = [], onClose, onCheckout } = this.props;
    console.log('cartItems', cartItems);

    // Calculate the total weight of all items in the cart
    const totalWeight = cartItems.reduce((sum, item) => {
      const weightPerItem = item.weight || 0;
      const quantity = item.quantity || 1;
      return sum + weightPerItem * quantity;
    }, 0);

    // Calculate price breakdowns
    const priceCalculations = cartItems.reduce((acc, item) => {
      const totalItemPrice = item.price * item.quantity;
      const netPrice = totalItemPrice / (1 + item.vat / 100);
      const vatAmount = totalItemPrice - netPrice;
      
      acc.totalGross += totalItemPrice;
      acc.totalNet += netPrice;
      
      if (item.vat === 7) {
        acc.vat7 += vatAmount;
      } else if (item.vat === 19) {
        acc.vat19 += vatAmount;
      }
      
      return acc;
    }, { totalGross: 0, totalNet: 0, vat7: 0, vat19: 0 });

    return (
      <>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
          <Typography variant="h6">
            {cartItems.length} {cartItems.length === 1 ? 'Produkt' : 'Produkte'}
          </Typography>
        </Box>

        { cartItems && (
          <>
            <List sx={{ width: '100%' }}>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  socket={this.props.socket}
                  item={item}
                  id={item.id}
                />
              ))}
            </List>

            {/* Display total weight if greater than 0 */}
            {totalWeight > 0 && (
              <Typography variant="subtitle2" sx={{ px: 2, mb: 1 }}>
                Gesamtgewicht: {totalWeight.toFixed(2)} kg
              </Typography>
            )}

            {/* Price breakdown table */}
            {cartItems.length > 0 && (
              <Box sx={{ px: 2, mb: 2 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Gesamtnettopreis:</TableCell>
                      <TableCell align="right">
                        {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(priceCalculations.totalNet)}
                      </TableCell>
                    </TableRow>
                    {priceCalculations.vat7 > 0 && (
                      <TableRow>
                        <TableCell>7% Mehrwertsteuer:</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(priceCalculations.vat7)}
                        </TableCell>
                      </TableRow>
                    )}
                    {priceCalculations.vat19 > 0 && (
                      <TableRow>
                        <TableCell>19% Mehrwertsteuer:</TableCell>
                        <TableCell align="right">
                          {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(priceCalculations.vat19)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Gesamtbruttopreis ohne Versand:</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {new Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(priceCalculations.totalGross)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
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

            {onCheckout && cartItems.length > 0 && (
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