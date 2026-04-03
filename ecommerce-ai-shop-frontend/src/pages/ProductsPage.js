import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { productAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxesStacked, faTag, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import '../styles/pages.css';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    setLoading(true);
    const fetchProducts = async () => {
      try {
        let res;
        if (q) { res = await productAPI.search(q); }
        else if (cat) { res = await productAPI.getByCategory(cat); setActiveCategory(cat); }
        else { res = await productAPI.getAll(); }
        setProducts(res.data.data || []);
      } catch { setProducts([]); }
      setLoading(false);
    };
    fetchProducts();
    productAPI.getCategories().then(r => setCategories(['All', ...(r.data.data || [])])).catch(() => {});
  }, [searchParams]);

  const filterByCategory = async (cat) => {
    setActiveCategory(cat);
    setLoading(true);
    try {
      const res = cat === 'All' ? await productAPI.getAll() : await productAPI.getByCategory(cat);
      setProducts(res.data.data || []);
    } catch { setProducts([]); }
    setLoading(false);
  };

  const getPageIcon = () => {
    if (searchParams.get('q')) return faMagnifyingGlass;
    if (searchParams.get('category') && activeCategory !== 'All') return faTag;
    return faBoxesStacked;
  };

  const pageTitle = searchParams.get('q')
    ? t('products.resultsFor', { query: searchParams.get('q') })
    : t('products.allProducts');

  // Inline styles for parent container (gap works HERE)
  const titleContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',              // ← Gap applied on parent flex container
    fontSize: '1.6rem',
    fontWeight: '700',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    width: '100%',
    boxSizing: 'border-box'
  };

  // Inline styles for icon
  const iconStyle = {
    color: '#6366f1',        // ← Your indigo color
    width: '24px',
    height: '24px',
    flexShrink: 0
  };

  return (
    <div className="page-container">
      {/* Apply inline style with gap on the parent h1 */}
      <h1 className="page-title" style={titleContainerStyle}>
        <FontAwesomeIcon 
          icon={getPageIcon()} 
          style={iconStyle} 
        />
        {pageTitle}
      </h1>

      <div className="filters-bar">
        {categories.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => filterByCategory(cat)}>
            {tc(cat)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="product-card">
              <div className="skeleton" style={{ paddingTop: '75%' }} />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '30%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="cart-empty">
          <h2>{t('products.noProductsFound')}</h2>
          <p>{t('products.noProductsHint')}</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <div className="product-img-wrap">
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
                {p.originalPrice && (
                  <div className="product-badge-sale">{Math.round((1 - p.price / p.originalPrice) * 100)}% {t('products.off')}</div>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{tc(p.category)}</span>
                <h3 className="product-name">{p.name}</h3>
                <div className="product-rating">
                  <Star size={14} fill="var(--warning)" color="var(--warning)" />
                  <span>{p.rating}</span>
                  <span className="review-count">({p.reviewCount})</span>
                </div>
                <div className="product-pricing">
                  <span className="current-price">${p.price}</span>
                  {p.originalPrice && <span className="original-price">${p.originalPrice}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}