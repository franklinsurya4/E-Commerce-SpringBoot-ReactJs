import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'; // Removed Sparkles
import { useWishlist } from '../context/Wishlistcontext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/Wishlist.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error(t('wishlist.signInToAdd'));
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success(t('wishlist.addedToCart', { name: product.name }));
    } catch {
      toast.error(t('wishlist.failedAddToCart'));
    }
  };

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    toast.success(t('wishlist.removedFromWishlist'));
  };

  return (
    <div className={`page-container wishlist-page ${isDark ? 'theme-dark' : 'theme-light'}`}>
      
      {/* ✅ Clean Header with Back Button Only */}
      <header className="wishlist-header">
        <div className="header-left">
          <button 
            className="btn-icon btn-back" 
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title">
            <Heart className="title-icon" size={24} />
            {t('wishlist.title')}
            {wishlist.length > 0 && (
              <span className="wishlist-count-badge">
                {wishlist.length}
              </span>
            )}
          </h1>
        </div>
        {/* ✅ Savings section removed */}
      </header>

      {/* ✅ Loading State */}
      {loading ? (
        <div className="wishlist-loading">
          <div className="loading-spinner" />
          <p>{t('common.loading')}</p>
        </div>
      ) : wishlist.length === 0 ? (
        
        /* ✅ Enhanced Empty State */
        <div className="wishlist-empty">
          <div className="empty-icon-wrapper">
            <Heart size={64} className="empty-icon" />
          </div>
          <h2>{t('wishlist.empty')}</h2>
          <p className="empty-desc">{t('wishlist.emptyDesc')}</p>
          <div className="empty-actions">
            <Link to="/products" className="btn btn-primary">
              <ShoppingBag size={18} /> {t('wishlist.browseProducts')}
            </Link>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> {t('common.goBack')}
            </button>
          </div>
        </div>
      ) : (
        /* ✅ Product Grid */
        <>
          <div className="wishlist-summary">
            <span>{wishlist.length} {wishlist.length === 1 ? t('wishlist.item') : t('wishlist.items')}</span>
            {isAuthenticated && (
              <button 
                className="btn btn-text btn-move-all"
                onClick={() => wishlist.forEach(p => handleAddToCart(p))}
              >
                {t('wishlist.addAllToCart')}
              </button>
            )}
          </div>
          
          <div className="product-grid wishlist-grid">
            {wishlist.map((p, index) => (
              <article 
                key={p.id} 
                className="product-card wishlist-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link to={`/products/${p.id}`} className="card-link-wrapper">
                  <div className="card-image-container">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      loading="lazy"
                      className="card-image"
                    />
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="badge-sale">
                        -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                      </span>
                    )}
                    {p.stock <= 0 && (
                      <span className="badge-out-of-stock">{t('products.outOfStock')}</span>
                    )}
                  </div>
                  
                  <div className="card-content">
                    <span className="card-category">{tc(p.category)}</span>
                    <h3 className="card-name">{p.name}</h3>
                    
                    {p.rating !== undefined && (
                      <div className="card-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(p.rating) ? 'var(--warning)' : 'none'}
                            color={i < Math.round(p.rating) ? 'var(--warning)' : 'var(--border)'}
                          />
                        ))}
                        <span className="rating-value">{p.rating}</span>
                        <span className="review-count">({p.reviewCount})</span>
                      </div>
                    )}
                    
                    <div className="card-pricing">
                      <span className="price-current">${p.price?.toFixed(2)}</span>
                      {p.originalPrice && (
                        <span className="price-original">${p.originalPrice?.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="card-actions">
                  <button 
                    className="btn btn-primary btn-sm action-btn"
                    onClick={(e) => { e.preventDefault(); handleAddToCart(p); }}
                    disabled={p.stock <= 0}
                  >
                    <ShoppingBag size={14} /> {t('wishlist.addToCart')}
                  </button>
                  <button 
                    className="btn btn-danger-outline btn-sm action-btn"
                    onClick={(e) => { e.preventDefault(); handleRemove(p); }}
                    aria-label={t('wishlist.remove')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}