import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
    title: 'Diwali Mega Sale',
    subtitle: 'Up to 70% off on Electronics, Fashion & Home',
    code: 'DIWALI70',
    discount: 'Extra 10% Off',
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
    title: 'Flash Sale',
    subtitle: 'Smartphones starting at $199. Limited stock!',
    code: null,
    discount: 'Up to 50% Off',
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
    title: 'Easter Weekend Special',
    subtitle: 'Buy 2, Get 1 Free on all Home & Living products',
    code: null,
    discount: 'Buy 2 Get 1 Free',
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
    title: 'New User Exclusive',
    subtitle: 'Use code LOYAL15 for 15% off your next purchase',
    code: 'LOYAL15',
    discount: '15% Off',
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
    title: 'Spring Collection 2026',
    subtitle: '50+ new styles — fresh fashion curated for you',
    code: 'SPRING20',
    discount: '20% Off New Arrivals',
    color: '#d4a843',
    colorSoft: 'rgba(212, 168, 67, 0.1)',
    icon: Sparkles,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    categories: ['Fashion'],
    discountPercent: 20,
  },
];

/* ── Hooks & Sub-Components ── */

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState({ text: '', expired: false });

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ text: 'Expired', expired: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      if (d > 0) {
        setRemaining({ text: `${d}d ${h}h ${m}m`, expired: false });
      } else {
        setRemaining({ text: `${h}h ${m}m ${s}s`, expired: false });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function CopyCodeButton({ code, color }) {
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
      aria-label="Copy code"
    >
      <span className="offer-code-text">{code}</span>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span className="offer-copy-label">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

function OfferBanner({ offer, isActive, onClick }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;

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
          <span className="offer-banner-type">{offer.type}</span>
          {!countdown.expired && (
            <span className="offer-banner-timer">
              <Clock size={10} />
              {countdown.text}
            </span>
          )}
        </div>
        <h3 className="offer-banner-title">{offer.title}</h3>
        <span className="offer-banner-discount">{offer.discount}</span>
      </div>
      {isActive && <div className="offer-banner-indicator" />}
    </button>
  );
}

function OfferHero({ offer }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;

  return (
    <div className="offer-hero" style={{ '--offer-color': offer.color, '--offer-soft': offer.colorSoft }}>
      <div className="offer-hero-bg" />
      <div className="offer-hero-glow" />

      <div className="offer-hero-content">
        <div className="offer-hero-left">
          <div className="offer-hero-badge">
            <Icon size={14} />
            <span>
              {offer.type === 'flash' ? 'Flash Sale'
                : offer.type === 'festival' ? 'Festival Offer'
                : offer.type === 'coupon' ? 'Exclusive Coupon'
                : 'Seasonal'}
            </span>
          </div>

          <h1 className="offer-hero-title">{offer.title}</h1>
          <p className="offer-hero-subtitle">{offer.subtitle}</p>

          <div className="offer-hero-meta">
            {offer.categories.length > 0 && (
              <div className="offer-hero-cats">
                {offer.categories.map(cat => (
                  <Link
                    key={cat}
                    to={`/products?category=${cat}`}
                    className="offer-hero-cat"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
            {offer.code && <CopyCodeButton code={offer.code} color={offer.color} />}
          </div>
        </div>

        <div className="offer-hero-right">
          <div className="offer-hero-discount-circle">
            <span className="offer-hero-pct">{offer.discountPercent}%</span>
            <span className="offer-hero-off">OFF</span>
          </div>
          {!countdown.expired && (
            <div className="offer-hero-countdown">
              <Clock size={12} />
              <span>Ends in <strong>{countdown.text}</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferProductCard({ product, index, discountPercent }) {
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
          {discountPercent}% OFF
        </div>
        <button className="offer-product-wish" onClick={e => e.preventDefault()}>
          <Heart size={16} />
        </button>
      </div>

      <div className="offer-product-body">
        <span className="offer-product-cat">{product.category}</span>
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
           Save ${savings.toFixed(2)}
        </div>

        <div className="offer-product-cta">
          <ShoppingBag size={14} />
          <span>View Deal</span>
        </div>
      </div>
    </Link>
  );
}

function CouponCard({ offer }) {
  const countdown = useCountdown(offer.expiresAt);
  const Icon = offer.icon;

  return (
    <div className="offers-coupon-card" style={{ '--offer-color': offer.color }}>
      <div className="offers-coupon-left">
        <div className="offers-coupon-icon" style={{ background: offer.colorSoft, color: offer.color }}>
          <Icon size={20} />
        </div>
        <div className="offers-coupon-info">
          <h4>{offer.title}</h4>
          <p>{offer.discount}</p>
          {!countdown.expired && (
            <span className="offers-coupon-timer">
              <Clock size={10} /> {countdown.text}
            </span>
          )}
        </div>
      </div>
      <CopyCodeButton code={offer.code} color={offer.color} />
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */
export default function OffersPage() {
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
        <span>Back</span>
      </button>

      {/* ── Page Header ── */}
      <div className="offers-page-header">
        <div className="offers-page-title-row">
          <div className="offers-page-icon">
            <Tag size={24} strokeWidth={1.8} />
          </div>
          <div>
            <h1>Deals & Offers</h1>
            <p className="offers-page-subtitle">
              {OFFERS.length} active offers — grab them before they expire!
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
          />
        ))}
      </div>

      {/* ── Active Offer Hero ── */}
      <OfferHero offer={activeOffer} />

      {/* ── Products Grid ── */}
      <div className="offers-products-section">
        <div className="offers-products-header">
          <div>
            <span className="offers-products-label">
              <Flame size={14} />
              {activeOffer.title}
            </span>
            <h2>
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} on Sale
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
                  {cat}
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
            <h3>No products found for this offer</h3>
            <p>Check back soon — new deals are added regularly!</p>
            <Link to="/products" className="offers-empty-btn">
              Browse All Products <ArrowRight size={14} />
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
              />
            ))}
          </div>
        )}
      </div>

      {/* ── All Coupons Section ── */}
      <div className="offers-coupons-section">
        <div className="offers-coupons-header">
          <Percent size={16} />
          <h3>Available Coupon Codes</h3>
        </div>
        <div className="offers-coupons-grid">
          {couponOffers.map(offer => (
            <CouponCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </div>
  );
}