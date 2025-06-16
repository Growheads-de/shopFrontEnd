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

  const handleCancelOrder = () => {
    // Implement order cancellation logic here
    console.log(`Cancel order: ${order.orderId}`);
    onClose(); // Close the dialog after action
  };
  
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity_ordered, 0);
  const total = subtotal + order.delivery_cost;

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
                  <TableCell align="right">€{item.price.toFixed(2)}</TableCell>
                  <TableCell align="right">€{(item.price * item.quantity_ordered).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Zwischensumme</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">€{subtotal.toFixed(2)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">Lieferkosten</TableCell>
                <TableCell align="right">€{order.delivery_cost.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right">
                  <Typography fontWeight="bold">Gesamtsumme</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">€{total.toFixed(2)}</Typography>
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