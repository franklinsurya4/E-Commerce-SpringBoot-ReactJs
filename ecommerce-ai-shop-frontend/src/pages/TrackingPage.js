import React, { useState } from 'react';
import { Search, Package, MapPin, Copy } from 'lucide-react';
import { orderAPI } from '../api/api';
import toast from 'react-hot-toast';

export default function TrackingPage() {
  const [trackingNum, setTrackingNum] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNum.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await orderAPI.track(trackingNum.trim());
      setOrder(res.data.data);
    } catch {
      setOrder(null);
      toast.error('Order not found. Try tracking number (TRK-...) or order number (ORD-...)');
    }
    setLoading(false);
  };

  const copyNumber = (num) => {
    navigator.clipboard.writeText(num);
    toast.success('Copied!');
  };

  const statusBadge = (status) => {
    const map = { PENDING: 'badge-warning', CONFIRMED: 'badge-accent', PROCESSING: 'badge-accent', SHIPPED: 'badge-accent', OUT_FOR_DELIVERY: 'badge-warning', DELIVERED: 'badge-success', CANCELLED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-accent'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  const progressPct = () => {
    if (!order) return 0;
    const stages = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const idx = stages.indexOf(order.status);
    if (order.status === 'CANCELLED') return 0;
    return idx >= 0 ? ((idx + 1) / stages.length) * 100 : 10;
  };

  return (
    <div className="page-container">
      <div className="track-search" style={{ marginBottom: 48 }}>
        <Package size={48} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
        <h1 className="page-title" style={{ textAlign: 'center' }}>Track Your Order</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
          Enter your tracking number (TRK-...) or order number (ORD-...)
        </p>
        <form className="track-search-form" onSubmit={handleTrack}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={trackingNum} onChange={(e) => setTrackingNum(e.target.value)}
              placeholder="TRK-XXXXXXXX or ORD-XXXXXXXX"
              style={{ paddingLeft: 42 }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
      </div>

      {loading && <div className="page-loader"><div className="spinner" /></div>}

      {searched && !loading && !order && (
        <div className="cart-empty">
          <h2>No order found</h2>
          <p>Check the number and try again.</p>
        </div>
      )}

      {order && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{order.orderNumber}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                    {order.trackingNumber}
                  </span>
                  <button onClick={() => copyNumber(order.trackingNumber)} style={{ background: 'none', padding: 2, color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              {statusBadge(order.status)}
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPct()}%`, height: '100%',
                  background: order.status === 'CANCELLED' ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent), var(--success))',
                  borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Confirmed</span><span>Processing</span><span>Shipped</span><span>Out for Delivery</span><span>Delivered</span>
              </div>
            </div>

            {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                <MapPin size={16} color="var(--accent)" />
                <span style={{ fontSize: '0.88rem', color: 'var(--accent)' }}>
                  Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}

            {order.status === 'DELIVERED' && order.deliveredAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'var(--success-soft)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--success)' }}>
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Timeline */}
          {order.trackingEvents?.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 24 }}>Tracking History</h3>
              <div className="tracking-timeline">
                <div className="tracking-line" />
                {order.trackingEvents.map((ev, i) => (
                  <div key={i} className={`tracking-event ${i === 0 ? 'active' : 'completed'}`}>
                    <div className="tracking-dot" />
                    <div className="tracking-event-status">{ev.status.replace(/_/g, ' ')}</div>
                    <div className="tracking-event-desc">{ev.description}</div>
                    <div className="tracking-event-time">{new Date(ev.timestamp).toLocaleString()}</div>
                    {ev.location && <div className="tracking-event-loc">{ev.location}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Items ({order.items?.length})</h3>
            {order.items?.map(item => (
              <div key={item.id} className="order-item-row" style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <img src={item.productImage} alt={item.productName} className="order-item-img" />
                <div className="order-item-details">
                  <div className="order-item-name">{item.productName}</div>
                  <div className="order-item-qty">Qty: {item.quantity}</div>
                </div>
                <span className="order-item-price">${item.lineTotal?.toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-total" style={{ marginTop: 16, marginBottom: 0 }}>
              <span>Total</span><span>${order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}