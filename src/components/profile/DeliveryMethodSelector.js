import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';

const DeliveryMethodSelector = ({ deliveryMethod, onChange, isPickupOnly }) => {
  const deliveryOptions = [
    {
      id: 'DHL',
      name: 'DHL',
      description: isPickupOnly ? "nicht auswählbar weil ein oder mehrere Artikel nur abgeholt werden können" : 'Standardversand',
      price: '6,99 €',
      disabled: isPickupOnly
    },
    {
      id: 'DPD',
      name: 'DPD',
      description: isPickupOnly ? "nicht auswählbar weil ein oder mehrere Artikel nur abgeholt werden können" : 'Standardversand',
      price: '4,90 €',
      disabled: isPickupOnly
    },
    {
      id: 'Sperrgut',
      name: 'Sperrgut',
      description: 'Für große und schwere Artikel',
      price: '28,99 €',
      disabled: true,
      isCheckbox: true
    },
    {
      id: 'Abholung',
      name: 'Abholung in der Filiale',
      description: '',
      price: ''
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
              backgroundColor: option.disabled ? '#f5f5f5' : 'transparent',
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
            onClick={!option.disabled && !option.isCheckbox ? () => onChange({ target: { value: option.id } }) : undefined}
          >
            {option.isCheckbox ? (
              <Checkbox
                id={option.id}
                disabled={option.disabled}
                checked={false}
                sx={{ color: 'rgba(0, 0, 0, 0.54)' }}
              />
            ) : (
              <Radio
                id={option.id}
                name="deliveryMethod"
                value={option.id}
                checked={deliveryMethod === option.id}
                onChange={onChange}
                disabled={option.disabled}
                sx={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}
              />
            )}
            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <label 
                htmlFor={option.id} 
                style={{ 
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  color: option.disabled ? 'rgba(0, 0, 0, 0.54)' : 'inherit'
                }}
              >
                <Typography variant="body1" sx={{ color: 'inherit' }}>
                  {option.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ color: 'inherit' }}
                >
                  {option.description}
                </Typography>
              </label>
            </Box>
            <Typography 
              variant="body1"
              sx={{ color: option.disabled ? 'rgba(0, 0, 0, 0.54)' : 'inherit' }}
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