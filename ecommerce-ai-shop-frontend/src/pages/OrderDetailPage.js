import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import { orderAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then(r => setOrder(r.data.data)).catch(() => toast.error(t('tracking.noOrderFound'))).finally(() => setLoading(false));
  }, [id, t]);

  const cancelOrder = async () => {
    if (!window.confirm(t('orders.confirmCancel'))) return;
    try { const res = await orderAPI.cancel(id); setOrder(res.data.data); toast.success(t('orders.cancelled')); }
    catch (e) { toast.error(e.response?.data?.message || t('orders.failedCancel')); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!order) return <div className="page-container"><p>{t('tracking.noOrderFound')}</p></div>;

  const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status);
  const statusBadge = (status) => {
    const map = { PENDING: 'badge-warning', CONFIRMED: 'badge-accent', PROCESSING: 'badge-accent', SHIPPED: 'badge-accent', OUT_FOR_DELIVERY: 'badge-warning', DELIVERED: 'badge-success', CANCELLED: 'badge-danger' };
    return <span className={`badge ${map[status] || 'badge-accent'}`}>{status.replace(/_/g, ' ')}</span>;
  };

  return (
    <div className="page-container">
      <Link to="/orders" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}><ArrowLeft size={16} /> {t('orders.backToOrders')}</Link>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>{order.orderNumber}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            {t('orders.placedOn')} {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {statusBadge(order.status)}
          {canCancel && <button className="btn btn-danger btn-sm" onClick={cancelOrder}>{t('orders.cancelOrder')}</button>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><MapPin size={18} /> {t('orders.shippingAddress')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {order.shippingAddress}<br />{order.shippingCity}, {order.shippingState} {order.shippingZip}<br />{order.shippingCountry}
          </p>
        </div>
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><CreditCard size={18} /> {t('orders.paymentMethod')}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('orders.method')}: {order.paymentMethod?.replace('_', ' ')}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>{t('buyNowModal.tracking')}: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{order.trackingNumber}</span></p>
          {order.estimatedDelivery && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{t('orders.estDelivery')}: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>}
        </div>
      </div>

      {order.trackingEvents?.length > 0 && (
        <div className="card" style={{ marginBottom: 32 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}><Package size={18} /> {t('orders.trackingHistory')}</h3>
          <div className="tracking-timeline">
            <div className="tracking-line" />
            {order.trackingEvents.map((ev, i) => (
              <div key={i} className={`tracking-event ${i === 0 ? 'active' : 'completed'}`}>
                <div className="tracking-dot" />
                <div className="tracking-event-status">{ev.status.replace(/_/g, ' ')}</div>
                <div className="tracking-event-desc">{ev.description}</div>
                <div className="tracking-event-time">{new Date(ev.timestamp).toLocaleString()}</div>
                <div className="tracking-event-loc">{ev.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>{t('orders.items')}</h3>
        {order.items?.map(item => (
          <div key={item.id} className="order-item-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <img src={item.productImage} alt={item.productName} className="order-item-img" />
            <div className="order-item-details">
              <Link to={`/products/${item.productId}`} className="order-item-name" style={{ color: 'var(--text-primary)' }}>{item.productName}</Link>
              <div className="order-item-qty">{t('buyNowModal.qty')}: {item.quantity} × ${item.price?.toFixed(2)}</div>
            </div>
            <span className="order-item-price">${item.lineTotal?.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ paddingTop: 16, textAlign: 'right' }}>
          <div className="summary-row"><span>{t('buyNowModal.subtotal')}</span><span>${order.subtotal?.toFixed(2)}</span></div>
          <div className="summary-row"><span>{t('buyNowModal.tax')}</span><span>${order.tax?.toFixed(2)}</span></div>
          <div className="summary-row"><span>{t('buyNowModal.shipping')}</span><span>{order.shippingCost > 0 ? `$${order.shippingCost?.toFixed(2)}` : t('orders.free')}</span></div>
          <div className="summary-total"><span>{t('buyNowModal.total')}</span><span>${order.total?.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}