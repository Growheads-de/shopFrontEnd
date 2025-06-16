import React from 'react';
import { Box, Typography } from '@mui/material';

const PaymentMethodSelector = ({ paymentMethod, onChange, deliveryMethod }) => {
  const paymentOptions = [
    {
      id: 'Überweisung',
      name: 'Überweisung',
      description: 'Bezahlen Sie per Banküberweisung'
    },
    {
      id: 'Nachnahme',
      name: 'Nachnahme',
      description: 'Bezahlen Sie bei Lieferung (8,99 € Aufschlag)',
      disabled: deliveryMethod !== 'DHL'
    },
    {
      id: 'Filiale',
      name: 'Zahlung in der Filiale',
      description: 'Bei Abholung bezahlen',
      disabled: deliveryMethod !== 'Abholung'
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
              borderRadius: 1,
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.6 : 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': !option.disabled ? {
                backgroundColor: '#f5f5f5',
                borderColor: '#2e7d32',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              } : {},
              ...(paymentMethod === option.id && !option.disabled && {
                backgroundColor: '#e8f5e8',
                borderColor: '#2e7d32'
              })
            }}
            onClick={!option.disabled ? () => onChange({ target: { value: option.id } }) : undefined}
          >
            <input
              type="radio"
              id={option.id}
              name="paymentMethod"
              value={option.id}
              checked={paymentMethod === option.id}
              onChange={onChange}
              disabled={option.disabled}
              style={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}
            />
            <Box sx={{ ml: 2 }}>
              <label 
                htmlFor={option.id} 
                style={{ 
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  color: option.disabled ? '#999' : 'inherit'
                }}
              >
                <Typography variant="body1" sx={{ color: option.disabled ? '#999' : 'inherit' }}>
                  {option.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ color: option.disabled ? '#ccc' : 'text.secondary' }}
                >
                  {option.description}
                </Typography>
              </label>
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default PaymentMethodSelector; 