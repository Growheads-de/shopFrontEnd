/**
 * Syncs the server cart with the local cart, merging items intelligently
 * @param {Array} serverCart - The cart data from the server
 * @returns {Array} The merged cart
 */
export const syncCart = (serverCart) => {
  try {
    // Get the current cart from window or initialize an empty array
    const localCart = window.cart || [];
 

    // pm2 log present the user which a choice on how to sync the cart: 
    // - use the current cart and store the server cart in the archive
    // - delete the server cart
    // - use the server cart
    // - merge

    // show both carts side by side to the user

    // Create a map of local cart items by product ID for quick lookup
    const localCartMap = new Map();
    localCart.forEach(item => {
      if (item && item.id) {
        localCartMap.set(item.id, { ...item, fromLocal: true });
      }
    });
    
    // Merge server cart with local cart
    const mergedCart = [];
    const processedIds = new Set();
    
    // First add all server items
    serverCart.forEach(serverItem => {
      if (!serverItem || !serverItem.id) return;
      
      const localItem = localCartMap.get(serverItem.id);
      
      if (localItem) {
        // If item exists in both carts, use the one with higher quantity
        mergedCart.push({
          ...serverItem,
          quantity: Math.max(serverItem.quantity, localItem.quantity)
        });
      } else {
        // If item only exists on server, add it
        mergedCart.push({ ...serverItem });
      }
      
      processedIds.add(serverItem.id);
    });
    
    // Add any local items that weren't in the server cart
    localCart.forEach(localItem => {
      if (localItem && localItem.id && !processedIds.has(localItem.id)) {
        mergedCart.push({ ...localItem });
      }
    });
    
    // Update the window.cart with the merged cart
    window.cart = mergedCart;
    
  } catch (error) {
    console.error('Error syncing cart:', error);
    // In case of error, return the local cart or an empty array
    return window.cart || [];
  }
};