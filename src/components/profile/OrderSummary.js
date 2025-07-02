import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

const OrderSummary = ({ deliveryCost, cartItems = [] }) => {
  const currencyFormatter = new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR' 
  });

  // Calculate VAT breakdown for cart items (similar to CartDropdown)
  const cartVatCalculations = cartItems.reduce((acc, item) => {
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

  // Calculate shipping VAT (19% VAT for shipping costs)
  const shippingNetPrice = deliveryCost / (1 + 19 / 100);
  const shippingVat = deliveryCost - shippingNetPrice;

  // Combine totals - add shipping VAT to the 19% VAT total
  const totalVat7 = cartVatCalculations.vat7;
  const totalVat19 = cartVatCalculations.vat19 + shippingVat;
  const totalGross = cartVatCalculations.totalGross + deliveryCost;

  return (
    <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Bestellübersicht
      </Typography>
      
      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell>Waren (netto):</TableCell>
            <TableCell align="right">
              {currencyFormatter.format(cartVatCalculations.totalNet)}
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
              {currencyFormatter.format(cartVatCalculations.totalGross)}
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
    </Box>
  );
};

export default OrderSummary; 