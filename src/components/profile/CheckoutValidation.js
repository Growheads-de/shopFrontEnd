class CheckoutValidation {
  static validateAddressForm(state) {
    const {
      invoiceAddress,
      deliveryAddress,
      useSameAddress,
      deliveryMethod,
      paymentMethod,
    } = state;
    const errors = {};

    // Validate invoice address (skip if payment method is "cash")
    if (paymentMethod !== "cash") {
      if (!invoiceAddress.firstName)
        errors.invoiceFirstName = "Vorname erforderlich";
      if (!invoiceAddress.lastName)
        errors.invoiceLastName = "Nachname erforderlich";
      if (!invoiceAddress.street) errors.invoiceStreet = "Straße erforderlich";
      if (!invoiceAddress.houseNumber)
        errors.invoiceHouseNumber = "Hausnummer erforderlich";
      if (!invoiceAddress.postalCode)
        errors.invoicePostalCode = "PLZ erforderlich";
      if (!invoiceAddress.city) errors.invoiceCity = "Stadt erforderlich";
    }

    // Validate delivery address for shipping methods that require it
    if (
      !useSameAddress &&
      (deliveryMethod === "DHL" || deliveryMethod === "DPD")
    ) {
      if (!deliveryAddress.firstName)
        errors.deliveryFirstName = "Vorname erforderlich";
      if (!deliveryAddress.lastName)
        errors.deliveryLastName = "Nachname erforderlich";
      if (!deliveryAddress.street)
        errors.deliveryStreet = "Straße erforderlich";
      if (!deliveryAddress.houseNumber)
        errors.deliveryHouseNumber = "Hausnummer erforderlich";
      if (!deliveryAddress.postalCode)
        errors.deliveryPostalCode = "PLZ erforderlich";
      if (!deliveryAddress.city) errors.deliveryCity = "Stadt erforderlich";
    }

    return errors;
  }

  static getValidationErrorMessage(state, isAddressOnly = false) {
    const { termsAccepted } = state;
    
    const addressErrors = this.validateAddressForm(state);

    if (isAddressOnly) {
      return addressErrors;
    }

    if (Object.keys(addressErrors).length > 0) {
      return "Bitte überprüfen Sie Ihre Eingaben in den Adressfeldern.";
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      return "Bitte akzeptieren Sie die AGBs, Datenschutzerklärung und Widerrufsrecht, um fortzufahren.";
    }

    return null;
  }

  static getOptimalPaymentMethod(deliveryMethod, cartItems = [], deliveryCost = 0) {
    // Calculate total amount
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalAmount = subtotal + deliveryCost;
    
    // If total is 0, only cash is allowed
    if (totalAmount === 0) {
      return "cash";
    }
    
    // If total is less than 0.50€, stripe is not available
    if (totalAmount < 0.50) {
      return "wire";
    }
    
    // Prefer stripe when available and meets minimum amount
    if (deliveryMethod === "DHL" || deliveryMethod === "DPD" || deliveryMethod === "Abholung") {
      return "stripe";
    }
    
    // Fall back to wire transfer
    return "wire";
  }

  static validatePaymentMethodForDelivery(deliveryMethod, paymentMethod, cartItems = [], deliveryCost = 0) {
    let newPaymentMethod = paymentMethod;

    // Calculate total amount for minimum validation
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalAmount = subtotal + deliveryCost;

    // Reset payment method if it's no longer valid
    if (deliveryMethod !== "DHL" && paymentMethod === "onDelivery") {
      newPaymentMethod = "wire";
    }

    // Allow stripe for DHL, DPD, and Abholung delivery methods, but check minimum amount
    if (deliveryMethod !== "DHL" && deliveryMethod !== "DPD" && deliveryMethod !== "Abholung" && paymentMethod === "stripe") {
      newPaymentMethod = "wire";
    }

    // Check minimum amount for stripe payments
    if (paymentMethod === "stripe" && totalAmount < 0.50) {
      newPaymentMethod = "wire";
    }

    if (deliveryMethod !== "Abholung" && paymentMethod === "cash") {
      newPaymentMethod = "wire";
    }

    return newPaymentMethod;
  }

  static shouldForcePickupDelivery(cartItems) {
    const isPickupOnly = cartItems.some(
      (item) => item.versandklasse === "nur Abholung"
    );
    const hasStecklinge = cartItems.some(
      (item) =>
        item.id &&
        typeof item.id === "string" &&
        item.id.endsWith("steckling")
    );

    return isPickupOnly || hasStecklinge;
  }

  static getCartItemFlags(cartItems) {
    const isPickupOnly = cartItems.some(
      (item) => item.versandklasse === "nur Abholung"
    );
    const hasStecklinge = cartItems.some(
      (item) =>
        item.id &&
        typeof item.id === "string" &&
        item.id.endsWith("steckling")
    );

    return { isPickupOnly, hasStecklinge };
  }
}

export default CheckoutValidation; 