import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell, TrendingDown, TrendingUp, PartyPopper, Package,
  Tag, ChevronRight, Check, CheckCheck, Trash2, Filter,
  Clock, Gift, Percent, ShoppingBag, Star, Flame, X,
  Calendar, Sparkles, BellOff, RefreshCw
} from 'lucide-react';
import '../styles/NotificationsPage.css';

/* ── Notification type config ── */
const NOTIF_CONFIG = {
  FESTIVAL_OFFER: {
    icon: PartyPopper,
    color: '#e8735a',
    bg: 'rgba(232, 115, 90, 0.1)',
    label: 'Festival Offer',
  },
  PRICE_DROP: {
    icon: TrendingDown,
    color: '#2ecc71',
    bg: 'rgba(46, 204, 113, 0.1)',
    label: 'Price Drop',
  },
  PRICE_INCREASE: {
    icon: TrendingUp,
    color: '#e8a838',
    bg: 'rgba(232, 168, 56, 0.1)',
    label: 'Price Increase',
  },
  FLASH_SALE: {
    icon: Flame,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    label: 'Flash Sale',
  },
  ORDER_UPDATE: {
    icon: Package,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    label: 'Order Update',
  },
  NEW_ARRIVAL: {
    icon: Sparkles,
    color: '#d4a843',
    bg: 'rgba(212, 168, 67, 0.1)',
    label: 'New Arrival',
  },
  COUPON: {
    icon: Percent,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    label: 'Coupon',
  },
  WISHLIST_SALE: {
    icon: Tag,
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.1)',
    label: 'Wishlist Sale',
  },
  REWARD: {
    icon: Gift,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    label: 'Reward',
  },
  SYSTEM: {
    icon: Bell,
    color: '#8b8fa8',
    bg: 'rgba(139, 143, 168, 0.1)',
    label: 'System',
  },
};

const FILTER_TABS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'offers', label: 'Offers', icon: Tag },
  { key: 'price', label: 'Price Alerts', icon: TrendingDown },
  { key: 'orders', label: 'Orders', icon: Package },
];

/* ── Map notification to offer deal ID for deep-linking ── */
const NOTIF_TO_DEAL = {
  1: 'diwali-mega',
  3: 'flash-sale',
  9: 'easter-special',
};

/* ── Demo notifications ── */
const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: 'FESTIVAL_OFFER',
    title: 'Diwali Mega Sale is LIVE!',
    message: 'Up to 70% off on Electronics, Fashion & Home. Use code DIWALI70 for extra 10% off. Ends in 48 hours!',
    productId: null,
    imageUrl: null,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    dealId: 'diwali-mega',
  },
  {
    id: 2,
    type: 'PRICE_DROP',
    title: 'Price dropped on Sony WH-1000XM5',
    message: 'Good news! The Sony WH-1000XM5 Headphones you viewed dropped from $399.99 to $279.99 — a 30% savings!',
    productId: 12,
    imageUrl: null,
    oldPrice: 399.99,
    newPrice: 279.99,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 3,
    type: 'FLASH_SALE',
    title: 'Flash Sale: 4 Hours Left!',
    message: 'Smartphones starting at $199. Premium brands at unbeatable prices. Limited stock!',
    productId: null,
    imageUrl: null,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    dealId: 'flash-sale',
  },
  {
    id: 4,
    type: 'ORDER_UPDATE',
    title: 'Order #QP-20260328 Shipped!',
    message: 'Your order has been shipped via FedEx. Tracking: FX928374651. Estimated delivery: March 31.',
    productId: null,
    imageUrl: null,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 5,
    type: 'PRICE_INCREASE',
    title: 'Samsung Galaxy S25 Ultra price rising',
    message: 'The Samsung Galaxy S25 Ultra will increase from $1,199.99 to $1,299.99 starting tomorrow. Buy now to lock in the current price!',
    productId: 8,
    imageUrl: null,
    oldPrice: 1199.99,
    newPrice: 1299.99,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 6,
    type: 'WISHLIST_SALE',
    title: 'Your wishlist item is on sale!',
    message: 'Nike Air Max 90 from your wishlist is now 25% off. Don\'t miss out — only 3 left in your size!',
    productId: 22,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 7,
    type: 'COUPON',
    title: 'Exclusive coupon just for you!',
    message: 'Use code LOYAL15 at checkout for 15% off your next purchase. Valid for 7 days.',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    dealId: 'new-user',
  },
  {
    id: 8,
    type: 'NEW_ARRIVAL',
    title: 'New Arrivals: Spring Collection 2026',
    message: 'Discover 50+ new styles in our Spring Collection. Fresh fashion, curated for you.',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    dealId: 'spring-collection',
  },
  {
    id: 9,
    type: 'FESTIVAL_OFFER',
    title: 'Easter Weekend Special',
    message: 'Buy 2, Get 1 Free on all Home & Living products this Easter weekend. Auto-applied at checkout!',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    dealId: 'easter-special',
  },
  {
    id: 10,
    type: 'REWARD',
    title: 'You earned 500 QP Points!',
    message: 'Your recent purchase earned you 500 reward points. You now have 2,350 points — redeem them for discounts!',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 11,
    type: 'PRICE_DROP',
    title: 'Apple AirPods Pro 2 price cut!',
    message: 'The AirPods Pro 2 just dropped from $249.99 to $189.99. Lowest price in 3 months.',
    productId: 15,
    imageUrl: null,
    oldPrice: 249.99,
    newPrice: 189.99,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

/* ── Time formatter ── */
function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Countdown for expiry ── */
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setRemaining(`${d}d ${h % 24}h left`);
      } else {
        setRemaining(`${h}h ${m}m ${s}s left`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

/* ── Price Badge ── */
function PriceBadge({ oldPrice, newPrice, type }) {
  if (!oldPrice || !newPrice) return null;
  const pct = Math.abs(Math.round((1 - newPrice / oldPrice) * 100));
  const isDown = type === 'PRICE_DROP';

  return (
    <div className={`notif-price-badge ${isDown ? 'notif-price-badge--down' : 'notif-price-badge--up'}`}>
      <div className="notif-price-row">
        <span className="notif-price-old">${oldPrice.toFixed(2)}</span>
        <ChevronRight size={14} />
        <span className="notif-price-new">${newPrice.toFixed(2)}</span>
      </div>
      <span className="notif-price-pct">
        {isDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
        {pct}% {isDown ? 'off' : 'increase'}
      </span>
    </div>
  );
}

/* ── Countdown Badge ── */
function CountdownBadge({ expiresAt }) {
  const remaining = useCountdown(expiresAt);
  if (!remaining) return null;
  const isExpired = remaining === 'Expired';

  return (
    <span className={`notif-countdown ${isExpired ? 'notif-countdown--expired' : ''}`}>
      <Clock size={12} />
      {remaining}
    </span>
  );
}

/* ── Single Notification Card ── */
function NotificationCard({ notif, onRead, onDelete }) {
  const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.SYSTEM;
  const Icon = config.icon;

  /* Build the Shop Now / View Deals link */
  const getOfferLink = () => {
    if (notif.dealId) return `/offers?deal=${notif.dealId}`;
    return '/offers';
  };

  return (
    <div className={`notif-card ${notif.read ? '' : 'notif-card--unread'}`}>
      {/* Unread indicator */}
      {!notif.read && <div className="notif-unread-dot" style={{ background: config.color }} />}

      {/* Icon */}
      <div className="notif-icon" style={{ background: config.bg, color: config.color }}>
        <Icon size={20} strokeWidth={2} />
      </div>

      {/* Body */}
      <div className="notif-body">
        <div className="notif-header">
          <span className="notif-type-label" style={{ color: config.color }}>{config.label}</span>
          <span className="notif-time">{timeAgo(notif.createdAt)}</span>
        </div>

        <h3 className="notif-title">{notif.title}</h3>
        <p className="notif-message">{notif.message}</p>

        {/* Price badge */}
        {(notif.type === 'PRICE_DROP' || notif.type === 'PRICE_INCREASE') && (
          <PriceBadge oldPrice={notif.oldPrice} newPrice={notif.newPrice} type={notif.type} />
        )}

        {/* Countdown for offers */}
        {notif.expiresAt && <CountdownBadge expiresAt={notif.expiresAt} />}

        {/* Action row */}
        <div className="notif-actions">
          {/* Product-specific link */}
          {notif.productId && (
            <Link to={`/products/${notif.productId}`} className="notif-action-btn notif-action-btn--primary">
              <ShoppingBag size={14} />
              View Product
            </Link>
          )}

          {/* Festival / Flash / New Arrival → Offers page */}
          {(notif.type === 'FESTIVAL_OFFER' || notif.type === 'FLASH_SALE' || notif.type === 'NEW_ARRIVAL') && !notif.productId && (
            <Link to={getOfferLink()} className="notif-action-btn notif-action-btn--primary">
              <ShoppingBag size={14} />
              Shop Now
            </Link>
          )}

          {/* Order update → Orders page */}
          {notif.type === 'ORDER_UPDATE' && (
            <Link to="/orders" className="notif-action-btn notif-action-btn--primary">
              <Package size={14} />
              View Order
            </Link>
          )}

          {/* Coupon → Offers page with deal param */}
          {notif.type === 'COUPON' && (
            <Link to={getOfferLink()} className="notif-action-btn notif-action-btn--primary">
              <Tag size={14} />
              View Offer
            </Link>
          )}

          {/* Wishlist sale → Offers page */}
          {notif.type === 'WISHLIST_SALE' && !notif.productId && (
            <Link to="/offers" className="notif-action-btn notif-action-btn--primary">
              <Tag size={14} />
              View Deals
            </Link>
          )}

          {/* Reward → Offers page */}
          {notif.type === 'REWARD' && (
            <Link to="/offers" className="notif-action-btn notif-action-btn--primary">
              <Gift size={14} />
              Redeem Points
            </Link>
          )}

          {!notif.read && (
            <button className="notif-action-btn" onClick={() => onRead(notif.id)}>
              <Check size={14} />
              Mark Read
            </button>
          )}
          <button className="notif-action-btn notif-action-btn--delete" onClick={() => onDelete(notif.id)}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════ */
export default function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  /* ── Load notifications (demo data for now) ── */
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call when backend endpoint is ready
    setTimeout(() => {
      setNotifications(DEMO_NOTIFICATIONS);
      setLoading(false);
    }, 400);
  }, []);

  /* ── Actions ── */
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  /* ── Filtering ── */
  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'offers':
        return notifications.filter(n =>
          ['FESTIVAL_OFFER', 'FLASH_SALE', 'COUPON', 'NEW_ARRIVAL', 'REWARD', 'WISHLIST_SALE'].includes(n.type)
        );
      case 'price':
        return notifications.filter(n =>
          ['PRICE_DROP', 'PRICE_INCREASE'].includes(n.type)
        );
      case 'orders':
        return notifications.filter(n => n.type === 'ORDER_UPDATE');
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    filtered.forEach(n => {
      const d = new Date(n.createdAt).toDateString();
      let label;
      if (d === today) label = 'Today';
      else if (d === yesterday) label = 'Yesterday';
      else label = new Date(n.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric'
      });

      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });

    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="notif-page">
      {/* ── Header ── */}
      <div className="notif-page-header">
        <div className="notif-page-title-row">
          <div className="notif-page-icon">
            <Bell size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1>{t('notifications.title', 'Notifications')}</h1>
            {unreadCount > 0 && (
              <p className="notif-page-subtitle">
                You have <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
            {unreadCount === 0 && notifications.length > 0 && (
              <p className="notif-page-subtitle">All caught up!</p>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="notif-header-btn" onClick={markAllRead}>
                <CheckCheck size={16} />
                <span>Mark all read</span>
              </button>
            )}
            <button className="notif-header-btn notif-header-btn--danger" onClick={clearAll}>
              <Trash2 size={16} />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="notif-filters">
        {FILTER_TABS.map(tab => {
          const TabIcon = tab.icon;
          const count = tab.key === 'all'
            ? notifications.length
            : notifications.filter(n => {
              if (tab.key === 'offers') return ['FESTIVAL_OFFER', 'FLASH_SALE', 'COUPON', 'NEW_ARRIVAL', 'REWARD', 'WISHLIST_SALE'].includes(n.type);
              if (tab.key === 'price') return ['PRICE_DROP', 'PRICE_INCREASE'].includes(n.type);
              if (tab.key === 'orders') return n.type === 'ORDER_UPDATE';
              return true;
            }).length;

          return (
            <button
              key={tab.key}
              className={`notif-filter-tab ${activeFilter === tab.key ? 'notif-filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              <TabIcon size={16} />
              <span>{tab.label}</span>
              <span className="notif-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="notif-content">
        {loading ? (
          <div className="notif-loading">
            <RefreshCw size={28} className="notif-spin" />
            <span>Loading notifications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <BellOff size={48} strokeWidth={1.2} />
            </div>
            <h3>No notifications</h3>
            <p>
              {activeFilter === 'all'
                ? "You're all caught up! We'll notify you about deals, price changes, and order updates."
                : `No ${FILTER_TABS.find(f => f.key === activeFilter)?.label.toLowerCase()} notifications right now.`}
            </p>
            {activeFilter !== 'all' && (
              <button className="notif-empty-btn" onClick={() => setActiveFilter('all')}>
                View all notifications
              </button>
            )}
          </div>
        ) : (
          grouped.map(([dateLabel, items]) => (
            <div key={dateLabel} className="notif-group">
              <div className="notif-group-header">
                <Calendar size={14} />
                <span>{dateLabel}</span>
                <span className="notif-group-count">{items.length}</span>
              </div>
              <div className="notif-group-list">
                {items.map(n => (
                  <NotificationCard
                    key={n.id}
                    notif={n}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}