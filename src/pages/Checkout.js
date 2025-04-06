import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';

const steps = ['Shipping address', 'Payment details', 'Review your order'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    saveAddress: false,
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    saveCard: false,
    paymentMethod: 'credit'
  });

  // This would come from a cart context in a real app
  const cartItems = [
    { id: 1, name: 'Cannabis Seeds (OG Kush)', price: 49.99, quantity: 2 },
    { id: 5, name: 'Carbon Air Filter', price: 79.99, quantity: 1 }
  ];

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.07; // 7% tax rate
  };

  const calculateShipping = () => {
    return 10.00; // Fixed shipping cost for this example
  };

  const calculateTotal = (subtotal, tax, shipping) => {
    return subtotal + tax + shipping;
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping();
  const total = calculateTotal(subtotal, tax, shipping);

  // Form validation
  const isAddressValid = () => {
    const { firstName, lastName, address1, city, state, zip, country } = formData;
    return firstName && lastName && address1 && city && state && zip && country;
  };

  const isPaymentValid = () => {
    const { cardName, cardNumber, expDate, cvv } = formData;
    return cardName && cardNumber && expDate && cvv;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Shipping address
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="firstName"
                  name="firstName"
                  label="First name"
                  fullWidth
                  autoComplete="given-name"
                  variant="outlined"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="lastName"
                  name="lastName"
                  label="Last name"
                  fullWidth
                  autoComplete="family-name"
                  variant="outlined"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="address1"
                  name="address1"
                  label="Address line 1"
                  fullWidth
                  autoComplete="shipping address-line1"
                  variant="outlined"
                  value={formData.address1}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="address2"
                  name="address2"
                  label="Address line 2"
                  fullWidth
                  autoComplete="shipping address-line2"
                  variant="outlined"
                  value={formData.address2}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="city"
                  name="city"
                  label="City"
                  fullWidth
                  autoComplete="shipping address-level2"
                  variant="outlined"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="state"
                  name="state"
                  label="State/Province/Region"
                  fullWidth
                  variant="outlined"
                  value={formData.state}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="zip"
                  name="zip"
                  label="Zip / Postal code"
                  fullWidth
                  autoComplete="shipping postal-code"
                  variant="outlined"
                  value={formData.zip}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="country"
                  name="country"
                  label="Country"
                  fullWidth
                  autoComplete="shipping country"
                  variant="outlined"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      color="primary" 
                      name="saveAddress" 
                      checked={formData.saveAddress}
                      onChange={handleInputChange}
                    />
                  }
                  label="Use this address for payment details"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Payment method
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Select payment method</FormLabel>
              <RadioGroup
                aria-label="payment-method"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
              >
                <FormControlLabel value="credit" control={<Radio />} label="Credit card" />
                <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                <FormControlLabel value="bitcoin" control={<Radio />} label="Bitcoin" />
              </RadioGroup>
            </FormControl>

            {formData.paymentMethod === 'credit' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    id="cardName"
                    name="cardName"
                    label="Name on card"
                    fullWidth
                    autoComplete="cc-name"
                    variant="outlined"
                    value={formData.cardName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    id="cardNumber"
                    name="cardNumber"
                    label="Card number"
                    fullWidth
                    autoComplete="cc-number"
                    variant="outlined"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="expDate"
                    name="expDate"
                    label="Expiry date"
                    fullWidth
                    autoComplete="cc-exp"
                    variant="outlined"
                    value={formData.expDate}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="cvv"
                    name="cvv"
                    label="CVV"
                    helperText="Last three digits on signature strip"
                    fullWidth
                    autoComplete="cc-csc"
                    variant="outlined"
                    value={formData.cvv}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        color="primary" 
                        name="saveCard" 
                        checked={formData.saveCard}
                        onChange={handleInputChange}
                      />
                    }
                    label="Remember credit card details for next time"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" gutterBottom>
              Order summary
            </Typography>
            <List disablePadding>
              {cartItems.map((item) => (
                <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography variant="body2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}

              <Divider sx={{ my: 2 }} />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Subtotal" />
                <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Tax (7%)" />
                <Typography variant="body2">${tax.toFixed(2)}</Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Shipping" />
                <Typography variant="body2">${shipping.toFixed(2)}</Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ${total.toFixed(2)}
                </Typography>
              </ListItem>
            </List>

            <Grid container spacing={2} sx={{ mt: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Shipping
                </Typography>
                <Typography gutterBottom>{formData.firstName} {formData.lastName}</Typography>
                <Typography gutterBottom>{formData.address1}</Typography>
                {formData.address2 && <Typography gutterBottom>{formData.address2}</Typography>}
                <Typography gutterBottom>
                  {formData.city}, {formData.state} {formData.zip}
                </Typography>
                <Typography gutterBottom>{formData.country}</Typography>
              </Grid>
              
              <Grid item container direction="column" xs={12} sm={6}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Payment details
                </Typography>
                {formData.paymentMethod === 'credit' ? (
                  <>
                    <Typography gutterBottom>Card type: Visa</Typography>
                    <Typography gutterBottom>Card holder: {formData.cardName}</Typography>
                    <Typography gutterBottom>
                      Card number: xxxx-xxxx-xxxx-{formData.cardNumber.slice(-4)}
                    </Typography>
                    <Typography gutterBottom>Expiry date: {formData.expDate}</Typography>
                  </>
                ) : (
                  <Typography gutterBottom>
                    {formData.paymentMethod === 'paypal' ? 'PayPal' : 'Bitcoin'}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Your order has been placed successfully!
            </Alert>
            <Typography variant="h5" gutterBottom>
              Thank you for your order.
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Your order number is #2001539. We have emailed your order
              confirmation, and will send you an update when your order has
              shipped.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/"
              sx={{ mt: 3 }}
            >
              Return to Home
            </Button>
          </Box>
        ) : (
          <>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && !isAddressValid()) ||
                  (activeStep === 1 && formData.paymentMethod === 'credit' && !isPaymentValid())
                }
              >
                {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout; 