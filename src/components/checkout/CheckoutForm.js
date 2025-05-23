import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useStripe, useElements, IbanElement } from '@stripe/react-stripe-js';

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    const cartItems = window.cart || {};
    const totalAmount = props.total || Object.values(cartItems).reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    // Create payment intent via your backend
    props.socket.emit('createPaymentIntent', { 
      amount: totalAmount,
      deliveryMethod: props.deliveryMethod,
      paymentMethod: props.paymentMethod,
      invoiceAddress: props.invoiceAddress,
      deliveryAddress: props.deliveryAddress
    }, async (response) => {
      if (response.success) {
        const result = await stripe.confirmCardPayment(response.clientSecret, {
          payment_method: {
            card: elements.getElement(IbanElement),
            billing_details: {
              email: props.userEmail || '',
              name: `${props.invoiceAddress.firstName} ${props.invoiceAddress.lastName}`,
              address: {
                line1: `${props.invoiceAddress.street} ${props.invoiceAddress.houseNumber}`,
                postal_code: props.invoiceAddress.postalCode,
                city: props.invoiceAddress.city,
                country: 'DE',
              }
            },
          }
        });
        
        if (result.error) {
          setError(result.error.message || 'Ein Fehler ist aufgetreten');
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            // Payment successful, create order
            props.socket.emit('createOrder', { 
              cartItems,
              deliveryMethod: props.deliveryMethod,
              paymentMethod: props.paymentMethod,
              invoiceAddress: props.invoiceAddress,
              deliveryAddress: props.deliveryAddress,
              total: totalAmount
            }, (orderResponse) => {
              if (orderResponse.success) {
                setSuccess('Zahlung erfolgreich. Ihre Bestellung wurde aufgegeben!');
                // Clear cart
                window.cart = {};
                sessionStorage.setItem('cart', JSON.stringify({}));
                setTimeout(() => {
                  // Force a refresh to update the UI
                  window.location.reload();
                }, 2000);
              } else {
                setError('Zahlung erfolgreich, aber es gab ein Problem bei der Bestellerstellung');
              }
            });
          }
        }
      } else {
        setError(response.message || 'Es gab ein Problem bei der Zahlung');
      }
      setLoading(false);
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Lastschrift
      </Typography>
      
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 3 }}>
        <IbanElement 
          supportedCountries={['SEPA']} options={{
            supportedCountries: ['SEPA'],
            placeholderCountry: 'DE',
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </Box>
      
      <Button 
        type="submit" 
        variant="contained" 
        fullWidth
        disabled={!stripe || loading}
        sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
      >
        {loading ? <CircularProgress size={24} /> : 'Jetzt bezahlen'}
      </Button>
    </form>
  );
};

export default CheckoutForm; 