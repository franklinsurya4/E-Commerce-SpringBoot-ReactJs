import { getCart, saveCart } from "../utils/cartUtils";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState(getCart());

  const updateQty = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;

    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }

    setCart(updated);
    saveCart(updated);
  };

  return (
    <div className="container">
      <h2>Cart</h2>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((item, idx) => (
        <div className="card" key={idx}>
          <strong>{item.name}</strong>
          <p>₹{item.price}</p>

          <div>
            <button onClick={() => updateQty(idx, -1)}>-</button>
            <span style={{ margin: "0 10px" }}>{item.quantity}</span>
            <button onClick={() => updateQty(idx, 1)}>+</button>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <Link to="/checkout">
          <button style={{ marginTop: 15 }}>Proceed to Checkout</button>
        </Link>
      )}
    </div>
  );
}
