import { createContext, useContext, useState } from "react";
import {
  placeOrder,
  getOrdersByEmail,
  cancelOrder as cancelOrderApi,
} from "../api/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  });

  // ✅ orders now loaded from localStorage on startup
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orders")) || []; }
    catch { return []; }
  });

  // ✅ ordersEmail persisted too so the lookup box refills on refresh
  const [ordersEmail, setOrdersEmail] = useState(() => {
    return localStorage.getItem("ordersEmail") || "";
  });

  const resolveImage = (item) =>
    item.imageUrl  ||
    item.image     ||
    item.imgUrl    ||
    item.img       ||
    item.thumbnail ||
    item.photo     ||
    null;

  // ── helpers to set + persist together ───────────────────

  const saveOrders = (list) => {
    setOrders(list);
    localStorage.setItem("orders", JSON.stringify(list));
  };

  const saveOrdersEmail = (email) => {
    setOrdersEmail(email);
    localStorage.setItem("ordersEmail", email);
  };

  // ── CART ────────────────────────────────────────────────

  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      const next = exists
        ? prev.map(i => i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i)
        : [...prev, { ...product, quantity: 1 }];
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => {
      const next = prev.filter(i => i.id !== productId);
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const updateQuantity = (productId, qty) => {
    if (qty < 1) { removeFromCart(productId); return; }
    setCartItems(prev => {
      const next = prev.map(i =>
        i.id === productId ? { ...i, quantity: qty } : i
      );
      localStorage.setItem("cart", JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  // ── ORDERS ──────────────────────────────────────────────

  const addOrder = async (customer, items) => {
    if (!items || !items.length) throw new Error("No items to order");

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 99;

    const resolvedItems = items.map(i => ({
      productId:   i.id,
      productName: i.name,
      imageUrl:    resolveImage(i),
      price:       i.price,
      quantity:    i.quantity,
      category:    i.category || null,
    }));

    const payload = {
      customerName:    customer.name,
      customerEmail:   customer.email,
      deliveryAddress: customer.address,
      totalAmount:     subtotal + shipping,
      items:           resolvedItems,
    };

    const saved = await placeOrder(payload);

    const savedWithImages = {
      ...saved,
      items: (saved.items || []).map((backendItem, idx) => ({
        ...backendItem,
        imageUrl: backendItem.imageUrl || resolvedItems[idx]?.imageUrl || null,
      })),
    };

    // ✅ persist new order to localStorage
    setOrders(prev => {
      const next = [savedWithImages, ...prev];
      localStorage.setItem("orders", JSON.stringify(next));
      return next;
    });

    saveOrdersEmail(customer.email.trim().toLowerCase());
    return savedWithImages;
  };

  const cancelOrder = async (orderId) => {
    await cancelOrderApi(orderId);
    // ✅ persist cancelled status to localStorage
    setOrders(prev => {
      const next = prev.map(o =>
        o.id === orderId ? { ...o, status: "CANCELLED" } : o
      );
      localStorage.setItem("orders", JSON.stringify(next));
      return next;
    });
  };

  const loadOrdersByEmail = async (email) => {
    if (!email || !email.trim()) throw new Error("Email is required");

    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await getOrdersByEmail(cleanEmail);
      const list = Array.isArray(data) ? data : [];

      const normalized = list.map(order => ({
        ...order,
        items: (order.items || []).map(item => ({
          ...item,
          imageUrl: resolveImage(item) || null,
        })),
      }));

      // ✅ persist fetched orders to localStorage
      saveOrders(normalized);
      saveOrdersEmail(cleanEmail);
      return normalized;

    } catch (e) {
      console.error("loadOrdersByEmail failed:", {
        status:  e?.response?.status,
        data:    e?.response?.data,
        message: e?.message,
        email:   cleanEmail,
      });
      throw e;
    }
  };

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      orders,
      addOrder,
      cancelOrder,
      loadOrdersByEmail,
      ordersEmail,
      cartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);