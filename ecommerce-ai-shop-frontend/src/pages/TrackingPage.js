import React, { useState } from 'react';
import { Search, Package, MapPin, Copy } from 'lucide-react';
import { orderAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import '../styles/TrackingPage.css'

export default function TrackingPage() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
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
      toast.error(t('tracking.notFoundToast')); 
    }
    setLoading(false);
  };

  const copyNumber = (num) => { 
    navigator.clipboard.writeText(num); 
    toast.success(t('tracking.copied')); 
  };

  const statusBadge = (status) => {
    const map = { 
      PENDING: 'badge-warning', 
      CONFIRMED: 'badge-accent', 
      PROCESSING: 'badge-accent', 
      SHIPPED: 'badge-accent', 
      OUT_FOR_DELIVERY: 'badge-warning', 
      DELIVERED: 'badge-success', 
      CANCELLED: 'badge-danger' 
    };
    return <span className={`badge ${map[status] || 'badge-accent'}`}>
      {status.replace(/_/g, ' ')}
    </span>;
  };

  const progressPct = () => {
    if (!order) return 0;
    const stages = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const idx = stages.indexOf(order.status);
    if (order.status === 'CANCELLED') return 0;
    return idx >= 0 ? ((idx + 1) / stages.length) * 100 : 10;
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <div className="track-search">
          <Package size={48} className="track-icon" />
          <h1 className="track-title">{t('tracking.title')}</h1>
          <p className="track-subtitle">{t('tracking.subtitle')}</p>

          <form className="track-search-form" onSubmit={handleTrack}>
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                className="search-input"
                type="text"
                value={trackingNum} 
                onChange={(e) => setTrackingNum(e.target.value)} 
                placeholder={t('tracking.placeholder')} 
              />
            </div>
            <button className="track-btn" type="submit" disabled={loading}>
              {loading ? t('tracking.tracking') : t('tracking.track')}
            </button>
          </form>
        </div>

        {loading && (
          <div className="page-loader">
            <div className="spinner" />
          </div>
        )}

        {searched && !loading && !order && (
          <div className="cart-empty">
            <h2>{t('tracking.noOrderFound')}</h2>
            <p>{t('tracking.checkNumber')}</p>
          </div>
        )}

        {order && (
          <>
            <div className="card">
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.orderNumber}</h3>
                  <div className="tracking-number">
                    <span>{order.trackingNumber}</span>
                    <button onClick={() => copyNumber(order.trackingNumber)} className="copy-btn">
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
                {statusBadge(order.status)}
              </div>

              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${order.status === 'CANCELLED' ? 'cancelled' : 'active'}`}
                    style={{ width: `${progressPct()}%` }}
                  />
                </div>
                <div className="progress-labels">
                  <span>{t('tracking.confirmed')}</span>
                  <span>{t('tracking.processing')}</span>
                  <span>{t('tracking.shipped')}</span>
                  <span>{t('tracking.outForDelivery')}</span>
                  <span>{t('tracking.delivered')}</span>
                </div>
              </div>

              {order.estimatedDelivery && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                <div className="info-alert accent">
                  <MapPin size={16} />
                  <span>
                    {t('orders.estimatedDelivery')}: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}

              {order.status === 'DELIVERED' && order.deliveredAt && (
                <div className="info-alert success">
                  <span>
                    {t('tracking.deliveredOn')} {new Date(order.deliveredAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>

            {order.trackingEvents?.length > 0 && (
              <div className="card">
                <h3 className="items-header">{t('orders.trackingHistory')}</h3>
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

            <div className="card">
              <h3 className="items-header">{t('tracking.items')} ({order.items?.length})</h3>
              {order.items?.map(item => (
                <div key={item.id} className="order-item-row">
                  <img src={item.productImage} alt={item.productName} className="order-item-img" />
                  <div className="order-item-details">
                    <div className="order-item-name">{item.productName}</div>
                    <div className="order-item-qty">{t('buyNowModal.qty')}: {item.quantity}</div>
                  </div>
                  <span className="order-item-price">${item.lineTotal?.toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>{t('tracking.total')}</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}