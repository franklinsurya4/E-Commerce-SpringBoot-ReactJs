import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight, Sparkles, Truck, Shield, RotateCcw, Star,
  Zap, ChevronRight, TrendingUp, Clock, Gift, Heart,
  ShoppingBag, Award, Headphones, Monitor, Shirt, Home as HomeIcon
} from 'lucide-react';
import { productAPI } from '../api/api';
import '../styles/HomePage.css';

const CATEGORY_ICONS = {
  Electronics: Monitor,
  Fashion: Shirt,
  'Home & Living': HomeIcon,
  Audio: Headphones,
  Accessories: Gift,
};

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function ProductCard({ product, index }) {
  const { t } = useTranslation();
  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  return (
    <Link
      to={`/products/${product.id}`}
      className="hp-product-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="hp-product-img">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {product.originalPrice && (
          <div className="hp-sale-tag">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% {t('home.off')}
          </div>
        )}
        <button className="hp-wishlist-btn" onClick={e => e.preventDefault()}>
          <Heart size={16} />
        </button>
      </div>
      <div className="hp-product-body">
        <span className="hp-product-cat">{tc(product.category)}</span>
        <h3 className="hp-product-name">{product.name}</h3>
        <div className="hp-product-rating">
          <div className="hp-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.floor(product.rating || 0) ? 'var(--hp-star)' : 'none'}
                color={i < Math.floor(product.rating || 0) ? 'var(--hp-star)' : 'var(--text-muted)'}
              />
            ))}
          </div>
          <span className="hp-review-count">({product.reviewCount || 0})</span>
        </div>
        <div className="hp-product-price">
          <span className="hp-price-now">${product.price}</span>
          {product.originalPrice && (
            <span className="hp-price-was">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  useEffect(() => {
    productAPI.getFeatured().then(r => setFeatured(r.data.data || [])).catch(() => {});
    productAPI.getCategories().then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const trustItems = [
    { icon: Truck, title: t('home.freeShipping'), desc: t('home.freeShippingDesc') },
    { icon: Shield, title: t('home.securePayment'), desc: t('home.securePaymentDesc') },
    { icon: RotateCcw, title: t('home.returns'), desc: t('home.returnsDesc') },
    { icon: Headphones, title: t('home.support'), desc: t('home.supportDesc') },
  ];

  return (
    <div className="hp">
      {/* ── HERO ── */}
      <section className="hp-hero">
        <div className="hp-hero-grain" />
        <div className="hp-hero-glow hp-hero-glow--1" />
        <div className="hp-hero-glow hp-hero-glow--2" />
        <div className="hp-hero-glow hp-hero-glow--3" />

        <div className="hp-hero-content">
          <div className="hp-hero-tag">
            <Zap size={14} />
            <span>{t('home.heroTag')}</span>
          </div>

          <h1 className="hp-hero-title">
            <span className="hp-title-line hp-title-line--1">{t('home.heroTitle1')}</span>
            <span className="hp-title-line hp-title-line--2">
              {t('home.heroTitle2')}{' '}
              <span className="hp-title-gradient">{t('home.heroBrand')}</span>
            </span>
          </h1>

          <p className="hp-hero-desc">
            {t('home.heroDesc')}
          </p>

          <div className="hp-hero-cta">
            <Link to="/products" className="hp-btn-hero">
              <ShoppingBag size={18} />
              {t('home.shopNow')}
              <ArrowRight size={16} />
            </Link>
            <Link to="/tracking" className="hp-btn-hero-outline">
              {t('home.trackOrder')}
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Stats */}
          <div className="hp-hero-stats">
            <div className="hp-stat">
              <strong><AnimatedCounter target={100} />+</strong>
              <span>{t('home.statProducts')}</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <strong><AnimatedCounter target={1000} />+</strong>
              <span>{t('home.statCustomers')}</span>
            </div>
            <div className="hp-stat-divider" />
            <div className="hp-stat">
              <strong><AnimatedCounter target={4} />.9★</strong>
              <span>{t('home.statRating')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="hp-trust-bar">
        {trustItems.map(({ icon: Icon, title, desc }, i) => (
          <div key={i} className="hp-trust-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="hp-trust-icon"><Icon size={22} strokeWidth={1.8} /></div>
            <div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── CATEGORIES ── */}
      {categories.length > 0 && (
        <section className="hp-section">
          <div className="hp-section-head">
            <div>
              <span className="hp-section-label"><Sparkles size={14} /> {t('home.browse')}</span>
              <h2>{t('home.shopByCategory')}</h2>
            </div>
            <Link to="/products" className="hp-see-all">
              {t('home.viewAll')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hp-cat-grid">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat] || ShoppingBag;
              return (
                <Link
                  key={cat}
                  to={`/products?category=${cat}`}
                  className="hp-cat-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="hp-cat-icon"><Icon size={28} strokeWidth={1.5} /></div>
                  <span className="hp-cat-name">{tc(cat)}</span>
                  <ChevronRight size={16} className="hp-cat-arrow" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PROMO BANNERS ── */}
      <section className="hp-section">
        <div className="hp-banners">
          <div className="hp-banner hp-banner--deal">
            <div className="hp-banner-content">
              <span className="hp-banner-tag"><Clock size={14} /> {t('home.limitedTime')}</span>
              <h3>{t('home.flashDeals')}</h3>
              <p>{t('home.flashDealsDesc')}</p>
              <Link to="/products" className="hp-banner-btn">{t('home.shopDeals')} <ArrowRight size={14} /></Link>
            </div>
            <div className="hp-banner-deco" />
          </div>
          <div className="hp-banner hp-banner--new">
            <div className="hp-banner-content">
              <span className="hp-banner-tag"><TrendingUp size={14} /> {t('home.trending')}</span>
              <h3>{t('home.newArrivals')}</h3>
              <p>{t('home.newArrivalsDesc')}</p>
              <Link to="/products" className="hp-banner-btn">{t('home.explore')} <ArrowRight size={14} /></Link>
            </div>
            <div className="hp-banner-deco" />
          </div>
          <div className="hp-banner hp-banner--reward">
            <div className="hp-banner-content">
              <span className="hp-banner-tag"><Award size={14} /> {t('home.rewards')}</span>
              <h3>{t('home.earnPoints')}</h3>
              <p>{t('home.earnPointsDesc')}</p>
              <Link to="/products" className="hp-banner-btn">{t('home.learnMore')} <ArrowRight size={14} /></Link>
            </div>
            <div className="hp-banner-deco" />
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="hp-section">
        <div className="hp-section-head">
          <div>
            <span className="hp-section-label"><TrendingUp size={14} /> {t('home.popular')}</span>
            <h2>{t('home.featuredProducts')}</h2>
          </div>
          <Link to="/products" className="hp-see-all">
            {t('home.viewAll')} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="hp-products-grid">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="hp-section">
        <div className="hp-newsletter">
          <div className="hp-newsletter-glow" />
          <Gift size={36} strokeWidth={1.5} className="hp-newsletter-icon" />
          <h2>{t('home.newsletterTitle')}</h2>
          <p>{t('home.newsletterDesc')}</p>
          <div className="hp-newsletter-form">
            <input type="email" placeholder={t('home.emailPlaceholder')} />
            <button className="hp-btn-hero">{t('home.subscribe')} <ArrowRight size={16} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}