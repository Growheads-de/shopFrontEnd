import React from 'react';
import { Box, Typography } from '@mui/material';

const DeliveryMethodSelector = ({ deliveryMethod, onChange }) => {
  const deliveryOptions = [
    {
      id: 'DHL',
      name: 'DHL',
      description: 'Standardversand',
      price: '€5,90'
    },
    {
      id: 'DPD',
      name: 'DPD',
      description: 'Standardversand',
      price: '€4,90'
    },
    {
      id: 'Abholung',
      name: 'Abholung in der Filiale',
      description: 'Verfügbar ab dem nächsten Werktag',
      price: '€0,00'
    }
  ];

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Versandart wählen
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        {deliveryOptions.map((option, index) => (
          <Box 
            key={option.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: index < deliveryOptions.length - 1 ? 1 : 0, 
              p: 1, 
              border: '1px solid #e0e0e0', 
              borderRadius: 1 
            }}
          >
            <input
              type="radio"
              id={option.id}
              name="deliveryMethod"
              value={option.id}
              checked={deliveryMethod === option.id}
              onChange={onChange}
            />
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <label htmlFor={option.id}>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">{option.description}</Typography>
              </label>
            </Box>
            <Typography variant="body1">{option.price}</Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default DeliveryMethodSelector; 