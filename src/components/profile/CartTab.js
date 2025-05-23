import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button
} from '@mui/material';
import CartDropdown from '../CartDropdown.js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../checkout/CheckoutForm.js';
import SocketContext from '../../contexts/SocketContext.js';

// Stripe promise
const stripePromise = loadStripe('pk_test_51R7lltRtpe3h1vwJzIrDb5bcEigTLBHrtqj9SiPX7FOEATSuD6oJmKc8xpNp49ShpGJZb2GShHIUqj4zlSIz4olj00ipOuOAnu');

class CartTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCheckingOut: false,
      cartItems: window.cart || {},
      deliveryMethod: 'DHL',
      paymentMethod: 'Onlinezahlung',
      showPaymentForm: false,
      invoiceAddress: {
        firstName: '',
        lastName: '',
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        country: 'Deutschland'
      },
      deliveryAddress: {
        firstName: '',
        lastName: '',
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        country: 'Deutschland'
      },
      useSameAddress: true,
      addressFormErrors: {}
    };
  }
  
  componentDidMount() { 
    this.cart = () => {
      this.setState({cartItems: window.cart || {}});
    };
    window.addEventListener('cart', this.cart);
  }

  componentWillUnmount() {
    window.removeEventListener('cart', this.cart);
  }

  handleCheckout = () => {
    this.setState({ isCheckingOut: true });
  };
  
  handleContinueShopping = () => {
    this.setState({ isCheckingOut: false });
  };

  handleDeliveryMethodChange = (event) => {
    this.setState({ deliveryMethod: event.target.value });
  };

  handlePaymentMethodChange = (event) => {
    const paymentMethod = event.target.value;
    this.setState({ 
      paymentMethod,
      showPaymentForm: paymentMethod === 'Onlinezahlung'
    });
  };

  handleInvoiceAddressChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      invoiceAddress: {
        ...prevState.invoiceAddress,
        [name]: value
      }
    }));
  };

  handleDeliveryAddressChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      deliveryAddress: {
        ...prevState.deliveryAddress,
        [name]: value
      }
    }));
  };

  handleUseSameAddressChange = (e) => {
    const useSameAddress = e.target.checked;
    this.setState({ 
      useSameAddress,
      deliveryAddress: useSameAddress ? this.state.invoiceAddress : this.state.deliveryAddress
    });
  };

  validateAddressForm = () => {
    const { invoiceAddress, deliveryAddress, useSameAddress, deliveryMethod } = this.state;
    const errors = {};
    
    // Validate invoice address
    if (!invoiceAddress.firstName) errors.invoiceFirstName = 'Vorname erforderlich';
    if (!invoiceAddress.lastName) errors.invoiceLastName = 'Nachname erforderlich';
    if (!invoiceAddress.street) errors.invoiceStreet = 'Straße erforderlich';
    if (!invoiceAddress.houseNumber) errors.invoiceHouseNumber = 'Hausnummer erforderlich';
    if (!invoiceAddress.postalCode) errors.invoicePostalCode = 'PLZ erforderlich';
    if (!invoiceAddress.city) errors.invoiceCity = 'Stadt erforderlich';
    
    // Validate delivery address for shipping methods that require it
    if (!useSameAddress && (deliveryMethod === 'DHL' || deliveryMethod === 'DPD')) {
      if (!deliveryAddress.firstName) errors.deliveryFirstName = 'Vorname erforderlich';
      if (!deliveryAddress.lastName) errors.deliveryLastName = 'Nachname erforderlich';
      if (!deliveryAddress.street) errors.deliveryStreet = 'Straße erforderlich';
      if (!deliveryAddress.houseNumber) errors.deliveryHouseNumber = 'Hausnummer erforderlich';
      if (!deliveryAddress.postalCode) errors.deliveryPostalCode = 'PLZ erforderlich';
      if (!deliveryAddress.city) errors.deliveryCity = 'Stadt erforderlich';
    }
    
    this.setState({ addressFormErrors: errors });
    return Object.keys(errors).length === 0;
  };

  handleCompleteOrder = () => {
    // Validate address form
    if (!this.validateAddressForm()) {
      return;
    }
    
    const { deliveryMethod, paymentMethod } = this.state;
    
    alert(`Bestellung mit ${paymentMethod} wird verarbeitet. Versandart: ${deliveryMethod}`);
    
    // Here you would typically send the order data to your backend
    // socket.emit('createOrder', { invoiceAddress, deliveryAddress: useSameAddress ? invoiceAddress : deliveryAddress, ... })
  };

  getDeliveryCost = () => {
    switch(this.state.deliveryMethod) {
      case 'DHL':
        return 5.90;
      case 'DPD':
        return 4.90;
      case 'Abholung':
        return 0;
      default:
        return 5.90;
    }
  };
  
  render() {
    const { 
      cartItems, 
      deliveryMethod, 
      paymentMethod, 
      showPaymentForm,
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      addressFormErrors
    } = this.state;
    
    const deliveryCost = this.getDeliveryCost();
    
    // Calculate subtotal from cart items
    const subtotal = Object.values(cartItems).reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
    
    // Add delivery cost to get total
    const total = subtotal + deliveryCost;
 
    return (
      <Box sx={{ p: 3 }}>
        <CartDropdown 
          cartItems={cartItems}
        />
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Rechnungsadresse
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              label="Vorname"
              name="firstName"
              value={invoiceAddress.firstName}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoiceFirstName}
              helperText={addressFormErrors.invoiceFirstName}
            />
            <TextField
              label="Nachname"
              name="lastName"
              value={invoiceAddress.lastName}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoiceLastName}
              helperText={addressFormErrors.invoiceLastName}
            />
            <TextField
              label="Straße"
              name="street"
              value={invoiceAddress.street}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoiceStreet}
              helperText={addressFormErrors.invoiceStreet}
            />
            <TextField
              label="Hausnummer"
              name="houseNumber"
              value={invoiceAddress.houseNumber}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoiceHouseNumber}
              helperText={addressFormErrors.invoiceHouseNumber}
            />
            <TextField
              label="PLZ"
              name="postalCode"
              value={invoiceAddress.postalCode}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoicePostalCode}
              helperText={addressFormErrors.invoicePostalCode}
            />
            <TextField
              label="Stadt"
              name="city"
              value={invoiceAddress.city}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              error={!!addressFormErrors.invoiceCity}
              helperText={addressFormErrors.invoiceCity}
            />
            <TextField
              label="Land"
              name="country"
              value={invoiceAddress.country}
              onChange={this.handleInvoiceAddressChange}
              fullWidth
              disabled
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Versandart wählen
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="DHL"
                name="deliveryMethod"
                value="DHL"
                checked={deliveryMethod === 'DHL'}
                onChange={this.handleDeliveryMethodChange}
              />
              <Box sx={{ ml: 2, flexGrow: 1 }}>
                <label htmlFor="DHL">
                  <Typography variant="body1">DHL</Typography>
                  <Typography variant="body2" color="text.secondary">Standardversand</Typography>
                </label>
              </Box>
              <Typography variant="body1">€5,90</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="DPD"
                name="deliveryMethod"
                value="DPD"
                checked={deliveryMethod === 'DPD'}
                onChange={this.handleDeliveryMethodChange}
              />
              <Box sx={{ ml: 2, flexGrow: 1 }}>
                <label htmlFor="DPD">
                  <Typography variant="body1">DPD</Typography>
                  <Typography variant="body2" color="text.secondary">Standardversand</Typography>
                </label>
              </Box>
              <Typography variant="body1">€4,90</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="Abholung"
                name="deliveryMethod"
                value="Abholung"
                checked={deliveryMethod === 'Abholung'}
                onChange={this.handleDeliveryMethodChange}
              />
              <Box sx={{ ml: 2, flexGrow: 1 }}>
                <label htmlFor="Abholung">
                  <Typography variant="body1">Abholung in der Filiale</Typography>
                  <Typography variant="body2" color="text.secondary">Verfügbar ab dem nächsten Werktag</Typography>
                </label>
              </Box>
              <Typography variant="body1">€0,00</Typography>
            </Box>
          </Box>
          
          {(deliveryMethod === 'DHL' || deliveryMethod === 'DPD') && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <input
                  type="checkbox"
                  id="useSameAddress"
                  checked={useSameAddress}
                  onChange={this.handleUseSameAddressChange}
                />
                <label htmlFor="useSameAddress">
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    Lieferadresse ist identisch mit Rechnungsadresse
                  </Typography>
                </label>
              </Box>

              {!useSameAddress && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Lieferadresse
                  </Typography>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                    <TextField
                      label="Vorname"
                      name="firstName"
                      value={deliveryAddress.firstName}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryFirstName}
                      helperText={addressFormErrors.deliveryFirstName}
                    />
                    <TextField
                      label="Nachname"
                      name="lastName"
                      value={deliveryAddress.lastName}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryLastName}
                      helperText={addressFormErrors.deliveryLastName}
                    />
                    <TextField
                      label="Straße"
                      name="street"
                      value={deliveryAddress.street}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryStreet}
                      helperText={addressFormErrors.deliveryStreet}
                    />
                    <TextField
                      label="Hausnummer"
                      name="houseNumber"
                      value={deliveryAddress.houseNumber}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryHouseNumber}
                      helperText={addressFormErrors.deliveryHouseNumber}
                    />
                    <TextField
                      label="PLZ"
                      name="postalCode"
                      value={deliveryAddress.postalCode}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryPostalCode}
                      helperText={addressFormErrors.deliveryPostalCode}
                    />
                    <TextField
                      label="Stadt"
                      name="city"
                      value={deliveryAddress.city}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      error={!!addressFormErrors.deliveryCity}
                      helperText={addressFormErrors.deliveryCity}
                    />
                    <TextField
                      label="Land"
                      name="country"
                      value={deliveryAddress.country}
                      onChange={this.handleDeliveryAddressChange}
                      fullWidth
                      disabled
                    />
                  </Box>
                </>
              )}
            </>
          )}
          
          <Typography variant="h6" gutterBottom>
            Zahlungsart wählen
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="Überweisung"
                name="paymentMethod"
                value="Überweisung"
                checked={paymentMethod === 'Überweisung'}
                onChange={this.handlePaymentMethodChange}
              />
              <Box sx={{ ml: 2 }}>
                <label htmlFor="Überweisung">
                  <Typography variant="body1">Überweisung</Typography>
                  <Typography variant="body2" color="text.secondary">Bezahlen Sie per Banküberweisung</Typography>
                </label>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="Nachnahme"
                name="paymentMethod"
                value="Nachnahme"
                checked={paymentMethod === 'Nachnahme'}
                onChange={this.handlePaymentMethodChange}
              />
              <Box sx={{ ml: 2 }}>
                <label htmlFor="Nachnahme">
                  <Typography variant="body1">Nachnahme</Typography>
                  <Typography variant="body2" color="text.secondary">Bezahlen Sie bei Lieferung</Typography>
                </label>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="Filiale"
                name="paymentMethod"
                value="Filiale"
                checked={paymentMethod === 'Filiale'}
                onChange={this.handlePaymentMethodChange}
              />
              <Box sx={{ ml: 2 }}>
                <label htmlFor="Filiale">
                  <Typography variant="body1">Zahlung in der Filiale</Typography>
                  <Typography variant="body2" color="text.secondary">Bei Abholung bezahlen</Typography>
                </label>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <input
                type="radio"
                id="Onlinezahlung"
                name="paymentMethod"
                value="Onlinezahlung"
                checked={paymentMethod === 'Onlinezahlung'}
                onChange={this.handlePaymentMethodChange}
              />
              <Box sx={{ ml: 2 }}>
                <label htmlFor="Onlinezahlung">
                  <Typography variant="body1">Onlinezahlung</Typography>
                  <Typography variant="body2" color="text.secondary">Kreditkarte, Lastschrift, etc.</Typography>
                </label>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ my: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Zwischensumme:</Typography>
              <Typography variant="body1">€{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Versandkosten:</Typography>
              <Typography variant="body1">€{deliveryCost.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="h6">Gesamtsumme:</Typography>
              <Typography variant="h6">€{total.toFixed(2)}</Typography>
            </Box>
          </Box>

          {showPaymentForm && (
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                socket={this.context}
                userEmail={sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).email : ''}
                deliveryMethod={deliveryMethod}
                paymentMethod={paymentMethod}
                total={total}
                invoiceAddress={invoiceAddress}
                deliveryAddress={useSameAddress ? invoiceAddress : deliveryAddress}
              />
            </Elements>
          )}
          
          {!showPaymentForm && (
            <Button 
              variant="contained" 
              fullWidth
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
              onClick={this.handleCompleteOrder}
            >
              Bestellung abschließen
            </Button>
          )}
        </Paper>
      </Box>
    );
  }
}

// Set static contextType to access the socket
CartTab.contextType = SocketContext;

export default CartTab; 