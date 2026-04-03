import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/Wishlistcontext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/Wishlist.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { toast.error(t('wishlist.signInToAdd')); navigate('/login'); return; }
    try {
      await addToCart(product.id, 1);
      toast.success(t('wishlist.addedToCart', { name: product.name }));
    } catch { toast.error(t('wishlist.failedAddToCart')); }
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.success(t('wishlist.removedFromWishlist'));
  };

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <h1 className="page-title">
          <Heart size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {t('wishlist.title')}
          {wishlist.length > 0 && (
            <span className="wishlist-page-count">
              {wishlist.length} {wishlist.length !== 1 ? t('wishlist.itemsPlural') : t('wishlist.items')}
            </span>
          )}
        </h1>
        <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /><span>{t('common.back')}</span>
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="cart-empty">
          <Heart size={48} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
          <h2>{t('wishlist.empty')}</h2>
          <p>{t('wishlist.emptyDesc')}</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 12 }}>
            <ShoppingBag size={18} /> {t('wishlist.browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="product-grid wishlist-grid">
          {wishlist.map((p) => (
            <div key={p.id} className="product-card wishlist-product-card">
              <Link to={`/products/${p.id}`} className="wishlist-card-link">
                <div className="product-img-wrap">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                  {p.originalPrice && (
                    <div className="product-badge-sale">{Math.round((1 - p.price / p.originalPrice) * 100)}% {t('products.off')}</div>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-category">{tc(p.category)}</span>
                  <h3 className="product-name">{p.name}</h3>
                  {p.rating !== undefined && (
                    <div className="product-rating">
                      <Star size={14} fill="var(--warning)" color="var(--warning)" />
                      <span>{p.rating}</span>
                      <span className="review-count">({p.reviewCount})</span>
                    </div>
                  )}
                  <div className="product-pricing">
                    <span className="current-price">${p.price?.toFixed(2)}</span>
                    {p.originalPrice && <span className="original-price">${p.originalPrice?.toFixed(2)}</span>}
                  </div>
                </div>
              </Link>
              <div className="wishlist-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(p)}>
                  <ShoppingBag size={15} /> {t('wishlist.addToCart')}
                </button>
                <button className="btn btn-danger-outline btn-sm" onClick={() => handleRemove(p)}>
                  <Trash2 size={15} /> {t('wishlist.remove')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}