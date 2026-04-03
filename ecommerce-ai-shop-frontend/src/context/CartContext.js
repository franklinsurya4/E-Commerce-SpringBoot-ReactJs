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

      // Backend sends BigDecimal as numbers/strings
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

  const addToCart = async (productId, quantity = 1) => {
    // This throws on failure — caller (ProductDetailPage) catches it
    const res = await cartAPI.add({ productId, quantity });
    // Refresh cart in background — don't let this fail break the flow
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