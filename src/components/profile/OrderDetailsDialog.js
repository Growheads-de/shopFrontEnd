import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const OrderDetailsDialog = ({ open, onClose, order }) => {
  if (!order) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

  const handleCancelOrder = () => {
    // Implement order cancellation logic here
    console.log(`Cancel order: ${order.orderId}`);
    onClose(); // Close the dialog after action
  };
  
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity_ordered, 0);
  const total = subtotal + order.delivery_cost;

  // Calculate VAT breakdown similar to CartDropdown
  const vatCalculations = order.items.reduce((acc, item) => {
    const totalItemPrice = item.price * item.quantity_ordered;
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Bestelldetails: {order.orderId}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Lieferadresse</Typography>
          <Typography>{order.shipping_address_name}</Typography>
          <Typography>{order.shipping_address_street} {order.shipping_address_house_number}</Typography>
          <Typography>{order.shipping_address_postal_code} {order.shipping_address_city}</Typography>
          <Typography>{order.shipping_address_country}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Rechnungsadresse</Typography>
          <Typography>{order.invoice_address_name}</Typography>
          <Typography>{order.invoice_address_street} {order.invoice_address_house_number}</Typography>
          <Typography>{order.invoice_address_postal_code} {order.invoice_address_city}</Typography>
          <Typography>{order.invoice_address_country}</Typography>
        </Box>

        {/* Order Details Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>Bestelldetails</Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Lieferart:</Typography>
              <Typography variant="body1">{order.deliveryMethod || order.delivery_method || 'Nicht angegeben'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Zahlungsart:</Typography>
              <Typography variant="body1">{order.paymentMethod || order.payment_method || 'Nicht angegeben'}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>Bestellte Artikel</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Artikel</TableCell>
                <TableCell align="right">Menge</TableCell>
                <TableCell align="right">Preis</TableCell>
                <TableCell align="right">Gesamt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity_ordered}</TableCell>
                  <TableCell align="right">{currencyFormatter.format(item.price)}</TableCell>
                  <TableCell align="right">{currencyFormatter.format(item.price * item.quantity_ordered)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Gesamtnettopreis</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{currencyFormatter.format(vatCalculations.totalNet)}</Typography>
                </TableCell>
              </TableRow>
              {vatCalculations.vat7 > 0 && (
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">7% Mehrwertsteuer</TableCell>
                  <TableCell align="right">{currencyFormatter.format(vatCalculations.vat7)}</TableCell>
                </TableRow>
              )}
              {vatCalculations.vat19 > 0 && (
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">19% Mehrwertsteuer</TableCell>
                  <TableCell align="right">{currencyFormatter.format(vatCalculations.vat19)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Zwischensumme</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{currencyFormatter.format(subtotal)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">Lieferkosten</TableCell>
                <TableCell align="right">{currencyFormatter.format(order.delivery_cost)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Gesamtsumme</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">{currencyFormatter.format(total)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

      </DialogContent>
      <DialogActions>
        {order.status === 'new' && (
          <Button onClick={handleCancelOrder} color="error">
            Bestellung stornieren
          </Button>
        )}
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog; 