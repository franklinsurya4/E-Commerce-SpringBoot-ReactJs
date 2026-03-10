import { getCart, clearCart } from "../utils/cartUtils";
import { placeOrder } from "../services/orderService";
import { useState } from "react";

export default function Checkout() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const cart = getCart();

  const submitOrder = async () => {
    if (cart.length === 0) {
      setMessage("Cart is empty");
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      orderLineItemsDtoList: cart.map(item => ({
        skuCode: item.name.toLowerCase().replaceAll(" ", "_"),
        price: item.price,
        quantity: item.quantity
      }))
    };

    try {
      const res = await placeOrder(payload);
      setMessage("✅ Order placed successfully");
      clearCart();
    } catch (err) {
      let errMsg = "Order service unavailable";
      if (err.response?.data?.error) errMsg = err.response.data.error;
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Checkout</h2>

      <button onClick={submitOrder} disabled={loading}>
        {loading ? "Placing Order..." : "Place Order"}
      </button>

      {message && <div className="message">{message}</div>}
    </div>
  );
}
