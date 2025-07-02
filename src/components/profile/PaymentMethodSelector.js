import React, { useEffect, useCallback } from "react";
import { Box, Typography, Radio } from "@mui/material";

const PaymentMethodSelector = ({ paymentMethod, onChange, deliveryMethod, onDeliveryMethodChange, cartItems = [], deliveryCost = 0 }) => {
  
  // Calculate total amount
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryCost;
  
  // Handle payment method changes with automatic delivery method adjustment
  const handlePaymentMethodChange = useCallback((event) => {
    const selectedPaymentMethod = event.target.value;
    
    // If "Zahlung in der Filiale" is selected, force delivery method to "Abholung"
    if (selectedPaymentMethod === "cash" && deliveryMethod !== "Abholung") {
      if (onDeliveryMethodChange) {
        onDeliveryMethodChange({ target: { value: "Abholung" } });
      }
    }
    
    onChange(event);
  }, [deliveryMethod, onDeliveryMethodChange, onChange]);

  // Handle delivery method changes - auto-switch to stripe when DHL/DPD is selected
  useEffect(() => {
    if ((deliveryMethod === "DHL" || deliveryMethod === "DPD") && paymentMethod === "cash") {
      handlePaymentMethodChange({ target: { value: "stripe" } });
    }
  }, [deliveryMethod, paymentMethod, handlePaymentMethodChange]);

  // Auto-switch to cash when total amount is 0
  useEffect(() => {
    if (totalAmount === 0 && paymentMethod !== "cash") {
      handlePaymentMethodChange({ target: { value: "cash" } });
    }
  }, [totalAmount, paymentMethod, handlePaymentMethodChange]);

  const paymentOptions = [
    {
      id: "wire",
      name: "Überweisung",
      description: "Bezahlen Sie per Banküberweisung",
      disabled: totalAmount === 0,
    },
    {
      id: "stripe",
      name: "Karte oder Sofortüberweisung",
      description: totalAmount < 0.50 && totalAmount > 0 
        ? "Bezahlen Sie per Karte oder Sofortüberweisung (Mindestbetrag: 0,50 €)"
        : "Bezahlen Sie per Karte oder Sofortüberweisung",
      disabled: totalAmount < 0.50 || (deliveryMethod !== "DHL" && deliveryMethod !== "DPD" && deliveryMethod !== "Abholung"),
      icons: [
        "/assets/images/giropay.png",
        "/assets/images/maestro.png",
        "/assets/images/mastercard.png",
        "/assets/images/visa_electron.png",
      ],
    },
    {
      id: "onDelivery",
      name: "Nachnahme",
      description: "Bezahlen Sie bei Lieferung (8,99 € Aufschlag)",
      disabled: totalAmount === 0 || deliveryMethod !== "DHL",
      icons: ["/assets/images/cash.png"],
    },
    {
      id: "cash",
      name: "Zahlung in der Filiale",
      description: "Bei Abholung bezahlen",
      disabled: false, // Always enabled
      icons: ["/assets/images/cash.png"],
    },
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
              display: "flex",
              alignItems: "center",
              mb: index < paymentOptions.length - 1 ? 1 : 0,
              p: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              cursor: option.disabled ? "not-allowed" : "pointer",
              opacity: option.disabled ? 0.6 : 1,
              transition: "all 0.2s ease-in-out",
              "&:hover": !option.disabled
                ? {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#2e7d32",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }
                : {},
              ...(paymentMethod === option.id &&
                !option.disabled && {
                  backgroundColor: "#e8f5e8",
                  borderColor: "#2e7d32",
                }),
            }}
            onClick={
              !option.disabled
                ? () => handlePaymentMethodChange({ target: { value: option.id } })
                : undefined
            }
          >
            <Radio
              id={option.id}
              name="paymentMethod"
              value={option.id}
              checked={paymentMethod === option.id}
              onChange={handlePaymentMethodChange}
              disabled={option.disabled}
              sx={{ cursor: option.disabled ? "not-allowed" : "pointer" }}
            />
            <Box sx={{ ml: 2, flex: 1 }}>
              <label
                htmlFor={option.id}
                style={{
                  cursor: option.disabled ? "not-allowed" : "pointer",
                  color: option.disabled ? "#999" : "inherit",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: option.disabled ? "#999" : "inherit" }}
                >
                  {option.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ color: option.disabled ? "#ccc" : "text.secondary" }}
                >
                  {option.description}
                </Typography>
              </label>
            </Box>
            {option.icons && (
              <Box
                sx={{ 
                  display: "flex", 
                  gap: 1, 
                  alignItems: "center",
                  flexWrap: "wrap",
                  ml: 2
                }}
              >
                {option.icons.map((iconPath, iconIndex) => (
                  <img
                    key={iconIndex}
                    src={iconPath}
                    alt={`Payment method ${iconIndex + 1}`}
                    style={{
                      height: "24px",
                      width: "auto",
                      opacity: option.disabled ? 0.5 : 1,
                      objectFit: "contain",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default PaymentMethodSelector;
