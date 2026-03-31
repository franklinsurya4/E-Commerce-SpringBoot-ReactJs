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
    labelKey: 'notifications.types.festival',
    labelDefault: 'Festival Offer',
  },
  PRICE_DROP: {
    icon: TrendingDown,
    color: '#2ecc71',
    bg: 'rgba(46, 204, 113, 0.1)',
    labelKey: 'notifications.types.priceDrop',
    labelDefault: 'Price Drop',
  },
  PRICE_INCREASE: {
    icon: TrendingUp,
    color: '#e8a838',
    bg: 'rgba(232, 168, 56, 0.1)',
    labelKey: 'notifications.types.priceIncrease',
    labelDefault: 'Price Increase',
  },
  FLASH_SALE: {
    icon: Flame,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    labelKey: 'notifications.types.flashSale',
    labelDefault: 'Flash Sale',
  },
  ORDER_UPDATE: {
    icon: Package,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    labelKey: 'notifications.types.orderUpdate',
    labelDefault: 'Order Update',
  },
  NEW_ARRIVAL: {
    icon: Sparkles,
    color: '#d4a843',
    bg: 'rgba(212, 168, 67, 0.1)',
    labelKey: 'notifications.types.newArrival',
    labelDefault: 'New Arrival',
  },
  COUPON: {
    icon: Percent,
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    labelKey: 'notifications.types.coupon',
    labelDefault: 'Coupon',
  },
  WISHLIST_SALE: {
    icon: Tag,
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.1)',
    labelKey: 'notifications.types.wishlistSale',
    labelDefault: 'Wishlist Sale',
  },
  REWARD: {
    icon: Gift,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    labelKey: 'notifications.types.reward',
    labelDefault: 'Reward',
  },
  SYSTEM: {
    icon: Bell,
    color: '#8b8fa8',
    bg: 'rgba(139, 143, 168, 0.1)',
    labelKey: 'notifications.types.system',
    labelDefault: 'System',
  },
};

const FILTER_TABS = [
  { key: 'all', labelKey: 'notifications.filters.all', icon: Bell },
  { key: 'offers', labelKey: 'notifications.filters.offers', icon: Tag },
  { key: 'price', labelKey: 'notifications.filters.price', icon: TrendingDown },
  { key: 'orders', labelKey: 'notifications.filters.orders', icon: Package },
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
    titleKey: 'notifications.demo.diwali.title',
    titleDefault: 'Diwali Mega Sale is LIVE!',
    messageKey: 'notifications.demo.diwali.message',
    messageDefault: 'Up to 70% off on Electronics, Fashion & Home. Use code DIWALI70 for extra 10% off. Ends in 48 hours!',
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
    titleKey: 'notifications.demo.priceDrop.title',
    titleDefault: 'Price dropped on Sony WH-1000XM5',
    messageKey: 'notifications.demo.priceDrop.message',
    messageDefault: 'Good news! The Sony WH-1000XM5 Headphones you viewed dropped from $399.99 to $279.99 — a 30% savings!',
    productId: 120,  // 🎯 Sony WH-1000XM5 Product ID
    imageUrl: null,
    oldPrice: 399.99,
    newPrice: 279.99,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    // 🎯 Enhanced: Add expiry for urgency
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    // 🎯 Add Sony-specific metadata
    brand: 'Sony',
    category: 'audio',
    tags: ['noise-cancelling', 'premium', 'wireless'],
  },
  {
    id: 3,
    type: 'FLASH_SALE',
    titleKey: 'notifications.demo.flash.title',
    titleDefault: 'Flash Sale: 4 Hours Left!',
    messageKey: 'notifications.demo.flash.message',
    messageDefault: 'Smartphones starting at $199. Premium brands at unbeatable prices. Limited stock!',
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
    titleKey: 'notifications.demo.order.title',
    titleDefault: 'Order #QP-20260328 Shipped!',
    messageKey: 'notifications.demo.order.message',
    messageDefault: 'Your order has been shipped via FedEx. Tracking: FX928374651. Estimated delivery: March 31.',
    productId: null,
    imageUrl: null,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 5,
    type: 'PRICE_INCREASE',
    titleKey: 'notifications.demo.priceIncrease.title',
    titleDefault: 'Samsung Galaxy S25 Ultra price rising',
    messageKey: 'notifications.demo.priceIncrease.message',
    messageDefault: 'The Samsung Galaxy S25 Ultra will increase from $1,199.99 to $1,299.99 starting tomorrow. Buy now to lock in the current price!',
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
    titleKey: 'notifications.demo.wishlist.title',
    titleDefault: 'Your wishlist item is on sale!',
    messageKey: 'notifications.demo.wishlist.message',
    messageDefault: 'Nike Air Max 90 from your wishlist is now 25% off. Don\'t miss out — only 3 left in your size!',
    productId: 22,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 7,
    type: 'COUPON',
    titleKey: 'notifications.demo.coupon.title',
    titleDefault: 'Exclusive coupon just for you!',
    messageKey: 'notifications.demo.coupon.message',
    messageDefault: 'Use code LOYAL15 at checkout for 15% off your next purchase. Valid for 7 days.',
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
    titleKey: 'notifications.demo.newArrival.title',
    titleDefault: 'New Arrivals: Spring Collection 2026',
    messageKey: 'notifications.demo.newArrival.message',
    messageDefault: 'Discover 50+ new styles in our Spring Collection. Fresh fashion, curated for you.',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    dealId: 'spring-collection',
  },
  {
    id: 9,
    type: 'FESTIVAL_OFFER',
    titleKey: 'notifications.demo.easter.title',
    titleDefault: 'Easter Weekend Special',
    messageKey: 'notifications.demo.easter.message',
    messageDefault: 'Buy 2, Get 1 Free on all Home & Living products this Easter weekend. Auto-applied at checkout!',
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
    titleKey: 'notifications.demo.reward.title',
    titleDefault: 'You earned 500 QP Points!',
    messageKey: 'notifications.demo.reward.message',
    messageDefault: 'Your recent purchase earned you 500 reward points. You now have 2,350 points — redeem them for discounts!',
    productId: null,
    imageUrl: null,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: 11,
    type: 'PRICE_DROP',
    titleKey: 'notifications.demo.airpods.title',
    titleDefault: 'Apple AirPods Pro 2 price cut!',
    messageKey: 'notifications.demo.airpods.message',
    messageDefault: 'The AirPods Pro 2 just dropped from $249.99 to $189.99. Lowest price in 3 months.',
    productId: 15,
    imageUrl: null,
    oldPrice: 249.99,
    newPrice: 189.99,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
  // 🎯 Additional Sony WH-1000XM5 (ID 120) notifications for testing
  {
    id: 12,
    type: 'PRICE_DROP',
    titleKey: 'notifications.demo.sony120.restock',
    titleDefault: 'Sony WH-1000XM5 Back in Stock at Sale Price!',
    messageKey: 'notifications.demo.sony120.restockMessage',
    messageDefault: 'The Sony WH-1000XM5 noise-cancelling headphones are back in stock at the reduced price of $279.99. Limited quantities available!',
    productId: 120,
    imageUrl: null,
    oldPrice: 399.99,
    newPrice: 279.99,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    brand: 'Sony',
    priority: 'high',
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

  if (mins < 1) return 'notifications.time.justNow';
  if (mins < 60) return `notifications.time.minutesAgo:${mins}`;
  if (hrs < 24) return `notifications.time.hoursAgo:${hrs}`;
  if (days < 7) return `notifications.time.daysAgo:${days}`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── Countdown for expiry ── */
function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('notifications.time.expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 24) {
        const d = Math.floor(h / 24);
        setRemaining(`notifications.time.daysHoursLeft:${d}:${h % 24}`);
      } else {
        setRemaining(`notifications.time.hoursMinutesLeft:${h}:${m}:${s}`);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

/* ── Price Badge ── */
function PriceBadge({ oldPrice, newPrice, type, t }) {
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
        {pct}% {isDown ? t('notifications.price.off', 'off') : t('notifications.price.increase', 'increase')}
      </span>
    </div>
  );
}

/* ── Countdown Badge ── */
function CountdownBadge({ expiresAt, t }) {
  const remaining = useCountdown(expiresAt);
  if (!remaining) return null;
  const isExpired = remaining === 'notifications.time.expired';

  return (
    <span className={`notif-countdown ${isExpired ? 'notif-countdown--expired' : ''}`}>
      <Clock size={12} />
      {remaining.includes('notifications.') ? t(remaining.split(':')[0], { 
        count: remaining.split(':')[1] ? parseInt(remaining.split(':')[1]) : undefined,
        h: remaining.split(':')[1] ? parseInt(remaining.split(':')[1]) : undefined,
        m: remaining.split(':')[2] ? parseInt(remaining.split(':')[2]) : undefined,
        s: remaining.split(':')[3] ? parseInt(remaining.split(':')[3]) : undefined,
        d: remaining.split(':')[1] ? parseInt(remaining.split(':')[1]) : undefined
      }, remaining) : remaining}
    </span>
  );
}

/* ── Single Notification Card ── */
function NotificationCard({ notif, onRead, onDelete, t }) {
  const config = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.SYSTEM;
  const Icon = config.icon;
  const typeLabel = t(config.labelKey, config.labelDefault);

  /* Build the Shop Now / View Deals link */
  const getOfferLink = () => {
    if (notif.dealId) return `/offers?deal=${notif.dealId}`;
    return '/offers';
  };

  // Get translated title/message
  const title = notif.titleKey ? t(notif.titleKey, notif.titleDefault) : notif.title;
  const message = notif.messageKey ? t(notif.messageKey, notif.messageDefault) : notif.message;

  // 🎯 Sony WH-1000XM5 (ID 120) special styling
  const isSonyProduct = notif.productId === 120;
  const sonyHighlight = isSonyProduct ? 'notif-card--sony' : '';

  return (
    <div className={`notif-card ${notif.read ? '' : 'notif-card--unread'} ${sonyHighlight}`}>
      {/* Unread indicator */}
      {!notif.read && <div className="notif-unread-dot" style={{ background: config.color }} />}

      {/* 🎯 Sony badge for product ID 120 */}
      {isSonyProduct && (
        <div className="notif-sony-badge">
          <Sparkles size={10} />
          <span>{t('notifications.sonyPremium', 'Premium Audio')}</span>
        </div>
      )}

      {/* Icon */}
      <div className="notif-icon" style={{ background: config.bg, color: config.color }}>
        <Icon size={20} strokeWidth={2} />
      </div>

      {/* Body */}
      <div className="notif-body">
        <div className="notif-header">
          <span className="notif-type-label" style={{ color: config.color }}>{typeLabel}</span>
          <span className="notif-time">{timeAgo(notif.createdAt).includes('notifications.') 
            ? t(timeAgo(notif.createdAt).split(':')[0], { count: parseInt(timeAgo(notif.createdAt).split(':')[1]) || 1 }, timeAgo(notif.createdAt)) 
            : timeAgo(notif.createdAt)}</span>
        </div>

        <h3 className="notif-title">{title}</h3>
        <p className="notif-message">{message}</p>

        {/* Price badge */}
        {(notif.type === 'PRICE_DROP' || notif.type === 'PRICE_INCREASE') && (
          <PriceBadge oldPrice={notif.oldPrice} newPrice={notif.newPrice} type={notif.type} t={t} />
        )}

        {/* Countdown for offers */}
        {notif.expiresAt && <CountdownBadge expiresAt={notif.expiresAt} t={t} />}

        {/* Action row */}
        <div className="notif-actions">
          {/* 🔥 PRICE_DROP for Sony WH-1000XM5 (ID 120) → Dedicated price drop page */}
          {notif.type === 'PRICE_DROP' && notif.productId === 120 && (
            <Link to={`/price-drop/${notif.productId}`} className="notif-action-btn notif-action-btn--primary notif-action-btn--sony">
              <TrendingDown size={14} />
              {t('notifications.actions.viewSonyDeal', 'View Sony Deal')}
            </Link>
          )}

          {/* 🔥 PRICE_DROP for other products → Standard price drop page */}
          {notif.type === 'PRICE_DROP' && notif.productId && notif.productId !== 120 && (
            <Link to={`/price-drop/${notif.productId}`} className="notif-action-btn notif-action-btn--primary">
              <TrendingDown size={14} />
              {t('notifications.actions.viewDeal', 'View Deal')}
            </Link>
          )}

          {/* Product-specific link for other notification types */}
          {notif.productId && notif.type !== 'PRICE_DROP' && (
            <Link to={`/products/${notif.productId}`} className="notif-action-btn notif-action-btn--primary">
              <ShoppingBag size={14} />
              {t('notifications.actions.viewProduct', 'View Product')}
            </Link>
          )}

          {/* Festival / Flash / New Arrival → Offers page */}
          {(notif.type === 'FESTIVAL_OFFER' || notif.type === 'FLASH_SALE' || notif.type === 'NEW_ARRIVAL') && !notif.productId && (
            <Link to={getOfferLink()} className="notif-action-btn notif-action-btn--primary">
              <ShoppingBag size={14} />
              {t('notifications.actions.shopNow', 'Shop Now')}
            </Link>
          )}

          {/* Order update → Orders page */}
          {notif.type === 'ORDER_UPDATE' && (
            <Link to="/orders" className="notif-action-btn notif-action-btn--primary">
              <Package size={14} />
              {t('notifications.actions.viewOrder', 'View Order')}
            </Link>
          )}

          {/* Coupon → Offers page with deal param */}
          {notif.type === 'COUPON' && (
            <Link to={getOfferLink()} className="notif-action-btn notif-action-btn--primary">
              <Tag size={14} />
              {t('notifications.actions.viewOffer', 'View Offer')}
            </Link>
          )}

          {/* Wishlist sale → Offers page */}
          {notif.type === 'WISHLIST_SALE' && !notif.productId && (
            <Link to="/offers" className="notif-action-btn notif-action-btn--primary">
              <Tag size={14} />
              {t('notifications.actions.viewDeals', 'View Deals')}
            </Link>
          )}

          {/* Reward → Offers page */}
          {notif.type === 'REWARD' && (
            <Link to="/offers" className="notif-action-btn notif-action-btn--primary">
              <Gift size={14} />
              {t('notifications.actions.redeemPoints', 'Redeem Points')}
            </Link>
          )}

          {!notif.read && (
            <button className="notif-action-btn" onClick={() => onRead(notif.id)}>
              <Check size={14} />
              {t('notifications.actions.markRead', 'Mark Read')}
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
      if (d === today) label = t('notifications.date.today', 'Today');
      else if (d === yesterday) label = t('notifications.date.yesterday', 'Yesterday');
      else label = new Date(n.createdAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric'
      });

      if (!groups[label]) groups[label] = [];
      groups[label].push(n);
    });

    return Object.entries(groups);
  }, [filtered, t]);

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
                {t('notifications.unreadCount', 'You have {{count}} unread notification{{count, plural, one {} other {s}}}', { count: unreadCount })}
              </p>
            )}
            {unreadCount === 0 && notifications.length > 0 && (
              <p className="notif-page-subtitle">{t('notifications.allCaughtUp', 'All caught up!')}</p>
            )}
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="notif-header-actions">
            {unreadCount > 0 && (
              <button className="notif-header-btn" onClick={markAllRead}>
                <CheckCheck size={16} />
                <span>{t('notifications.actions.markAllRead', 'Mark all read')}</span>
              </button>
            )}
            <button className="notif-header-btn notif-header-btn--danger" onClick={clearAll}>
              <Trash2 size={16} />
              <span>{t('notifications.actions.clearAll', 'Clear all')}</span>
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
              <span>{t(tab.labelKey, tab.labelKey.split('.').pop())}</span>
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
            <span>{t('notifications.loading', 'Loading notifications...')}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <div className="notif-empty-icon">
              <BellOff size={48} strokeWidth={1.2} />
            </div>
            <h3>{t('notifications.empty.title', 'No notifications')}</h3>
            <p>
              {activeFilter === 'all'
                ? t('notifications.empty.all', "You're all caught up! We'll notify you about deals, price changes, and order updates.")
                : t('notifications.empty.filtered', 'No {{filter}} notifications right now.', { 
                    filter: t(FILTER_TABS.find(f => f.key === activeFilter)?.labelKey, 'notifications').toLowerCase() 
                  })}
            </p>
            {activeFilter !== 'all' && (
              <button className="notif-empty-btn" onClick={() => setActiveFilter('all')}>
                {t('notifications.empty.viewAll', 'View all notifications')}
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
                    t={t}
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