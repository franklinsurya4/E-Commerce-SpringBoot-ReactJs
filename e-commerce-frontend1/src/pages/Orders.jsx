import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { markAsDelivered, markAsShipped } from "../api/api";   // ✅ import markAsShipped
import "../styles/Orders.css";

const PLACEHOLDER = "https://via.placeholder.com/80?text=Product";

const statusColors = {
  PENDING:   { bg: "#fff8e1", text: "#f59e0b", dot: "#f59e0b" },
  CONFIRMED: { bg: "#e8f5e9", text: "#22c55e", dot: "#22c55e" },
  SHIPPED:   { bg: "#e3f2fd", text: "#3b82f6", dot: "#3b82f6" },
  DELIVERED: { bg: "#f3e8ff", text: "#a855f7", dot: "#a855f7" },
  CANCELLED: { bg: "#fde8e8", text: "#ef4444", dot: "#ef4444" },
};

const resolveImage = (item) =>
  item.imageUrl  ||
  item.image     ||
  item.imgUrl    ||
  item.img       ||
  item.thumbnail ||
  item.photo     ||
  PLACEHOLDER;

function StatusBadge({ status = "CONFIRMED" }) {
  const style = statusColors[status] || statusColors.CONFIRMED;
  return (
    <span
      className="order-status-badge"
      style={{ background: style.bg, color: style.text }}
    >
      <span className="order-status-dot" style={{ background: style.dot }} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function OrderItemImage({ item }) {
  const [src, setSrc] = useState(resolveImage(item));

  useEffect(() => {
    setSrc(resolveImage(item));
  }, [item]);

  return (
    <img
      src={src}
      alt={item.productName || item.name || "Product"}
      onError={() => setSrc(PLACEHOLDER)}
    />
  );
}

export default function Orders() {
  const {
    orders = [],
    loadOrdersByEmail,
    cancelOrder,
    ordersEmail,
  } = useCart();

  const location = useLocation();

  const [emailInput,   setEmailInput]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fetchErr,     setFetchErr]     = useState("");
  const [actionErr,    setActionErr]    = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [deliveringId, setDeliveringId] = useState(null);
  const [shippingId,   setShippingId]   = useState(null);   // ✅ NEW

  // Restore email on mount
  useEffect(() => {
    const emailFromNav = location.state?.email;
    if (emailFromNav) {
      setEmailInput(emailFromNav);
      fetchOrders(emailFromNav);
    } else if (ordersEmail) {
      setEmailInput(ordersEmail);
      if (orders.length === 0) {
        fetchOrders(ordersEmail);
      }
    }
  }, []);

  const fetchOrders = async (overrideEmail) => {
    const target = (overrideEmail || emailInput).trim();
    if (!target) { setFetchErr("Please enter your email."); return; }
    setLoading(true);
    setFetchErr("");
    try {
      await loadOrdersByEmail(target);
    } catch (e) {
      setFetchErr(e?.response?.data?.message || e?.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setActionErr("");
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } catch (e) {
      setActionErr(`Could not cancel order #${orderId}. Please try again.`);
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ NEW: Mark as Shipped — moves CONFIRMED → SHIPPED
  const handleShip = async (orderId) => {
    setActionErr("");
    setShippingId(orderId);
    try {
      await markAsShipped(orderId);
      await loadOrdersByEmail(ordersEmail || emailInput);
    } catch (e) {
      setActionErr(`Could not mark order #${orderId} as shipped. Please try again.`);
    } finally {
      setShippingId(null);
    }
  };

  // Mark as Delivered — moves SHIPPED → DELIVERED
  const handleDeliver = async (orderId) => {
    setActionErr("");
    setDeliveringId(orderId);
    try {
      await markAsDelivered(orderId);
      await loadOrdersByEmail(ordersEmail || emailInput);
    } catch (e) {
      setActionErr(`Could not mark order #${orderId} as delivered. Please try again.`);
    } finally {
      setDeliveringId(null);
    }
  };

  return (
    <div className="orders-page">

      {/* Header */}
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        {ordersEmail && (
          <span className="orders-count">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Email lookup */}
      <div className="orders-email-lookup">
        <input
          type="email"
          placeholder="Enter your email to view orders"
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchOrders()}
        />
        <button onClick={() => fetchOrders()} disabled={loading}>
          {loading ? "Loading…" : "Load Orders"}
        </button>
      </div>

      {fetchErr  && <p className="orders-err">{fetchErr}</p>}
      {actionErr && <p className="orders-err">{actionErr}</p>}

      {/* Spinner */}
      {loading && (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Fetching your orders…</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && ordersEmail && orders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>No orders placed with <strong>{ordersEmail}</strong>.</p>
          <Link to="/categories" className="orders-browse-btn">
            Start Shopping
          </Link>
        </div>
      )}

      {/* Orders list */}
      {!loading && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">

              {/* Header */}
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  <span className="order-date">
                    {order.placedAt
                      ? new Date(order.placedAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Customer info */}
              <div className="order-customer">
                <span className="order-customer-name">👤 {order.customerName}</span>
                <span className="order-customer-email">✉️ {order.customerEmail}</span>
                {order.deliveryAddress && (
                  <span className="order-customer-address">📍 {order.deliveryAddress}</span>
                )}
              </div>

              {/* Items */}
              <div className="order-items-grid">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="order-item-card">
                    <div className="order-item-img">
                      <OrderItemImage item={item} />
                    </div>
                    <div className="order-item-info">
                      {item.category && (
                        <span className="order-item-cat">{item.category}</span>
                      )}
                      <p className="order-item-name">
                        {item.productName || item.name}
                      </p>
                      <div className="order-item-bottom">
                        <span className="order-item-price">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                        <span className="order-item-qty">× {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="order-card-footer">
                <span className="order-total-label">Order Total</span>
                <span className="order-total-amount">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </span>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                  {/* ✅ Mark as Shipped — CONFIRMED only */}
                  {order.status === "CONFIRMED" && (
                    <button
                      className="order-ship-btn"
                      disabled={shippingId === order.id}
                      onClick={() => handleShip(order.id)}
                    >
                      {shippingId === order.id ? "Updating…" : "🚚 Mark as Shipped"}
                    </button>
                  )}

                  {/* Mark as Delivered — SHIPPED only */}
                  {order.status === "SHIPPED" && (
                    <button
                      className="order-deliver-btn"
                      disabled={deliveringId === order.id}
                      onClick={() => handleDeliver(order.id)}
                    >
                      {deliveringId === order.id ? "Updating…" : "✓ Mark as Delivered"}
                    </button>
                  )}

                  {/* Cancel — hide if delivered or cancelled */}
                  {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                    <button
                      className="order-cancel-btn"
                      disabled={cancellingId === order.id}
                      onClick={() => handleCancel(order.id)}
                    >
                      {cancellingId === order.id ? "Cancelling…" : "Cancel Order"}
                    </button>
                  )}

                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}