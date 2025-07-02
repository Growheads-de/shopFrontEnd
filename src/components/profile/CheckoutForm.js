import React, { Component } from "react";
import { Box, Typography, TextField, Checkbox, FormControlLabel, Button } from "@mui/material";
import AddressForm from "./AddressForm.js";
import DeliveryMethodSelector from "./DeliveryMethodSelector.js";
import PaymentMethodSelector from "./PaymentMethodSelector.js";
import OrderSummary from "./OrderSummary.js";

class CheckoutForm extends Component {
  render() {
    const {
      paymentMethod,
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      saveAddressForFuture,
      addressFormErrors,
      termsAccepted,
      note,
      deliveryMethod,
      hasStecklinge,
      isPickupOnly,
      deliveryCost,
      cartItems,
      displayError,
      isCompletingOrder,
      preSubmitError,
      onInvoiceAddressChange,
      onDeliveryAddressChange,
      onUseSameAddressChange,
      onSaveAddressForFutureChange,
      onTermsAcceptedChange,
      onNoteChange,
      onDeliveryMethodChange,
      onPaymentMethodChange,
      onCompleteOrder,
    } = this.props;

    return (
      <>
        {paymentMethod !== "cash" && (
          <>
            <AddressForm
              title="Rechnungsadresse"
              address={invoiceAddress}
              onChange={onInvoiceAddressChange}
              errors={addressFormErrors}
              namePrefix="invoice"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveAddressForFuture}
                  onChange={onSaveAddressForFutureChange}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
              }
              label={
                <Typography variant="body2">
                  Für zukünftige Bestellungen speichern
                </Typography>
              }
              sx={{ mb: 2 }}
            />
          </>
        )}

        {hasStecklinge && (
          <Typography
            variant="body1"
            sx={{ mb: 2, fontWeight: "bold", color: "#2e7d32" }}
          >
            Für welchen Termin ist die Abholung der Stecklinge
            gewünscht?
          </Typography>
        )}

        <TextField
          label="Anmerkung"
          name="note"
          value={note}
          onChange={onNoteChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          variant="outlined"
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />

        <DeliveryMethodSelector
          deliveryMethod={deliveryMethod}
          onChange={onDeliveryMethodChange}
          isPickupOnly={isPickupOnly || hasStecklinge}
        />

        {(deliveryMethod === "DHL" || deliveryMethod === "DPD") && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSameAddress}
                  onChange={onUseSameAddressChange}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                />
              }
              label={
                <Typography variant="body1">
                  Lieferadresse ist identisch mit Rechnungsadresse
                </Typography>
              }
              sx={{ mb: 2 }}
            />

            {!useSameAddress && (
              <AddressForm
                title="Lieferadresse"
                address={deliveryAddress}
                onChange={onDeliveryAddressChange}
                errors={addressFormErrors}
                namePrefix="delivery"
              />
            )}
          </>
        )}

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          onChange={onPaymentMethodChange}
          deliveryMethod={deliveryMethod}
          onDeliveryMethodChange={onDeliveryMethodChange}
          cartItems={cartItems}
          deliveryCost={deliveryCost}
        />

        <OrderSummary deliveryCost={deliveryCost} cartItems={cartItems} />

        <FormControlLabel
          control={
            <Checkbox
              checked={termsAccepted}
              onChange={onTermsAcceptedChange}
              sx={{ 
                '& .MuiSvgIcon-root': { fontSize: 28 },
                alignSelf: 'flex-start',
                mt: -0.5
              }}
            />
          }
          label={
            <Typography variant="body2">
              Ich habe die AGBs, die Datenschutzerklärung und die
              Bestimmungen zum Widerrufsrecht gelesen
            </Typography>
          }
          sx={{ mb: 3, mt: 2 }}
        />

        {/* @note Reserve space for error message to prevent layout shift */}
        <Box sx={{ minHeight: '24px', mb: 2, textAlign: "center" }}>
          {displayError && (
            <Typography color="error" sx={{ lineHeight: '24px' }}>
              {displayError}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
          onClick={onCompleteOrder}
          disabled={isCompletingOrder || !!preSubmitError}
        >
          {isCompletingOrder
            ? "Bestellung wird verarbeitet..."
            : "Bestellung abschließen"}
        </Button>
      </>
    );
  }
}

export default CheckoutForm; 