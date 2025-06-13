import React from 'react';
import { Box, Typography } from '@mui/material';

const OrderSummary = ({ subtotal, deliveryCost }) => {
  const total = subtotal + deliveryCost;

  return (
    <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">Zwischensumme:</Typography>
        <Typography variant="body1">€{subtotal.toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">Versandkosten:</Typography>
        <Typography variant="body1">€{deliveryCost.toFixed(2)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="h6">Gesamtsumme:</Typography>
        <Typography variant="h6">€{total.toFixed(2)}</Typography>
      </Box>
    </Box>
  );
};

export default OrderSummary; 