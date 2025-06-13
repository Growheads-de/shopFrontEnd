import React from 'react';
import { Box, Typography } from '@mui/material';

const PaymentMethodSelector = ({ paymentMethod, onChange }) => {
  const paymentOptions = [
    {
      id: 'Überweisung',
      name: 'Überweisung',
      description: 'Bezahlen Sie per Banküberweisung'
    },
    {
      id: 'Nachnahme',
      name: 'Nachnahme',
      description: 'Bezahlen Sie bei Lieferung'
    },
    {
      id: 'Filiale',
      name: 'Zahlung in der Filiale',
      description: 'Bei Abholung bezahlen'
    },
    {
      id: 'Onlinezahlung',
      name: 'Onlinezahlung',
      description: 'Kreditkarte, Lastschrift, etc.'
    }
  ];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Zahlungsart wählen
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {paymentOptions.map((option, index) => (
          <Box 
            key={option.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: index < paymentOptions.length - 1 ? 1 : 0, 
              p: 1, 
              border: '1px solid #e0e0e0', 
              borderRadius: 1 
            }}
          >
            <input
              type="radio"
              id={option.id}
              name="paymentMethod"
              value={option.id}
              checked={paymentMethod === option.id}
              onChange={onChange}
            />
            <Box sx={{ ml: 2 }}>
              <label htmlFor={option.id}>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">{option.description}</Typography>
              </label>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default PaymentMethodSelector; 