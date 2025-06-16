import React from 'react';
import { Box, Typography } from '@mui/material';

const DeliveryMethodSelector = ({ deliveryMethod, onChange }) => {
  const deliveryOptions = [
    {
      id: 'DHL',
      name: 'DHL',
      description: 'Standardversand',
      price: '€6,99'
    },
    {
      id: 'DPD',
      name: 'DPD',
      description: 'Standardversand',
      price: '€4,90'
    },
    {
      id: 'Sperrgut',
      name: 'Sperrgut',
      description: 'Für große und schwere Artikel',
      price: '€28,99',
      disabled: true
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
              borderRadius: 1,
              cursor: option.disabled ? 'not-allowed' : 'pointer',
              opacity: option.disabled ? 0.6 : 1,
              transition: 'all 0.2s ease-in-out',
              '&:hover': !option.disabled ? {
                backgroundColor: '#f5f5f5',
                borderColor: '#2e7d32',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              } : {},
              ...(deliveryMethod === option.id && !option.disabled && {
                backgroundColor: '#e8f5e8',
                borderColor: '#2e7d32'
              })
            }}
            onClick={!option.disabled ? () => onChange({ target: { value: option.id } }) : undefined}
          >
            <input
              type="radio"
              id={option.id}
              name="deliveryMethod"
              value={option.id}
              checked={deliveryMethod === option.id}
              onChange={onChange}
              disabled={option.disabled}
              style={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}
            />
            <Box sx={{ ml: 2, flexGrow: 1 }}>
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
            <Typography 
              variant="body1"
              sx={{ color: option.disabled ? '#999' : 'inherit' }}
            >
              {option.price}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default DeliveryMethodSelector; 