import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { productAPI } from '../api/api';
import '../styles/pages.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

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

  return (
    <div className="page-container">
      <h1 className="page-title">
        {searchParams.get('q') ? `Results for "${searchParams.get('q')}"` : 'All Products'}
      </h1>

      <div className="filters-bar">
        {categories.map(cat => (
          <button key={cat} className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => filterByCategory(cat)}>
            {cat}
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
          <h2>No products found</h2>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="product-card">
              <div className="product-img-wrap">
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
                {p.originalPrice && (
                  <div className="product-badge-sale">{Math.round((1 - p.price / p.originalPrice) * 100)}% OFF</div>
                )}
              </div>
              <div className="product-info">
                <span className="product-category">{p.category}</span>
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
