import React, { Component } from "react";
import { Box, Typography, Button } from "@mui/material";
import CartDropdown from "../CartDropdown.js";
import CheckoutForm from "./CheckoutForm.js";
import PaymentConfirmationDialog from "./PaymentConfirmationDialog.js";
import OrderProcessingService from "./OrderProcessingService.js";
import CheckoutValidation from "./CheckoutValidation.js";
import SocketContext from "../../contexts/SocketContext.js";

class CartTab extends Component {
  constructor(props) {
    super(props);
    
    const initialCartItems = Array.isArray(window.cart) ? window.cart : [];
    const initialDeliveryMethod = CheckoutValidation.shouldForcePickupDelivery(initialCartItems) ? "Abholung" : "DHL";
    const optimalPaymentMethod = CheckoutValidation.getOptimalPaymentMethod(initialDeliveryMethod, initialCartItems, 0);
    
    this.state = {
      isCheckingOut: false,
      cartItems: initialCartItems,
      deliveryMethod: initialDeliveryMethod,
      paymentMethod: optimalPaymentMethod,
      invoiceAddress: {
        firstName: "",
        lastName: "",
        addressAddition: "",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        country: "Deutschland",
      },
      deliveryAddress: {
        firstName: "",
        lastName: "",
        addressAddition: "",
        street: "",
        houseNumber: "",
        postalCode: "",
        city: "",
        country: "Deutschland",
      },
      useSameAddress: true,
      saveAddressForFuture: true,
      addressFormErrors: {},
      termsAccepted: false,
      isCompletingOrder: false,
      completionError: null,
      note: "",
      stripeClientSecret: null,
      showStripePayment: false,
      StripeComponent: null,
      isLoadingStripe: false,
      showPaymentConfirmation: false,
      orderCompleted: false,
      originalCartItems: []
    };

    // Initialize order processing service
    this.orderService = new OrderProcessingService(
      () => this.context,
      this.setState.bind(this)
    );
    this.orderService.getState = () => this.state;
    this.orderService.setOrderSuccessCallback(this.props.onOrderSuccess);
  }

  // @note Add method to fetch and apply order template prefill data
  fetchOrderTemplate = () => {
    if (this.context && this.context.socket && this.context.socket.connected) {
      this.context.socket.emit('getOrderTemplate', (response) => {
        if (response.success && response.orderTemplate) {
          const template = response.orderTemplate;
          
          // Map the template fields to our state structure
          const invoiceAddress = {
            firstName: template.invoice_address_name ? template.invoice_address_name.split(' ')[0] || "" : "",
            lastName: template.invoice_address_name ? template.invoice_address_name.split(' ').slice(1).join(' ') || "" : "",
            addressAddition: template.invoice_address_line2 || "",
            street: template.invoice_address_street || "",
            houseNumber: template.invoice_address_house_number || "",
            postalCode: template.invoice_address_postal_code || "",
            city: template.invoice_address_city || "",
            country: template.invoice_address_country || "Deutschland",
          };

          const deliveryAddress = {
            firstName: template.shipping_address_name ? template.shipping_address_name.split(' ')[0] || "" : "",
            lastName: template.shipping_address_name ? template.shipping_address_name.split(' ').slice(1).join(' ') || "" : "",
            addressAddition: template.shipping_address_line2 || "",
            street: template.shipping_address_street || "",
            houseNumber: template.shipping_address_house_number || "",
            postalCode: template.shipping_address_postal_code || "",
            city: template.shipping_address_city || "",
            country: template.shipping_address_country || "Deutschland",
          };

          // Get current cart state to check constraints
          const currentCartItems = Array.isArray(window.cart) ? window.cart : [];
          const { isPickupOnly, hasStecklinge } = CheckoutValidation.getCartItemFlags(currentCartItems);
          
          // Determine delivery method - respect cart constraints
          let prefillDeliveryMethod = template.delivery_method || "DHL";
          if (isPickupOnly || hasStecklinge) {
            prefillDeliveryMethod = "Abholung";
          }
          
          // Map delivery method values if needed
          const deliveryMethodMap = {
            "standard": "DHL",
            "express": "DPD",
            "pickup": "Abholung"
          };
          prefillDeliveryMethod = deliveryMethodMap[prefillDeliveryMethod] || prefillDeliveryMethod;

          // Determine payment method - respect constraints
          let prefillPaymentMethod = template.payment_method || "wire";
          const paymentMethodMap = {
            "credit_card": "stripe",
            "bank_transfer": "wire",
            "cash_on_delivery": "onDelivery",
            "cash": "cash"
          };
          prefillPaymentMethod = paymentMethodMap[prefillPaymentMethod] || prefillPaymentMethod;
          
          // Validate payment method against delivery method constraints
          prefillPaymentMethod = CheckoutValidation.validatePaymentMethodForDelivery(
            prefillDeliveryMethod,
            prefillPaymentMethod,
            currentCartItems,
            0 // Use 0 for delivery cost during prefill
          );

          // Apply prefill data to state
          this.setState({
            invoiceAddress,
            deliveryAddress,
            deliveryMethod: prefillDeliveryMethod,
            paymentMethod: prefillPaymentMethod,
            saveAddressForFuture: template.save_address_for_future === 1,
            useSameAddress: true // Default to same address, user can change if needed
          });

          console.log("Order template applied successfully");
        } else {
          console.log("No order template available or failed to fetch");
        }
      });
    }
  };

  componentDidMount() {
    // Handle payment completion if detected
    if (this.props.paymentCompletion) {
      this.orderService.handlePaymentCompletion(
        this.props.paymentCompletion,
        this.props.onClearPaymentCompletion
      );
    }

    // @note Fetch order template for prefill when component mounts
    this.fetchOrderTemplate();

    this.cart = () => {
      // @note Don't update cart if we're showing payment confirmation - keep it empty
      if (this.state.showPaymentConfirmation) {
        return;
      }
      
      const cartItems = Array.isArray(window.cart) ? window.cart : [];
      const shouldForcePickup = CheckoutValidation.shouldForcePickupDelivery(cartItems);
      
      const newDeliveryMethod = shouldForcePickup ? "Abholung" : this.state.deliveryMethod;
      const deliveryCost = this.orderService.getDeliveryCost();
      
      // Get optimal payment method for the current state
      const optimalPaymentMethod = CheckoutValidation.getOptimalPaymentMethod(
        newDeliveryMethod, 
        cartItems, 
        deliveryCost
      );
      
      // Use optimal payment method if current one is invalid, otherwise keep current
      const validatedPaymentMethod = CheckoutValidation.validatePaymentMethodForDelivery(
        newDeliveryMethod,
        this.state.paymentMethod,
        cartItems,
        deliveryCost
      );
      
      const newPaymentMethod = validatedPaymentMethod !== this.state.paymentMethod 
        ? optimalPaymentMethod 
        : this.state.paymentMethod;
      
      this.setState({
        cartItems,
        deliveryMethod: newDeliveryMethod,
        paymentMethod: newPaymentMethod,
      });
    };
    
    window.addEventListener("cart", this.cart);
    this.cart(); // Initial check
  }

  componentWillUnmount() {
    window.removeEventListener("cart", this.cart);
    this.orderService.cleanup();
  }

  handleCheckout = () => {
    this.setState({ isCheckingOut: true });
  };

  handleContinueShopping = () => {
    this.setState({ isCheckingOut: false });
  };

  handleDeliveryMethodChange = (event) => {
    const newDeliveryMethod = event.target.value;
    const deliveryCost = this.orderService.getDeliveryCost();
    
    // Get optimal payment method for the new delivery method
    const optimalPaymentMethod = CheckoutValidation.getOptimalPaymentMethod(
      newDeliveryMethod,
      this.state.cartItems,
      deliveryCost
    );
    
    // Use optimal payment method if current one becomes invalid, otherwise keep current
    const validatedPaymentMethod = CheckoutValidation.validatePaymentMethodForDelivery(
      newDeliveryMethod,
      this.state.paymentMethod,
      this.state.cartItems,
      deliveryCost
    );
    
    const newPaymentMethod = validatedPaymentMethod !== this.state.paymentMethod 
      ? optimalPaymentMethod 
      : this.state.paymentMethod;

    this.setState({
      deliveryMethod: newDeliveryMethod,
      paymentMethod: newPaymentMethod,
    });
  };

  handlePaymentMethodChange = (event) => {
    this.setState({ paymentMethod: event.target.value });
  };

  handleInvoiceAddressChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      invoiceAddress: {
        ...prevState.invoiceAddress,
        [name]: value,
      },
    }));
  };

  handleDeliveryAddressChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      deliveryAddress: {
        ...prevState.deliveryAddress,
        [name]: value,
      },
    }));
  };

  handleUseSameAddressChange = (e) => {
    const useSameAddress = e.target.checked;
    this.setState({
      useSameAddress,
      deliveryAddress: useSameAddress
        ? this.state.invoiceAddress
        : this.state.deliveryAddress,
    });
  };

  handleTermsAcceptedChange = (e) => {
    this.setState({ termsAccepted: e.target.checked });
  };

  handleNoteChange = (e) => {
    this.setState({ note: e.target.value });
  };

  handleSaveAddressForFutureChange = (e) => {
    this.setState({ saveAddressForFuture: e.target.checked });
  };

  validateAddressForm = () => {
    const errors = CheckoutValidation.validateAddressForm(this.state);
    this.setState({ addressFormErrors: errors });
    return Object.keys(errors).length === 0;
  };

  loadStripeComponent = async (clientSecret) => {
    this.setState({ isLoadingStripe: true });
    
    try {
      const { default: Stripe } = await import("../Stripe.js");
      this.setState({
        StripeComponent: Stripe,
        stripeClientSecret: clientSecret,
        showStripePayment: true,
        isCompletingOrder: false,
        isLoadingStripe: false,
      });
    } catch (error) {
      console.error("Failed to load Stripe component:", error);
      this.setState({
        isCompletingOrder: false,
        isLoadingStripe: false,
        completionError: "Failed to load payment component. Please try again.",
      });
    }
  };

  handleCompleteOrder = () => {
    this.setState({ completionError: null }); // Clear previous errors

    const validationError = CheckoutValidation.getValidationErrorMessage(this.state);
    if (validationError) {
      this.setState({ completionError: validationError });
      this.validateAddressForm(); // To show field-specific errors
      return;
    }

    this.setState({ isCompletingOrder: true });

    const {
      deliveryMethod,
      paymentMethod,
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      cartItems,
      note,
      saveAddressForFuture,
    } = this.state;

    const deliveryCost = this.orderService.getDeliveryCost();

    // Handle Stripe payment differently
    if (paymentMethod === "stripe") {
      // Store the cart items used for Stripe payment in sessionStorage for later reference
      try {
        sessionStorage.setItem('stripePaymentCart', JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to store Stripe payment cart:", error);
      }
      
      // Calculate total amount for Stripe
      const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const totalAmount = Math.round((subtotal + deliveryCost) * 100); // Convert to cents
      
      this.orderService.createStripeIntent(totalAmount, this.loadStripeComponent);
      return;
    }

    // Handle regular orders
    const orderData = {
      items: cartItems,
      invoiceAddress,
      deliveryAddress: useSameAddress ? invoiceAddress : deliveryAddress,
      deliveryMethod,
      paymentMethod,
      deliveryCost,
      note,
      domain: window.location.origin,
      saveAddressForFuture,
    };

    this.orderService.processRegularOrder(orderData);
  };

  render() {
    const {
      cartItems,
      deliveryMethod,
      paymentMethod,
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      saveAddressForFuture,
      addressFormErrors,
      termsAccepted,
      isCompletingOrder,
      completionError,
      note,
      stripeClientSecret,
      showStripePayment,
      StripeComponent,
      isLoadingStripe,
      showPaymentConfirmation,
      orderCompleted,
    } = this.state;

    const deliveryCost = this.orderService.getDeliveryCost();
    const { isPickupOnly, hasStecklinge } = CheckoutValidation.getCartItemFlags(cartItems);

    const preSubmitError = CheckoutValidation.getValidationErrorMessage(this.state);
    const displayError = completionError || preSubmitError;

    return (
      <Box sx={{ p: 3 }}>
        {/* Payment Confirmation */}
        {showPaymentConfirmation && (
          <PaymentConfirmationDialog
            paymentCompletionData={this.orderService.paymentCompletionData}
            isCompletingOrder={isCompletingOrder}
            completionError={completionError}
            orderCompleted={orderCompleted}
            onContinueShopping={() => {
                    this.setState({ showPaymentConfirmation: false });
                  }}
            onViewOrders={() => {
                    if (this.props.onOrderSuccess) {
                      this.props.onOrderSuccess();
                    }
                    this.setState({ showPaymentConfirmation: false });
                  }}
          />
        )}

        {/* @note Hide CartDropdown when showing payment confirmation */}
        {!showPaymentConfirmation && (
          <CartDropdown 
            cartItems={cartItems} 
            socket={this.context.socket}
            showDetailedSummary={showStripePayment}
            deliveryMethod={deliveryMethod}
            deliveryCost={deliveryCost}
          />
        )}

        {cartItems.length > 0 && (
          <Box sx={{ mt: 3 }}>
            {isLoadingStripe ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1">
                  Zahlungskomponente wird geladen...
                </Typography>
              </Box>
            ) : showStripePayment && StripeComponent ? (
              <>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => this.setState({ showStripePayment: false, stripeClientSecret: null })}
                    sx={{ 
                      color: '#2e7d32', 
                      borderColor: '#2e7d32',
                      '&:hover': {
                        backgroundColor: 'rgba(46, 125, 50, 0.04)',
                        borderColor: '#1b5e20'
                      }
                    }}
                  >
                    ← Zurück zur Bestellung
                  </Button>
                </Box>
                <StripeComponent clientSecret={stripeClientSecret} />
              </>
            ) : (
              <CheckoutForm
                  paymentMethod={paymentMethod}
                invoiceAddress={invoiceAddress}
                deliveryAddress={deliveryAddress}
                useSameAddress={useSameAddress}
                saveAddressForFuture={saveAddressForFuture}
                addressFormErrors={addressFormErrors}
                termsAccepted={termsAccepted}
                note={note}
                  deliveryMethod={deliveryMethod}
                hasStecklinge={hasStecklinge}
                isPickupOnly={isPickupOnly}
                deliveryCost={deliveryCost}
                cartItems={cartItems}
                displayError={displayError}
                isCompletingOrder={isCompletingOrder}
                preSubmitError={preSubmitError}
                onInvoiceAddressChange={this.handleInvoiceAddressChange}
                onDeliveryAddressChange={this.handleDeliveryAddressChange}
                onUseSameAddressChange={this.handleUseSameAddressChange}
                onSaveAddressForFutureChange={this.handleSaveAddressForFutureChange}
                onTermsAcceptedChange={this.handleTermsAcceptedChange}
                onNoteChange={this.handleNoteChange}
                onDeliveryMethodChange={this.handleDeliveryMethodChange}
                onPaymentMethodChange={this.handlePaymentMethodChange}
                onCompleteOrder={this.handleCompleteOrder}
              />
            )}
          </Box>
        )}
      </Box>
    );
  }
}

// Set static contextType to access the socket
CartTab.contextType = SocketContext;

export default CartTab;
