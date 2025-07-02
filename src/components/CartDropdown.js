import React, { Component } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import CartItem from './CartItem.js';


class CartDropdown extends Component {

  render() {
    const { 
      cartItems = [], 
      onClose, 
      onCheckout, 
      showDetailedSummary = false,
      deliveryMethod = '',
      deliveryCost = 0
    } = this.props;

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

    // Calculate detailed summary with shipping (similar to OrderSummary)
    const currencyFormatter = new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR' 
    });
    
    const shippingNetPrice = deliveryCost / (1 + 19 / 100);
    const shippingVat = deliveryCost - shippingNetPrice;
    const totalVat7 = priceCalculations.vat7;
    const totalVat19 = priceCalculations.vat19 + shippingVat;
    const totalGross = priceCalculations.totalGross + deliveryCost;

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
                {showDetailedSummary ? (
                  // Detailed summary with shipping costs
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Bestellübersicht
                    </Typography>
                    {deliveryMethod && (
                      <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                        Versandart: {deliveryMethod}
                      </Typography>
                    )}
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Waren (netto):</TableCell>
                          <TableCell align="right">
                            {currencyFormatter.format(priceCalculations.totalNet)}
                          </TableCell>
                        </TableRow>
                        {deliveryCost > 0 && (
                          <TableRow>
                            <TableCell>Versandkosten (netto):</TableCell>
                            <TableCell align="right">
                              {currencyFormatter.format(shippingNetPrice)}
                            </TableCell>
                          </TableRow>
                        )}
                        {totalVat7 > 0 && (
                          <TableRow>
                            <TableCell>7% Mehrwertsteuer:</TableCell>
                            <TableCell align="right">
                              {currencyFormatter.format(totalVat7)}
                            </TableCell>
                          </TableRow>
                        )}
                        {totalVat19 > 0 && (
                          <TableRow>
                            <TableCell>19% Mehrwertsteuer (inkl. Versand):</TableCell>
                            <TableCell align="right">
                              {currencyFormatter.format(totalVat19)}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Gesamtsumme Waren:</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {currencyFormatter.format(priceCalculations.totalGross)}
                          </TableCell>
                        </TableRow>
                        {deliveryCost > 0 && (
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Versandkosten:</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                              {currencyFormatter.format(deliveryCost)}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow sx={{ borderTop: '1px solid #e0e0e0' }}>
                          <TableCell sx={{ fontWeight: 'bold', pt: 2 }}>Gesamtsumme:</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', pt: 2 }}>
                            {currencyFormatter.format(totalGross)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  // Simple summary without shipping costs
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
                )}
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