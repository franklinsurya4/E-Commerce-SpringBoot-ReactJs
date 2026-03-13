import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Cart.css";

export default function Cart() {
  const {
    cartItems = [],
    removeFromCart,
    updateQuantity,
    clearCart,
    addOrder,
  } = useCart();

  const navigate = useNavigate();

  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [address,    setAddress]    = useState("");
  const [placing,    setPlacing]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [err,        setErr]        = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total    = subtotal + shipping;

  const selectedItem     = cartItems.find(i => i.id === selectedId) || null;
  const selectedSubtotal = selectedItem ? selectedItem.price * selectedItem.quantity : subtotal;
  const selectedShipping = selectedItem ? (selectedItem.price * selectedItem.quantity > 999 ? 0 : 99) : shipping;
  const selectedTotal    = selectedSubtotal + selectedShipping;

  const handleCheckout = async (e) => {
    e.preventDefault();
    const snapshot = [...cartItems];
    if (!snapshot.length)                          { setErr("Your cart is empty.");                  return; }
    if (!name.trim() || !email.trim() || !address.trim()) { setErr("Please fill in all delivery details."); return; }

    setErr("");
    setPlacing(true);
    try {
      await addOrder({ name, email, address }, snapshot);
      clearCart();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate("/orders", { state: { email } });
      }, 2000);
    } catch (error) {
      console.error("Checkout error:", error);
      setErr(
        error?.response?.data?.message ||
        error?.message ||
        "Order failed. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────
  if (success) return (
    <div className="cart-page cart-success-screen">
      <div className="cart-success-card">
        <div className="cart-success-icon">🎉</div>
        <h2>Order Placed!</h2>
        <p>Confirmation sent to <strong>{email}</strong></p>
        <p className="cart-success-sub">Redirecting to Orders…</p>
      </div>
    </div>
  );

  return (
    <div className="cart-page">

      {/* ── HEADER ── */}
      <div className="cart-header">
        <h1 className="cart-title">My Cart</h1>
        <span className="cart-count">
          {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── EMPTY STATE ── */}
      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <div className="cart-empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our categories and add products you love.</p>
          <Link to="/categories" className="cart-empty-btn">Browse Products</Link>
        </div>

      ) : (
        <div className="cart-layout">

          {/* ── LEFT: CART ITEMS ── */}
          <div className="cart-items-col">
            {cartItems.map(item => (
              <div
                key={item.id}
                className={`cart-card ${selectedId === item.id ? "cart-card-selected" : ""}`}
                onClick={() => setSelectedId(prev => prev === item.id ? null : item.id)}
              >
                {/* Image */}
                <div className="cart-card-img">
                  <img
                    src={item.imageUrl || item.image || item.imgUrl || "https://via.placeholder.com/100x100?text=?"}
                    alt={item.name}
                    onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100x100?text=?"; }}
                  />
                </div>

                {/* Info */}
                <div className="cart-card-info">
                  <span className="cart-card-cat">{item.category}</span>
                  <span className="cart-card-name">{item.name}</span>
                  <span className="cart-card-price">₹{item.price.toLocaleString("en-IN")}</span>
                </div>

                {/* Actions — stopPropagation so buttons don't trigger card select */}
                <div className="cart-card-actions" onClick={e => e.stopPropagation()}>
                  <span className="cart-line-total">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                  <div className="cart-qty-ctrl">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => { if (selectedId === item.id) setSelectedId(null); removeFromCart(item.id); }}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <button className="cart-clear-btn" onClick={() => { clearCart(); setSelectedId(null); }}>
              Clear Cart
            </button>
          </div>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <div className="cart-summary-col">
            <div className="cart-summary-box">

              {/* Title */}
              <p className="cart-summary-title">
                {selectedItem ? "Product Summary" : "Order Summary"}
              </p>

              {/* Selected product preview */}
              {selectedItem ? (
                <div className="cart-selected-preview">
                  <img
                    src={selectedItem.imageUrl || selectedItem.image || selectedItem.imgUrl || "https://via.placeholder.com/52?text=?"}
                    alt={selectedItem.name}
                    onError={e => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/52?text=?"; }}
                  />
                  <div className="cart-selected-preview-info">
                    <p className="cart-selected-preview-name">{selectedItem.name}</p>
                    <p className="cart-selected-preview-cat">{selectedItem.category}</p>
                    <p className="cart-selected-preview-qty">
                      ₹{selectedItem.price.toLocaleString("en-IN")} × {selectedItem.quantity}
                    </p>
                  </div>
                  <button
                    className="cart-selected-clear-btn"
                    onClick={() => setSelectedId(null)}
                    title="Show full cart"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <p className="cart-summary-hint">Click a product to preview its summary</p>
              )}

              <hr className="cart-sum-divider" />

              {/* Subtotal row */}
              <div className="cart-summary-line">
                <span>{selectedItem ? "Item Subtotal" : "Subtotal"}</span>
                <span>₹{selectedSubtotal.toLocaleString("en-IN")}</span>
              </div>

              {/* Shipping row */}
              <div className="cart-summary-line">
                <span>Shipping</span>
                {selectedShipping === 0
                  ? <span className="free-ship">FREE</span>
                  : <span>₹{selectedShipping}</span>
                }
              </div>

              {/* When product selected — show full cart totals in muted style */}
              {selectedItem && (
                <>
                  <hr className="cart-sum-divider" />
                  <div className="cart-summary-line muted">
                    <span>All items subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="cart-summary-line muted">
                    <span>All items shipping</span>
                    {shipping === 0
                      ? <span className="free-ship">FREE</span>
                      : <span>₹{shipping}</span>
                    }
                  </div>
                </>
              )}

              {/* Free shipping nudge — only when no product selected */}
              {!selectedItem && subtotal <= 999 && (
                <p className="cart-free-note">
                  Add ₹{(1000 - subtotal).toLocaleString("en-IN")} more for free shipping
                </p>
              )}

              <hr className="cart-sum-divider" />

              {/* Item / Cart total */}
              <div className="cart-summary-total">
                <span>{selectedItem ? "Item Total" : "Total"}</span>
                <span>₹{selectedTotal.toLocaleString("en-IN")}</span>
              </div>

              {/* Cart total accent row — only when product selected */}
              {selectedItem && (
                <div className="cart-summary-total accent">
                  <span>Cart Total</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              )}

              <hr className="cart-sum-divider" />

              {/* Delivery form */}
              <p className="cart-form-heading">Delivery Details</p>

              <form onSubmit={handleCheckout}>

                <div className="cart-field">
                  <label>Full Name</label>
                  <input
                    required
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div className="cart-field">
                  <label>Email</label>
                  <input
                    required
                    type="email"
                    placeholder="rahul@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="cart-field">
                  <label>Delivery Address</label>
                  <textarea
                    required
                    placeholder="Street, City, State, PIN"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>

                {err && <p className="cart-err">{err}</p>}

                <button
                  type="submit"
                  className="cart-place-btn"
                  disabled={placing}
                >
                  {placing
                    ? "Placing Order…"
                    : `Place Order (${cartItems.length} item${cartItems.length !== 1 ? "s" : ""}) →`
                  }
                </button>

              </form>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}