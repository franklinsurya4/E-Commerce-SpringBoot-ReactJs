import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Copy } from 'lucide-react';
import { orderAPI } from '../api/api';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  PENDING: { color: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Pending' },
  CONFIRMED: { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Confirmed' },
  PROCESSING: { color: 'var(--info)', bg: 'rgba(59,130,246,0.12)', label: 'Processing' },
  SHIPPED: { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Shipped' },
  OUT_FOR_DELIVERY: { color: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Out for Delivery' },
  DELIVERED: { color: 'var(--success)', bg: 'var(--success-soft)', label: 'Delivered' },
  CANCELLED: { color: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Cancelled' },
};

const STATUS_FLOW = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, shippedOrders: 0, deliveredOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        orderAPI.getAll(),
        orderAPI.getStats(),
      ]);
      setOrders(ordersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus);
      const updated = res.data.data;
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      // Refresh stats
      const statsRes = await orderAPI.getStats();
      setStats(statsRes.data.data || {});
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
    setUpdatingId(null);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderAPI.cancel(orderId);
      const updated = res.data.data;
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      const statsRes = await orderAPI.getStats();
      setStats(statsRes.data.data || {});
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    }
  };

  const copyTracking = (num) => {
    navigator.clipboard.writeText(num);
    toast.success('Tracking number copied!');
  };

  const getNextStatus = (currentStatus) => {
    const idx = STATUS_FLOW.indexOf(currentStatus);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">My Orders</h1>

      {/* Stats */}
      <div className="orders-stats">
        <div className="stat-card">
          <Package size={22} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="stat-card">
          <Clock size={22} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.pendingOrders || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <Truck size={22} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.shippedOrders || 0}</div>
          <div className="stat-label">Shipped</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={22} color="var(--success)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.deliveredOrders || 0}</div>
          <div className="stat-label">Delivered</div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="cart-empty">
          <Package size={56} color="var(--text-muted)" />
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        orders.map(order => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const isExpanded = expandedId === order.id;
          const nextStatus = getNextStatus(order.status);
          const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status);

          return (
            <div key={order.id} className="order-card">
              {/* Header */}
              <div className="order-card-header" onClick={() => setExpandedId(isExpanded ? null : order.id)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                  <div>
                    <span className="order-number">{order.orderNumber}</span>
                    <span className="order-date" style={{ display: 'block' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="badge" style={{ background: config.bg, color: config.color }}>
                    {config.label}
                  </span>
                  <span className="order-total">${order.total?.toFixed(2)}</span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Expanded Body */}
              {isExpanded && (
                <>
                  <div className="order-card-body">
                    {/* Tracking Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <MapPin size={14} color="var(--accent)" />
                      <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', flex: 1 }}>
                        {order.trackingNumber}
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); copyTracking(order.trackingNumber); }} style={{ padding: '4px 8px' }}>
                        <Copy size={14} /> Copy
                      </button>
                    </div>

                    {/* Items */}
                    <div className="order-items-list">
                      {order.items?.map(item => (
                        <div key={item.id} className="order-item-row">
                          <img src={item.productImage} alt={item.productName} className="order-item-img" />
                          <div className="order-item-details">
                            <div className="order-item-name">{item.productName}</div>
                            <div className="order-item-qty">Qty: {item.quantity} × ${item.price?.toFixed(2)}</div>
                          </div>
                          <span className="order-item-price">${item.lineTotal?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping */}
                    {order.shippingAddress && (
                      <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Ship to:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}, {order.shippingCountry}
                      </div>
                    )}

                    {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--accent)' }}>
                        Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Footer with Actions */}
                  <div className="order-card-footer">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {/* Status Update Button */}
                      {nextStatus && order.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, nextStatus); }}
                          disabled={updatingId === order.id}
                        >
                          {updatingId === order.id ? 'Updating...' : `Mark as ${nextStatus.replace(/_/g, ' ')}`}
                        </button>
                      )}

                      {/* Cancel Button */}
                      {canCancel && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      )}

                      {/* Track Button */}
                      <Link
                        to={`/tracking`}
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Truck size={14} /> Track
                      </Link>
                    </div>

                    <div className="order-total">${order.total?.toFixed(2)}</div>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}