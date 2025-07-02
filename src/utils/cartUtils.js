// Cart-Sync-Utilities

/**
 * Vereint lokalen und Server-Warenkorb intelligent.
 */
export const mergeCarts = (localCart = [], serverCart = []) => {
  try {
    const localCartMap = new Map();
    localCart.forEach(item => {
      if (item?.id) localCartMap.set(item.id, item);
    });
    const mergedCart = [];
    const processedIds = new Set();
    serverCart.forEach(serverItem => {
      if (!serverItem?.id) return;
      const localItem = localCartMap.get(serverItem.id);
      if (localItem) {
        mergedCart.push({
          ...serverItem,
          quantity: Math.max(serverItem.quantity, localItem.quantity),
        });
      } else {
        mergedCart.push({ ...serverItem });
      }
      processedIds.add(serverItem.id);
    });
    localCart.forEach(localItem => {
      if (localItem?.id && !processedIds.has(localItem.id)) {
        mergedCart.push({ ...localItem });
      }
    });
    return mergedCart;
  } catch (error) {
    console.error('Error merging carts:', error);
    return localCart || [];
  }
};

/**
 * Nutzt lokalen Warenkorb und archiviert den Server-Warenkorb.
 */
export const localAndArchiveServer = (localCart, serverCart) => {
  try {
    window.archivedServerCart = serverCart;
    window.cart = localCart;
    return localCart;
  } catch (error) {
    console.error('Error applying local cart and archiving server cart:', error);
    return window.cart || [];
  }
};
