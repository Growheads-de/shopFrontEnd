import React from "react";
import { Box, TextField, Typography } from "@mui/material";

const AddressForm = ({ title, address, onChange, errors, namePrefix }) => {
  // Helper function to determine if a required field should show error styling
  const getRequiredFieldError = (fieldName, value) => {
    const isEmpty = !value || value.trim() === "";
    return isEmpty;
  };

  // Helper function to get label styling for required fields
  const getRequiredFieldLabelSx = (fieldName, value) => {
    const showError = getRequiredFieldError(fieldName, value);
    return showError
      ? {
          "&.MuiInputLabel-shrink": {
            color: "#d32f2f", // Material-UI error color
          },
        }
      : {};
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mt: 3,
          mb: 2,
        }}
      >
        <TextField
          label="Vorname"
          name="firstName"
          value={address.firstName}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}FirstName`]}
          helperText={errors[`${namePrefix}FirstName`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("firstName", address.firstName),
          }}
        />
        <TextField
          label="Nachname"
          name="lastName"
          value={address.lastName}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}LastName`]}
          helperText={errors[`${namePrefix}LastName`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("lastName", address.lastName),
          }}
        />
        <TextField
          label="Adresszusatz"
          name="addressAddition"
          value={address.addressAddition || ""}
          onChange={onChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Straße"
          name="street"
          value={address.street}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}Street`]}
          helperText={errors[`${namePrefix}Street`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("street", address.street),
          }}
        />
        <TextField
          label="Hausnummer"
          name="houseNumber"
          value={address.houseNumber}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}HouseNumber`]}
          helperText={errors[`${namePrefix}HouseNumber`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("houseNumber", address.houseNumber),
          }}
        />
        <TextField
          label="PLZ"
          name="postalCode"
          value={address.postalCode}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}PostalCode`]}
          helperText={errors[`${namePrefix}PostalCode`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("postalCode", address.postalCode),
          }}
        />
        <TextField
          label="Stadt"
          name="city"
          value={address.city}
          onChange={onChange}
          fullWidth
          error={!!errors[`${namePrefix}City`]}
          helperText={errors[`${namePrefix}City`]}
          InputLabelProps={{
            shrink: true,
            sx: getRequiredFieldLabelSx("city", address.city),
          }}
        />
        <TextField
          label="Land"
          name="country"
          value={address.country}
          onChange={onChange}
          fullWidth
          disabled
          InputLabelProps={{ shrink: true }}
        />
      </Box>
    </>
  );
};

export default AddressForm;
