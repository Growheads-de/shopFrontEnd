import React, { Component, useState } from "react";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@mui/material";
import config from "../config.js";

import { useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/profile?complete`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button variant="contained" disabled={!stripe} style={{ marginTop: "20px" }} type="submit">
        Bezahlung Abschließen
      </Button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

class Stripe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stripe: null,
      loading: true,
      elements: null,
    };
    this.stripePromise = loadStripe(config.stripePublishableKey);
  }

  componentDidMount() {
    this.stripePromise.then((stripe) => {
      this.setState({ stripe, loading: false });
    });
  }

  render() {
    const { clientSecret } = this.props;

    return (
      <>
        {this.state.loading ? (
          <div>Loading...</div>
        ) : (
          <Elements
            stripe={this.stripePromise}
            options={{
              appearance: {
                theme: "stripe",
                variables: {
                  // Core colors matching your green theme
                  colorPrimary: '#2E7D32',           // Your primary forest green
                  colorBackground: '#ffffff',        // White background (matches your paper color)
                  colorText: '#33691E',             // Your primary text color (dark green)
                  colorTextSecondary: '#558B2F',    // Your secondary text color
                  colorTextPlaceholder: '#81C784',  // Light green for placeholder text
                  colorDanger: '#D32F2F',           // Your error color (red)
                  colorSuccess: '#43A047',          // Your success color
                  colorWarning: '#FF9800',          // Orange for warnings
                  
                  // Typography matching your Roboto setup
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSizeBase: '16px',             // Base font size for mobile compatibility
                  fontWeightNormal: '400',          // Normal Roboto weight
                  fontWeightMedium: '500',          // Medium Roboto weight
                  fontWeightBold: '700',            // Bold Roboto weight
                  
                  // Layout and spacing
                  spacingUnit: '4px',               // Consistent spacing
                  borderRadius: '8px',              // Rounded corners matching your style
                  
                  // Background variations
                  colorBackgroundDeemphasized: '#C8E6C9', // Your light green background
                  
                  // Focus and interaction states
                  focusBoxShadow: '0 0 0 2px #4CAF50', // Green focus ring
                  focusOutline: 'none',
                  
                  // Icons to match your green theme
                  iconColor: '#558B2F',             // Secondary green for icons
                  iconHoverColor: '#2E7D32',        // Primary green on hover
                }
              },
              clientSecret: clientSecret,
            }}
          >
            <CheckoutForm />
          </Elements>
        )}
      </>
    );
  }
}

export default Stripe;
