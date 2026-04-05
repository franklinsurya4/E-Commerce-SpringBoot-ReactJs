import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../api/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = () => !!localStorage.getItem('token');

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated()) {
      setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 });
      setLoading(false);
      return;
    }
    try {
      const res = await cartAPI.get();
      const data = res.data?.data || {};
      const items = data.items || [];

      const subtotal = parseFloat(data.subtotal) || 0;
      const tax = parseFloat(data.tax) || 0;
      const shipping = parseFloat(data.shipping) || 0;
      const total = parseFloat(data.total) || 0;
      const itemCount = data.itemCount || items.reduce((sum, item) => sum + item.quantity, 0);

      setCart({ items, itemCount, subtotal, tax, shipping, total });
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Add item to cart — supports BOTH calling patterns:
   * 
   *   addToCart(productId, quantity)                         → simple
   *   addToCart({ productId, quantity, name, brand, ... })   → object (extra fields ignored)
   * 
   * Backend only needs { productId, quantity }
   */
  const addToCart = async (productIdOrObj, quantity = 1) => {
    let pid, qty;

    if (typeof productIdOrObj === 'object' && productIdOrObj !== null) {
      // Object pattern: addToCart({ productId: 5, quantity: 2, name: '...', ... })
      pid = productIdOrObj.productId || productIdOrObj.id;
      qty = productIdOrObj.quantity || quantity;
    } else {
      // Simple pattern: addToCart(5, 2)
      pid = productIdOrObj;
      qty = quantity;
    }

    if (!pid) {
      throw new Error('Product ID is required');
    }

    // Only send what the backend expects
    const res = await cartAPI.add({
      productId: Number(pid),
      quantity: Number(qty) || 1
    });

    // Refresh cart in background
    try { await fetchCart(); } catch {}
    return res;
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    await cartAPI.updateQty(itemId, quantity);
    try { await fetchCart(); } catch {}
  };

  const removeItem = async (itemId) => {
    await cartAPI.remove(itemId);
    try { await fetchCart(); } catch {}
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
    } catch {}
    setCart({ items: [], itemCount: 0, subtotal: 0, tax: 0, shipping: 0, total: 0 });
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default CartContext;