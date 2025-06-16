# issueOrder Socket.io Event Documentation

## Overview
The `issueOrder` event is emitted from the frontend when a customer completes their order in the shopping cart. This event contains all necessary order information and should be handled by the backend to process the order.

## Event Name
`issueOrder`

## Data Structure
The event payload contains the following order data:

```javascript
{
  items: [
    {
      id: string,           // Product ID
      name: string,         // Product name
      price: number,        // Unit price
      quantity: number,     // Quantity ordered
      // ... other product properties
    }
  ],
  invoiceAddress: {
    firstName: string,
    lastName: string,
    street: string,
    houseNumber: string,
    postalCode: string,
    city: string,
    country: string       // Default: "Deutschland"
  },
  deliveryAddress: {
    firstName: string,
    lastName: string,
    street: string,
    houseNumber: string,
    postalCode: string,
    city: string,
    country: string       // Default: "Deutschland"
  },
  deliveryMethod: string,   // "DHL" | "DPD" | "Sperrgut" | "Abholung"
  paymentMethod: string,    // "Überweisung" | "Nachnahme" | "Filiale"
  deliveryCost: number,     // Shipping cost based on delivery method and payment
}
```

## Delivery Method Pricing
- **DHL**: €6.99
- **DPD**: €4.90
- **Sperrgut**: €28.99 (currently disabled in frontend)
- **Abholung**: €0.00

## Payment Method Rules
- **Nachnahme**: Only available with DHL delivery (+€8.99 surcharge)
- **Filiale**: Only available with "Abholung" delivery
- **Überweisung**: Available with all delivery methods

## Backend Implementation Requirements

### 1. Socket.io Event Handler
```javascript
socket.on('issueOrder', (orderData) => {
  // Handle the order processing here
});
```

### 2. Validation
Before processing, validate:
- All required fields are present
- Payment method is compatible with delivery method
- Items array is not empty
- Addresses are complete
- Pricing calculations are correct

### 3. Suggested Processing Steps
1. **Generate Order ID**: Create unique order identifier
2. **Validate Stock**: Check if all items are available
3. **Calculate Totals**: Verify frontend calculations
4. **Store Order**: Save to database
5. **Update Inventory**: Reduce stock quantities
6. **Send Confirmation**: Email to customer
7. **Process Payment**: Handle based on payment method
8. **Emit Response**: Send confirmation back to frontend

### 4. Response Events
Consider emitting these events back to the client:

#### Success Response
```javascript
socket.emit('orderConfirmed', {
  orderId: string,
  status: 'confirmed',
  estimatedDelivery: string, // ISO date
  trackingInfo: string       // If applicable
});
```

#### Error Response
```javascript
socket.emit('orderError', {
  error: string,
  code: string,
  details: object
});
```

### 5. Database Schema Suggestion
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_id VARCHAR(255),
  items JSON,
  invoice_address JSON,
  delivery_address JSON,
  delivery_method VARCHAR(50),
  payment_method VARCHAR(50),
  subtotal DECIMAL(10,2),
  delivery_cost DECIMAL(10,2),
  total DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6. Error Handling
Handle these potential errors:
- Invalid or missing data
- Stock unavailability
- Payment processing failures
- Database connection issues
- Invalid delivery/payment combinations

### 7. Logging
Log all order attempts for debugging and analytics:
- Successful orders
- Failed validations
- Payment processing results
- Inventory updates

## Frontend Integration Notes
- The frontend validates all form data before emission
- Terms and conditions are accepted before emission
- Socket context is checked before emitting
- Order data is logged to console for debugging

## Security Considerations
- Validate all incoming data server-side
- Sanitize user inputs
- Verify pricing calculations independently
- Implement rate limiting for order submissions
- Log suspicious activities

## Testing
Test with various combinations:
- Different delivery methods
- Different payment methods
- Edge cases (empty cart, invalid addresses)
- Network failures
- Database unavailability 