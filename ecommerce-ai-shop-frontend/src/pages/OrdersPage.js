import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, MapPin, Copy, Settings, ClipboardCheck, Navigation } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { orderAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/OrdersPage.css';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, shippedOrders: 0, deliveredOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const STATUS_CONFIG = {
    PENDING: { color: 'var(--warning)', bg: 'var(--warning-soft)', label: t('orders.pending') },
    CONFIRMED: { color: 'var(--accent)', bg: 'var(--accent-soft)', label: t('orders.confirm') },
    PROCESSING: { color: 'var(--info)', bg: 'rgba(59,130,246,0.12)', label: t('orders.processing') },
    SHIPPED: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: t('orders.shipped') },
    OUT_FOR_DELIVERY: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: t('orders.outForDelivery') },
    DELIVERED: { color: 'var(--success)', bg: 'var(--success-soft)', label: t('orders.delivered') },
    CANCELLED: { color: 'var(--danger)', bg: 'var(--danger-soft)', label: t('orders.cancelled') },
  };

  const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const ACTION_BUTTONS = {
    CONFIRMED:        { label: t('orders.confirm'),          icon: ClipboardCheck, className: 'btn-action btn-action-purple' },
    PROCESSING:       { label: t('orders.process'),          icon: Settings,       className: 'btn-action btn-action-indigo' },
    SHIPPED:          { label: t('orders.shipped'),          icon: Truck,          className: 'btn-action btn-action-blue' },
    OUT_FOR_DELIVERY: { label: t('orders.outForDelivery'),   icon: Navigation,     className: 'btn-action btn-action-amber' },
    DELIVERED:        { label: t('orders.delivered'),        icon: CheckCircle,    className: 'btn-action btn-action-green' },
  };

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([orderAPI.getAll(), orderAPI.getStats()]);
      setOrders(ordersRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) { console.error('Failed to load orders:', err); }
    setLoading(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId); setUpdatingStatus(newStatus);
    try {
      const res = await orderAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      const statsRes = await orderAPI.getStats();
      setStats(statsRes.data.data || {});
      toast.success(`${t('orders.title')} ${newStatus.replace(/_/g, ' ').toLowerCase()}`);
    } catch (err) { toast.error(err?.response?.data?.message || t('settings.failedUpdate')); }
    setUpdatingId(null); setUpdatingStatus(null);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm(t('orders.confirmCancel'))) return;
    setUpdatingId(orderId);
    try {
      const res = await orderAPI.cancel(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      const statsRes = await orderAPI.getStats();
      setStats(statsRes.data.data || {});
      toast.success(t('orders.cancelled'));
    } catch (err) { toast.error(err?.response?.data?.message || t('orders.failedCancel')); }
    setUpdatingId(null);
  };

  const copyTracking = (num) => { navigator.clipboard.writeText(num); toast.success(t('orders.trackingCopied')); };

  const getAvailableActions = (currentStatus) => {
    const currentIdx = STATUS_ORDER.indexOf(currentStatus);
    if (currentIdx < 0 || currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') return [];
    return STATUS_ORDER.slice(currentIdx + 1).filter(s => ACTION_BUTTONS[s]);
  };

  const canCancel = (status) => !['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(status);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      {/* ── Page Title with Font Awesome Icon ── */}
     <div className="page-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'nowrap' }}>
  <FontAwesomeIcon 
    icon={faBoxOpen} 
    className="page-title-icon"
    style={{ display: 'inline-flex', verticalAlign: 'middle', lineHeight: 1 }}
  />
  <h1 className="page-title" style={{ display: 'inline-block', verticalAlign: 'middle', margin: 0 }}>{t('orders.title')}</h1>
</div>

      <div className="orders-stats">
        <div className="stat-card">
          <Package size={22} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.totalOrders || 0}</div>
          <div className="stat-label">{t('orders.totalOrders')}</div>
        </div>
        <div className="stat-card">
          <Clock size={22} color="var(--warning)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.pendingOrders || 0}</div>
          <div className="stat-label">{t('orders.pending')}</div>
        </div>
        <div className="stat-card">
          <Truck size={22} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.shippedOrders || 0}</div>
          <div className="stat-label">{t('orders.shipped')}</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={22} color="var(--success)" style={{ margin: '0 auto 8px' }} />
          <div className="stat-number">{stats.deliveredOrders || 0}</div>
          <div className="stat-label">{t('orders.delivered')}</div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="cart-empty">
          <Package size={56} color="var(--text-muted)" />
          <h2>{t('orders.noOrders')}</h2>
          <p>{t('orders.startShopping')}</p>
          <Link to="/products" className="btn btn-primary">{t('orders.browseProducts')}</Link>
        </div>
      ) : (
        orders.map(order => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const isExpanded = expandedId === order.id;
          const actions = getAvailableActions(order.status);
          const isUpdating = updatingId === order.id;

          return (
            <div key={order.id} className="order-card">
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
                  <span className="badge" style={{ background: config.bg, color: config.color }}>{config.label}</span>
                  <span className="order-total">${order.total?.toFixed(2)}</span>
                  {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {isExpanded && (
                <>
                  <div className="order-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                      <MapPin size={14} color="var(--accent)" />
                      <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', flex: 1 }}>{order.trackingNumber}</span>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); copyTracking(order.trackingNumber); }} style={{ padding: '4px 8px' }}>
                        <Copy size={14} /> {t('orders.copy')}
                      </button>
                    </div>

                    <div className="order-items-list">
                      {order.items?.map(item => (
                        <div key={item.id} className="order-item-row">
                          <img src={item.productImage} alt={item.productName} className="order-item-img" />
                          <div className="order-item-details">
                            <div className="order-item-name">{item.productName}</div>
                            <div className="order-item-qty">{t('buyNowModal.qty')}: {item.quantity} × ${item.price?.toFixed(2)}</div>
                          </div>
                          <span className="order-item-price">${item.lineTotal?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.shippingAddress && (
                      <div style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{t('orders.shipTo')}:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZip}, {order.shippingCountry}
                      </div>
                    )}

                    {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--accent)' }}>
                        {t('orders.estimatedDelivery')}: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {actions.map(status => {
                        const btn = ACTION_BUTTONS[status]; const Icon = btn.icon;
                        const isThis = isUpdating && updatingStatus === status;
                        return (
                          <button key={status} className={`btn btn-sm ${btn.className}`}
                            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, status); }} disabled={isUpdating}>
                            {isThis ? <span className="btn-spinner" /> : <Icon size={14} />} {btn.label}
                          </button>
                        );
                      })}
                      {canCancel(order.status) && (
                        <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); handleCancel(order.id); }} disabled={isUpdating}>
                          <XCircle size={14} /> {t('orders.cancel')}
                        </button>
                      )}
                      <Link to="/tracking" className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
                        <Truck size={14} /> {t('orders.track')}
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

      <style>{`
        .btn-action { display: inline-flex; align-items: center; gap: 5px; font-weight: 600; border: 1px solid transparent; transition: all 0.2s ease; }
        .btn-action:hover:not(:disabled) { color: #fff !important; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-action-purple { background: rgba(139,92,246,0.1); color: #8b5cf6; border-color: rgba(139,92,246,0.2); }
        .btn-action-purple:hover:not(:disabled) { background: #8b5cf6; }
        .btn-action-indigo { background: rgba(99,102,241,0.1); color: #6366f1; border-color: rgba(99,102,241,0.2); }
        .btn-action-indigo:hover:not(:disabled) { background: #6366f1; }
        .btn-action-blue { background: rgba(59,130,246,0.1); color: #3b82f6; border-color: rgba(59,130,246,0.2); }
        .btn-action-blue:hover:not(:disabled) { background: #3b82f6; }
        .btn-action-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
        .btn-action-amber:hover:not(:disabled) { background: #f59e0b; }
        .btn-action-green { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.2); }
        .btn-action-green:hover:not(:disabled) { background: #10b981; }
        .btn-spinner { width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: btnSpin 0.6s linear infinite; display: inline-block; }
        @keyframes btnSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}