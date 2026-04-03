import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Flame, Clock, Tag, ChevronRight, PartyPopper, ShoppingBag,
  Star, Heart, Percent, Gift, ArrowRight, Sparkles, Copy,
  Check, Zap, ArrowLeft
} from 'lucide-react';
import { productAPI } from '../api/api';
import '../styles/Offerspage.css';

/* ══════════════════════════════════════
   DATA
   ══════════════════════════════════════ */
const OFFERS = [
  {
    id: 'diwali-mega',
    type: 'festival',
    typeKey: 'offers.types.festival',
    typeDefault: 'Festival Offer',
    titleKey: 'offers.diwali.title',
    titleDefault: 'Diwali Mega Sale',
    subtitleKey: 'offers.diwali.subtitle',
    subtitleDefault: 'Up to 70% off on Electronics, Fashion & Home',
    code: 'DIWALI70',
    discountKey: 'offers.diwali.discount',
    discountDefault: 'Extra 10% Off',
    color: '#e8735a',
    colorSoft: 'rgba(232, 115, 90, 0.1)',
    icon: PartyPopper,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    categories: ['Electronics', 'Fashion', 'Home & Living'],
    discountPercent: 70,
  },
  {
    id: 'flash-sale',
    type: 'flash',
    typeKey: 'offers.types.flash',
    typeDefault: 'Flash Sale',
    titleKey: 'offers.flash.title',
    titleDefault: 'Flash Sale',
    subtitleKey: 'offers.flash.subtitle',
    subtitleDefault: 'Smartphones starting at $199. Limited stock!',
    code: null,
    discountKey: 'offers.flash.discount',
    discountDefault: 'Up to 50% Off',
    color: '#ef4444',
    colorSoft: 'rgba(239, 68, 68, 0.1)',
    icon: Flame,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    categories: ['Electronics'],
    discountPercent: 50,
  },
  {
    id: 'easter-special',
    type: 'festival',
    typeKey: 'offers.types.festival',
    typeDefault: 'Festival Offer',
    titleKey: 'offers.easter.title',
    titleDefault: 'Easter Weekend Special',
    subtitleKey: 'offers.easter.subtitle',
    subtitleDefault: 'Buy 2, Get 1 Free on all Home & Living products',
    code: null,
    discountKey: 'offers.easter.discount',
    discountDefault: 'Buy 2 Get 1 Free',
    color: '#2ecc71',
    colorSoft: 'rgba(46, 204, 113, 0.1)',
    icon: Gift,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    categories: ['Home & Living'],
    discountPercent: 33,
  },
  {
    id: 'new-user',
    type: 'coupon',
    typeKey: 'offers.types.coupon',
    typeDefault: 'Exclusive Coupon',
    titleKey: 'offers.newUser.title',
    titleDefault: 'New User Exclusive',
    subtitleKey: 'offers.newUser.subtitle',
    subtitleDefault: 'Use code LOYAL15 for 15% off your next purchase',
    code: 'LOYAL15',
    discountKey: 'offers.newUser.discount',
    discountDefault: '15% Off',
    color: '#ec4899',
    colorSoft: 'rgba(236, 72, 153, 0.1)',
    icon: Percent,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    categories: [],
    discountPercent: 15,
  },
  {
    id: 'spring-collection',
    type: 'seasonal',
    typeKey: 'offers.types.seasonal',
    typeDefault: 'Seasonal',
    titleKey: 'offers.spring.title',
    titleDefault: 'Spring Collection 2026',
    subtitleKey: 'offers.spring.subtitle',
    subtitleDefault: '50+ new styles — fresh fashion curated for you',
    code: 'SPRING20',
    discountKey: 'offers.spring.discount',
    discountDefault: '20% Off New Arrivals',
    color: '#d4a843',
    colorSoft: 'rgba(212, 168, 67, 0.1)',
    icon: Sparkles,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    categories: ['Fashion'],
    discountPercent: 20,
  },
];

/* ── Helper: translate category like ProductsPage ── */
const tc = (cat, t) => t(`categories.${cat}`, { defaultValue: cat });

/* ── Hooks & Sub-Components ── */

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState({ text: '', expired: false });

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ text: 'offers.time.expired', expired: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (d > 0) {
        setRemaining({ text: `offers.time.daysHours:${d}:${h}:${m}`, expired: false });
      } else {
        setRemaining({ text: `offers.time.hoursMinutes:${h}:${m}:${s}`, expired: false });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function CopyCodeButton({ code, color, t }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) return null;

  return (
    <button 
      className="offer-copy-btn" 
      onClick={handleCopy} 
      style={{ '--offer-color': color }}
      aria-label={t('offers.actions.copyCode', 'Copy code')}
    >
      <span className="offer-code-text">{code}</span>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span className="offer-copy-label">{copied ? t('offers.actions.copied', 'Copied!') : t('offers.actions.copy', 'Copy')}</span>
    </button>
  );
}

function OfferBanner({ offer, isActive, onClick, t }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;
  const typeLabel = t(offer.typeKey, offer.typeDefault);

  // Format countdown text
  const formatCountdown = (text) => {
    if (text.includes('offers.time.')) {
      const parts = text.split(':');
      const key = parts[0];
      if (key === 'offers.time.expired') return t(key, 'Expired');
      if (key === 'offers.time.daysHours') {
        return t(key, '{{d}}d {{h}}h {{m}}m', { d: parts[1], h: parts[2], m: parts[3] });
      }
      if (key === 'offers.time.hoursMinutes') {
        return t(key, '{{h}}h {{m}}m {{s}}s', { h: parts[1], m: parts[2], s: parts[3] });
      }
    }
    return text;
  };

  return (
    <button
      className={`offer-banner ${isActive ? 'offer-banner--active' : ''}`}
      onClick={onClick}
      style={{ '--offer-color': offer.color, '--offer-soft': offer.colorSoft }}
      type="button"
    >
      <div className="offer-banner-glow" />
      <div className="offer-banner-icon">
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="offer-banner-body">
        <div className="offer-banner-top">
          <span className="offer-banner-type">{typeLabel}</span>
          {!countdown.expired && (
            <span className="offer-banner-timer">
              <Clock size={10} />
              {formatCountdown(countdown.text)}
            </span>
          )}
        </div>
        <h3 className="offer-banner-title">{t(offer.titleKey, offer.titleDefault)}</h3>
        <span className="offer-banner-discount">{t(offer.discountKey, offer.discountDefault)}</span>
      </div>
      {isActive && <div className="offer-banner-indicator" />}
    </button>
  );
}

function OfferHero({ offer, t }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;

  const formatCountdown = (text) => {
    if (text.includes('offers.time.')) {
      const parts = text.split(':');
      const key = parts[0];
      if (key === 'offers.time.expired') return t(key, 'Expired');
      if (key === 'offers.time.daysHours') {
        return t(key, '{{d}}d {{h}}h {{m}}m', { d: parts[1], h: parts[2], m: parts[3] });
      }
      if (key === 'offers.time.hoursMinutes') {
        return t(key, '{{h}}h {{m}}m {{s}}s', { h: parts[1], m: parts[2], s: parts[3] });
      }
    }
    return text;
  };

  const getTypeBadge = () => {
    if (offer.type === 'flash') return t('offers.badges.flash', 'Flash Sale');
    if (offer.type === 'festival') return t('offers.badges.festival', 'Festival Offer');
    if (offer.type === 'coupon') return t('offers.badges.coupon', 'Exclusive Coupon');
    return t('offers.badges.seasonal', 'Seasonal');
  };

  return (
    <div className="offer-hero" style={{ '--offer-color': offer.color, '--offer-soft': offer.colorSoft }}>
      <div className="offer-hero-bg" />
      <div className="offer-hero-glow" />

      <div className="offer-hero-content">
        <div className="offer-hero-left">
          <div className="offer-hero-badge">
            <Icon size={14} />
            <span>{getTypeBadge()}</span>
          </div>

          <h1 className="offer-hero-title">{t(offer.titleKey, offer.titleDefault)}</h1>
          <p className="offer-hero-subtitle">{t(offer.subtitleKey, offer.subtitleDefault)}</p>

          <div className="offer-hero-meta">
            {offer.categories.length > 0 && (
              <div className="offer-hero-cats">
                {offer.categories.map(cat => (
                  <Link
                    key={cat}
                    to={`/products?category=${cat}`}
                    className="offer-hero-cat"
                  >
                    {tc(cat, t)}
                  </Link>
                ))}
              </div>
            )}
            {offer.code && <CopyCodeButton code={offer.code} color={offer.color} t={t} />}
          </div>
        </div>

        <div className="offer-hero-right">
          <div className="offer-hero-discount-circle">
            <span className="offer-hero-pct">{offer.discountPercent}%</span>
            <span className="offer-hero-off">{t('offers.hero.off', 'OFF')}</span>
          </div>
          {!countdown.expired && (
            <div className="offer-hero-countdown">
              <Clock size={12} />
              <span>{t('offers.hero.endsIn', 'Ends in')} <strong>{formatCountdown(countdown.text)}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferProductCard({ product, index, discountPercent, t }) {
  const fakeOriginal = product.originalPrice || (product.price * (1 + discountPercent / 100));
  const savings = fakeOriginal - product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="offer-product-card"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="offer-product-img">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        <div className="offer-product-tag">
          <Zap size={10} />
          {discountPercent}% {t('offers.product.off', 'OFF')}
        </div>
        <button className="offer-product-wish" onClick={e => e.preventDefault()}>
          <Heart size={16} />
        </button>
      </div>

      <div className="offer-product-body">
        <span className="offer-product-cat">{tc(product.category, t)}</span>
        <h3 className="offer-product-name">{product.name}</h3>

        <div className="offer-product-rating">
          <div className="offer-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < Math.floor(product.rating || 0) ? '#e8a838' : 'none'}
                color={i < Math.floor(product.rating || 0) ? '#e8a838' : 'var(--text-muted)'}
              />
            ))}
          </div>
          <span className="offer-review-count">({product.reviewCount || 0})</span>
        </div>

        <div className="offer-product-pricing">
          <span className="offer-price-now">${product.price?.toFixed(2)}</span>
          <span className="offer-price-was">${fakeOriginal.toFixed(2)}</span>
        </div>
        
        <div className="offer-product-save">
           {t('offers.product.save', 'Save')} ${savings.toFixed(2)}
        </div>

        <div className="offer-product-cta">
          <ShoppingBag size={14} />
          <span>{t('offers.product.viewDeal', 'View Deal')}</span>
        </div>
      </div>
    </Link>
  );
}

function CouponCard({ offer, t }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;

  const formatCountdown = (text) => {
    if (text.includes('offers.time.')) {
      const parts = text.split(':');
      const key = parts[0];
      if (key === 'offers.time.expired') return t(key, 'Expired');
      if (key === 'offers.time.daysHours') {
        return t(key, '{{d}}d {{h}}h {{m}}m', { d: parts[1], h: parts[2], m: parts[3] });
      }
      if (key === 'offers.time.hoursMinutes') {
        return t(key, '{{h}}h {{m}}m {{s}}s', { h: parts[1], m: parts[2], s: parts[3] });
      }
    }
    return text;
  };

  return (
    <div className="offers-coupon-card" style={{ '--offer-color': offer.color }}>
      <div className="offers-coupon-left">
        <div className="offers-coupon-icon" style={{ background: offer.colorSoft, color: offer.color }}>
          <Icon size={20} />
        </div>
        <div className="offers-coupon-info">
          <h4>{t(offer.titleKey, offer.titleDefault)}</h4>
          <p>{t(offer.discountKey, offer.discountDefault)}</p>
          {!countdown.expired && (
            <span className="offers-coupon-timer">
              <Clock size={10} /> {formatCountdown(countdown.text)}
            </span>
          )}
        </div>
      </div>
      <CopyCodeButton code={offer.code} color={offer.color} t={t} />
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */
export default function OffersPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOfferId, setActiveOfferId] = useState(searchParams.get('deal') || OFFERS[0].id);

  const activeOffer = useMemo(
    () => OFFERS.find(o => o.id === activeOfferId) || OFFERS[0],
    [activeOfferId]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll();
        const all = res.data?.data || res.data || [];
        setProducts(Array.isArray(all) ? all : []);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeOffer.categories.length === 0) return products;
    return products.filter(p =>
      activeOffer.categories.some(cat =>
        p.category?.toLowerCase() === cat.toLowerCase()
      )
    );
  }, [products, activeOffer]);

  const couponOffers = useMemo(() => OFFERS.filter(o => o.code), []);

  return (
    <div className="offers-page">
      {/* ── Back Button ── */}
      <button className="offers-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span>{t('common.back', 'Back')}</span>
      </button>

      {/* ── Page Header ── */}
      <div className="offers-page-header">
        <div className="offers-page-title-row">
          <div className="offers-page-icon">
            <Tag size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1>{t('offers.title', 'Deals & Offers')}</h1>
            <p className="offers-page-subtitle">
              {t('offers.subtitle', '{{count}} active offers — grab them before they expire!', { count: OFFERS.length })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Offer Selector Strip ── */}
      <div className="offers-strip">
        {OFFERS.map(offer => (
          <OfferBanner
            key={offer.id}
            offer={offer}
            isActive={activeOfferId === offer.id}
            onClick={() => setActiveOfferId(offer.id)}
            t={t}
          />
        ))}
      </div>

      {/* ── Active Offer Hero ── */}
      <OfferHero offer={activeOffer} t={t} />

      {/* ── Products Grid ── */}
      <div className="offers-products-section">
        <div className="offers-products-header">
          <div>
            <span className="offers-products-label">
              <Flame size={14} />
              {t(activeOffer.titleKey, activeOffer.titleDefault)}
            </span>
            <h2>
              {t('offers.products.count', '{{count}} Product{{count, plural, one {} other {s}}} on Sale', { 
                count: filteredProducts.length 
              })}
            </h2>
          </div>
          {activeOffer.categories.length > 0 && (
            <div className="offers-active-cats">
              {activeOffer.categories.map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="offers-cat-chip"
                  style={{ '--offer-color': activeOffer.color }}
                >
                  {tc(cat, t)}
                  <ChevronRight size={12} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="offers-loading">
            <div className="offers-loading-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="offers-skeleton-card">
                  <div className="offers-skeleton-img" />
                  <div className="offers-skeleton-body">
                    <div className="offers-skeleton-line offers-skeleton-line--sm" />
                    <div className="offers-skeleton-line" />
                    <div className="offers-skeleton-line offers-skeleton-line--md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="offers-empty">
            <ShoppingBag size={48} strokeWidth={1.2} />
            <h3>{t('offers.empty.title', 'No products found for this offer')}</h3>
            <p>{t('offers.empty.subtitle', 'Check back soon — new deals are added regularly!')}</p>
            <Link to="/products" className="offers-empty-btn">
              {t('offers.empty.browseAll', 'Browse All Products')} <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="offers-products-grid">
            {filteredProducts.map((p, i) => (
              <OfferProductCard
                key={p.id}
                product={p}
                index={i}
                discountPercent={activeOffer.discountPercent}
                t={t}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── All Coupons Section ── */}
      <div className="offers-coupons-section">
        <div className="offers-coupons-header">
          <Percent size={16} />
          <h3>{t('offers.coupons.title', 'Available Coupon Codes')}</h3>
        </div>
        <div className="offers-coupons-grid">
          {couponOffers.map(offer => (
            <CouponCard key={offer.id} offer={offer} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}