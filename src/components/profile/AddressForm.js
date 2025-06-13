import React from 'react';
import { Box, TextField, Typography } from '@mui/material';

const AddressForm = ({ title, address, onChange, errors, namePrefix }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <TextField
          label="Vorname"
          name="firstName"
          value={address.firstName}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}FirstName`]}
          helperText={errors[`${namePrefix}FirstName`]}
        />
        <TextField
          label="Nachname"
          name="lastName"
          value={address.lastName}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}LastName`]}
          helperText={errors[`${namePrefix}LastName`]}
        />
        <TextField
          label="Straße"
          name="street"
          value={address.street}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}Street`]}
          helperText={errors[`${namePrefix}Street`]}
        />
        <TextField
          label="Hausnummer"
          name="houseNumber"
          value={address.houseNumber}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}HouseNumber`]}
          helperText={errors[`${namePrefix}HouseNumber`]}
        />
        <TextField
          label="PLZ"
          name="postalCode"
          value={address.postalCode}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}PostalCode`]}
          helperText={errors[`${namePrefix}PostalCode`]}
        />
        <TextField
          label="Stadt"
          name="city"
          value={address.city}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}City`]}
          helperText={errors[`${namePrefix}City`]}
        />
        <TextField
          label="Land"
          name="country"
          value={address.country}
          onChange={onChange}
          fullWidth
          disabled
        />
      </Box>
    </>
  );
};

export default AddressForm; 