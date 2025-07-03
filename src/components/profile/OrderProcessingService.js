import { isUserLoggedIn } from "../LoginComponent.js";

class OrderProcessingService {
  constructor(getContext, setState) {
    this.getContext = getContext;
    this.setState = setState;
    this.verifyTokenHandler = null;
    this.verifyTokenTimeout = null;
    this.socketHandler = null;
    this.paymentCompletionData = null;
  }

  // Clean up all event listeners and timeouts
  cleanup() {
    if (this.verifyTokenHandler) {
      window.removeEventListener('cart', this.verifyTokenHandler);
      this.verifyTokenHandler = null;
    }
    if (this.verifyTokenTimeout) {
      clearTimeout(this.verifyTokenTimeout);
      this.verifyTokenTimeout = null;
    }
    if (this.socketHandler) {
      window.removeEventListener('cart', this.socketHandler);
      this.socketHandler = null;
    }
  }

  // Handle payment completion from parent component
  handlePaymentCompletion(paymentCompletion, onClearPaymentCompletion) {
    // Store payment completion data before clearing
    this.paymentCompletionData = { ...paymentCompletion };
    
    // Clear payment completion data to prevent duplicates
    if (onClearPaymentCompletion) {
      onClearPaymentCompletion();
    }
    
    // Show payment confirmation immediately but wait for verifyToken to complete
    this.setState({ 
      showPaymentConfirmation: true,
      cartItems: [] // Clear UI cart immediately
    });
    
    // Wait for verifyToken to complete and populate window.cart, then process order
    this.waitForVerifyTokenAndProcessOrder();
  }

  waitForVerifyTokenAndProcessOrder() {
    // Check if window.cart is already populated (verifyToken already completed)
    if (Array.isArray(window.cart) && window.cart.length > 0) {
      this.processStripeOrderWithCart(window.cart);
      return;
    }
    
    // Listen for cart event which is dispatched after verifyToken completes
    this.verifyTokenHandler = () => {
      if (Array.isArray(window.cart) && window.cart.length > 0) {
        this.processStripeOrderWithCart([...window.cart]); // Copy the cart
        
        // Clear window.cart after copying
        window.cart = [];
        window.dispatchEvent(new CustomEvent("cart"));
      } else {
        this.setState({ 
          completionError: "Cart is empty. Please add items to your cart before placing an order." 
        });
      }
      
      // Clean up listener
      if (this.verifyTokenHandler) {
        window.removeEventListener('cart', this.verifyTokenHandler);
        this.verifyTokenHandler = null;
      }
    };
    
    window.addEventListener('cart', this.verifyTokenHandler);
    
    // Set up a timeout as fallback (in case verifyToken fails)
    this.verifyTokenTimeout = setTimeout(() => {
      if (Array.isArray(window.cart) && window.cart.length > 0) {
        this.processStripeOrderWithCart([...window.cart]);
        window.cart = [];
        window.dispatchEvent(new CustomEvent("cart"));
      } else {
        this.setState({ 
          completionError: "Unable to load cart data. Please refresh the page and try again." 
        });
      }
      
      // Clean up
      if (this.verifyTokenHandler) {
        window.removeEventListener('cart', this.verifyTokenHandler);
        this.verifyTokenHandler = null;
      }
    }, 5000); // 5 second timeout
  }

  processStripeOrderWithCart(cartItems) {
    // Clear timeout if it exists
    if (this.verifyTokenTimeout) {
      clearTimeout(this.verifyTokenTimeout);
      this.verifyTokenTimeout = null;
    }
    
    // Store cart items in state and process order
    this.setState({ 
      originalCartItems: cartItems 
    }, () => {
      this.processStripeOrder();
    });
  }

  processStripeOrder() {
    // If no original cart items, don't process
    if (!this.getState().originalCartItems || this.getState().originalCartItems.length === 0) {
      this.setState({ completionError: "Cart is empty. Please add items to your cart before placing an order." });
      return;
    }

    // If socket is ready, process immediately
    const context = this.getContext();
    if (context && context.socket && context.socket.connected) {
      const { isLoggedIn: isAuthenticated } = isUserLoggedIn();
      if (isAuthenticated) {
        this.sendStripeOrder();
        return;
      }
    }

    // Wait for socket to be ready
    this.socketHandler = () => {
      const context = this.getContext();
      if (context && context.socket && context.socket.connected) {
        const { isLoggedIn: isAuthenticated } = isUserLoggedIn();
        const state = this.getState();
        
        if (isAuthenticated && state.showPaymentConfirmation && !state.isCompletingOrder) {
          this.sendStripeOrder();
        }
      }
      // Clean up
      if (this.socketHandler) {
        window.removeEventListener('cart', this.socketHandler);
        this.socketHandler = null;
      }
    };
    window.addEventListener('cart', this.socketHandler);
  }

  sendStripeOrder() {
    const state = this.getState();
    
    // Don't process if already processing or completed
    if (state.isCompletingOrder || state.orderCompleted) {
      return;
    }

    this.setState({ isCompletingOrder: true, completionError: null });

    const {
      deliveryMethod,
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      originalCartItems,
      note,
      saveAddressForFuture,
    } = state;

    const deliveryCost = this.getDeliveryCost();

    const orderData = {
      items: originalCartItems,
      invoiceAddress,
      deliveryAddress: useSameAddress ? invoiceAddress : deliveryAddress,
      deliveryMethod,
      paymentMethod: "stripe",
      deliveryCost,
      note,
      domain: window.location.origin,
      stripeData: this.paymentCompletionData ? {
        paymentIntent: this.paymentCompletionData.paymentIntent,
        paymentIntentClientSecret: this.paymentCompletionData.paymentIntentClientSecret,
        redirectStatus: this.paymentCompletionData.redirectStatus,
      } : null,
      saveAddressForFuture,
    };

    // Emit stripe order to backend via socket.io
    const context = this.getContext();
    context.socket.emit("issueStripeOrder", orderData, (response) => {
      if (response.success) {
        this.setState({
          isCompletingOrder: false,
          orderCompleted: true,
          completionError: null,
        });
      } else {
        this.setState({
          isCompletingOrder: false,
          completionError: response.error || "Failed to complete order. Please try again.",
        });
      }
    });
  }

  // Process regular (non-Stripe) orders
  processRegularOrder(orderData) {
    const context = this.getContext();
    if (context && context.socket && context.socket.connected) {
      context.socket.emit("issueOrder", orderData, (response) => {
        if (response.success) {
          // Clear the cart
          window.cart = [];
          window.dispatchEvent(new CustomEvent("cart"));

          // Reset state and navigate to orders tab
          this.setState({
            isCheckingOut: false,
            cartItems: [],
            isCompletingOrder: false,
            completionError: null,
          });
          
          // Call success callback if provided
          if (this.onOrderSuccess) {
            this.onOrderSuccess();
          }
        } else {
          this.setState({
            isCompletingOrder: false,
            completionError: response.error || "Failed to complete order. Please try again.",
          });
        }
      });
    } else {
      console.error("Socket context not available");
      this.setState({
        isCompletingOrder: false,
        completionError: "Cannot connect to server. Please try again later.",
      });
    }
  }

  // Create Stripe payment intent
  createStripeIntent(totalAmount, loadStripeComponent) {
    const context = this.getContext();
    if (context && context.socket && context.socket.connected) {
      context.socket.emit(
        "createStripeIntent",
        { amount: totalAmount },
        (response) => {
          if (response.success) {
            loadStripeComponent(response.client_secret);
          } else {
            console.error("Error:", response.error);
            this.setState({
              isCompletingOrder: false,
              completionError: response.error || "Failed to create Stripe payment intent. Please try again.",
            });
          }
        }
      );
    } else {
      console.error("Socket context not available");
      this.setState({
        isCompletingOrder: false,
        completionError: "Cannot connect to server. Please try again later.",
      });
    }
  }

  // Calculate delivery cost
  getDeliveryCost() {
    const { deliveryMethod, paymentMethod } = this.getState();
    let cost = 0;

    switch (deliveryMethod) {
      case "DHL":
        cost = 6.99;
        break;
      case "DPD":
        cost = 4.9;
        break;
      case "Sperrgut":
        cost = 28.99;
        break;
      case "Abholung":
        cost = 0;
        break;
      default:
        cost = 6.99;
    }

    // Add onDelivery surcharge if selected
    if (paymentMethod === "onDelivery") {
      cost += 8.99;
    }

    return cost;
  }

  // Helper method to get current state (to be overridden by component)
  getState() {
    throw new Error("getState method must be implemented by the component");
  }

  // Set callback for order success
  setOrderSuccessCallback(callback) {
    this.onOrderSuccess = callback;
  }
}

export default OrderProcessingService; 