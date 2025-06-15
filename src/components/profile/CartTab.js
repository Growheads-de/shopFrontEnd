import React, { Component } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button
} from '@mui/material';
import CartDropdown from '../CartDropdown.js';
import AddressForm from './AddressForm.js';
import DeliveryMethodSelector from './DeliveryMethodSelector.js';
import PaymentMethodSelector from './PaymentMethodSelector.js';
import OrderSummary from './OrderSummary.js';
import SocketContext from '../../contexts/SocketContext.js';

class CartTab extends Component {
  constructor(props) {
    super(props);
    console.log('Ycart', window.cart);
    this.state = {
      isCheckingOut: false,
      cartItems: Array.isArray(window.cart) ? window.cart : [],
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
      console.log('Xcart', window.cart);
      this.setState({ cartItems: Array.isArray(window.cart) ? window.cart : [] });
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
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );
 
    return (
      <Box sx={{ p: 3 }}>
        <CartDropdown 
          cartItems={cartItems} socket={this.context}
        />
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <AddressForm
            title="Rechnungsadresse"
            address={invoiceAddress}
            onChange={this.handleInvoiceAddressChange}
            errors={addressFormErrors}
            namePrefix="invoice"
          />

          <DeliveryMethodSelector
            deliveryMethod={deliveryMethod}
            onChange={this.handleDeliveryMethodChange}
          />
          
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
                <AddressForm
                  title="Lieferadresse"
                  address={deliveryAddress}
                  onChange={this.handleDeliveryAddressChange}
                  errors={addressFormErrors}
                  namePrefix="delivery"
                />
              )}
            </>
          )}
          
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            onChange={this.handlePaymentMethodChange}
          />
          
          <OrderSummary
            subtotal={subtotal}
            deliveryCost={deliveryCost}
          />

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