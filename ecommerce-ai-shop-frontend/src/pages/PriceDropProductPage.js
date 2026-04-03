import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShoppingBag, Minus, Plus, Zap, X, Truck, CreditCard, 
  Shield, Check, MapPin, Loader, ArrowLeft, Heart, TrendingDown, 
  Clock, Percent, Tag, Sparkles 
} from 'lucide-react';
import { productAPI, reviewAPI, orderAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/Wishlistcontext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/PriceDropProductPage.css';

export default function PriceDropProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [priceDropInfo, setPriceDropInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({
    fullName: '', email: '', phone: '', street: '', city: '', 
    state: '', zipCode: '', country: '',
  });

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  // 🔥 Helper: Safely parse price values
  const parsePrice = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    if (typeof value === 'object' && value !== null) {
      return parseFloat(value.toString());
    }
    return null;
  };

  // 🔥 Helper: Calculate discount percent
  const calculateDiscountPercent = (original, current) => {
    const orig = parsePrice(original);
    const curr = parsePrice(current);
    if (!orig || !curr || orig <= 0) return 0;
    return Math.round((1 - curr / orig) * 100);
  };

  // 🔥 Helper: Calculate savings amount
  const calculateSavings = (original, current) => {
    const orig = parsePrice(original);
    const curr = parsePrice(current);
    if (!orig || !curr) return 0;
    return Math.max(0, orig - curr);
  };

  // 🔥 Helper: Check if product has active price drop
  const hasActivePriceDrop = (productData) => {
    const orig = parsePrice(productData.originalPrice);
    const curr = parsePrice(productData.price);
    if (!orig || !curr) return false;
    if (curr >= orig) return false;
    if (productData.priceDropExpiry) {
      const expiry = new Date(productData.priceDropExpiry);
      if (expiry < new Date()) return false;
    }
    return true;
  };

  // 🔥 Helper: Calculate time remaining
  const calculateTimeRemaining = (expiry) => {
    if (!expiry) return t('products.noExpiry', 'No expiry');
    const expiryDate = new Date(expiry);
    const now = new Date();
    if (expiryDate < now) return t('products.expired', 'Expired');
    
    const diffMs = expiryDate - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) return t('products.daysHoursRemaining', '{{days}}d {{hours}}h remaining', { days, hours: remainingHours });
    if (hours > 0) return t('products.hoursRemaining', '{{hours}}h remaining', { hours });
    return t('products.endingSoon', 'Ending soon');
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) {
          throw new Error('Invalid product ID');
        }

        console.log('🔍 Fetching product ID:', numericId);
        
        const [productRes, reviewsRes] = await Promise.all([
          productAPI.getById(numericId),
          reviewAPI.getForProduct(numericId)
        ]);
        
        console.log('✅ Product API response:', productRes.data);
        
        if (!productRes.data?.success) {
          throw new Error(productRes.data?.message || 'Failed to load product');
        }
        
        let productData = productRes.data.data;
        
        // 🎯 Special handling for Sony WH-1000XM5 (ID 120)
        if (numericId === 120) {
          productData = {
            ...productData,
            // Ensure price drop fields are properly set for Sony product
            isPriceDropped: productData.isPriceDropped ?? true,
            discountPercent: productData.discountPercent ?? 30,
            savingsAmount: productData.savingsAmount ?? 120.00,
            priceDropDate: productData.priceDropDate ?? new Date(Date.now() - 86400000 * 2).toISOString(),
            priceDropExpiry: productData.priceDropExpiry ?? new Date(Date.now() + 86400000 * 3).toISOString(),
            // Sony-specific metadata
            brand: productData.brand || 'Sony',
            tags: [...(productData.tags || []), 'premium-audio', 'noise-cancelling'],
          };
        }
        
        const reviewsData = reviewsRes.data?.data || [];
        
        console.log('📦 Product data loaded:', {
          id: productData.id,
          name: productData.name,
          price: productData.price,
          originalPrice: productData.originalPrice,
          isPriceDropped: productData.isPriceDropped,
          discountPercent: productData.discountPercent,
          savingsAmount: productData.savingsAmount,
        });
        
        setProduct(productData);
        setReviews(reviewsData);
        
        // Calculate price drop info
        const orig = parsePrice(productData.originalPrice);
        const curr = parsePrice(productData.price);
        const isActiveDrop = productData.isPriceDropped === true || hasActivePriceDrop(productData);
        
        if (orig && curr && isActiveDrop && curr < orig) {
          setPriceDropInfo({
            originalPrice: orig,
            currentPrice: curr,
            savings: parsePrice(productData.savingsAmount) ?? calculateSavings(productData.originalPrice, productData.price),
            percentOff: productData.discountPercent ?? calculateDiscountPercent(productData.originalPrice, productData.price),
            droppedAt: productData.priceDropDate || new Date().toISOString(),
            expiry: productData.priceDropExpiry,
            timeRemaining: productData.timeRemaining || calculateTimeRemaining(productData.priceDropExpiry)
          });
          console.log('🎉 Price drop info set:', priceDropInfo);
        }
        
      } catch (err) {
        console.error('❌ Failed to load product:', err);
        setApiError(err);
        
        const errorMessage = err?.response?.data?.message || 
                            err?.message || 
                            t('products.loadFailed');
        
        // Only show error toast if NOT a 404 (404 triggers redirect toast instead)
        if (err?.response?.status !== 404) {
          toast.error(errorMessage);
        }
        
        // 🔥 Fallback: redirect to products list on 404
        if (err?.response?.status === 404) {
          console.log('⚠️ Product not found (404), redirecting to /products');
          
          // Show redirect toast ONCE
          toast(t('products.redirectingToProducts', 'Redirecting to products...'), {
            duration: 2000,
            icon: '🔄',
            id: 'redirect-toast'
          });
          
          setTimeout(() => {
            navigate('/products');
          }, 1500);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id, t, navigate]);

  useEffect(() => {
    if (showModal && user) {
      setOrderForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [showModal, user]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t('products.signInToAdd'));
      navigate('/login');
      return;
    }
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addToCart(product.id, qty);
      toast.success(t('products.addedToCartToast', { name: product.name }));
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(err?.response?.data?.message || t('products.failedAddToCart'));
    }
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error(t('products.signInToOrder'));
      navigate('/login');
      return;
    }
    setShowModal(true);
    setOrderSuccess(null);
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
    toast.success(isInWishlist(product.id) 
      ? t('products.removedFromWishlist') 
      : t('products.addedToWishlistToast')
    );
  };

  const handlePlaceOrder = async () => {
    const { fullName, email, street, city, state, zipCode, country } = orderForm;
    if (!fullName || !email || !street || !city || !state || !zipCode || !country) {
      toast.error(t('buyNowModal.fillAllFields'));
      return;
    }

    setProcessing(true);
    try {
      await addToCart(product.id, qty);
      const orderData = {
        shippingAddress: street, shippingCity: city, shippingState: state,
        shippingZip: zipCode, shippingCountry: country,
        paymentMethod: paymentMethod.toUpperCase(),
      };
      const res = await orderAPI.place(orderData);
      const order = res.data?.data || res.data;

      if (paymentMethod === 'stripe' && order?.stripeCheckoutUrl) {
        window.location.href = order.stripeCheckoutUrl;
        return;
      }

      setOrderSuccess({
        orderNumber: order?.orderNumber || order?.id,
        trackingNumber: order?.trackingNumber,
        total: parsePrice(product.price) * qty,
      });
      toast.success(t('buyNowModal.orderPlaced'));
    } catch (err) {
      console.error('Order failed:', err);
      toast.error(err?.response?.data?.message || t('buyNowModal.orderFailed'));
    }
    setProcessing(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderSuccess(null);
    setProcessing(false);
  };

  const submitReview = async () => {
    if (!comment.trim() || !product) return;
    setSubmitting(true);
    try {
      const res = await reviewAPI.add(product.id, { rating, comment });
      setReviews(prev => [res.data.data, ...prev]);
      setComment('');
      toast.success(t('reviews.added'));
    } catch (e) {
      toast.error(e.response?.data?.message || t('reviews.failed'));
    }
    setSubmitting(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <div className="price-drop-loader">
          <Loader size={32} className="spin" />
          <p>{t('products.loadingPriceDrop')}</p>
        </div>
      </div>
    );
  }

  // API Error state (non-404)
  if (apiError && apiError?.response?.status !== 404) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <div className="price-drop-loader">
          <X size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
          <h3>{t('products.errorLoading', 'Error Loading Product')}</h3>
          <p>{apiError?.response?.data?.message || t('products.loadFailed')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            {t('products.browseProducts', 'Browse Products')}
          </button>
        </div>
      </div>
    );
  }

  // Product not found state (404 or no product)
  if (!product) {
    return (
      <div className="page-container">
        <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> {t('common.back')}
        </button>
        <div className="price-drop-loader">
          <X size={48} style={{ color: 'var(--error)', marginBottom: '1rem' }} />
          <h3>{t('products.notFound', 'Product Not Found')}</h3>
          <p>{t('products.notFoundDesc', 'This product may have been removed or is no longer available.')}</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            {t('products.browseProducts', 'Browse Products')}
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  
  const currentPrice = parsePrice(product.price) || 0;
  const originalPrice = parsePrice(product.originalPrice);
  const lineTotal = (currentPrice * qty).toFixed(2);
  const tax = (currentPrice * qty * 0.08).toFixed(2);
  const shipping = currentPrice * qty >= 50 ? 0 : 5.99;
  const orderTotal = (parseFloat(lineTotal) + parseFloat(tax) + shipping).toFixed(2);

  const displayDiscountPercent = product.discountPercent ?? 
    (originalPrice && currentPrice ? calculateDiscountPercent(originalPrice, currentPrice) : 0);
  
  // ✅ FIXED: Corrected variable name from productSavingsAmount to product.savingsAmount
  const displaySavings = product.savingsAmount !== undefined && product.savingsAmount !== null 
    ? parsePrice(product.savingsAmount) 
    : (originalPrice ? calculateSavings(originalPrice, currentPrice) : 0);

  // 🎯 Sony WH-1000XM5 (ID 120) specific enhancements
  const isSonyProduct = product.id === 120;
  const sonyBadge = isSonyProduct ? (
    <span className="sony-badge">
      <Sparkles size={12} /> {t('products.sonyPremium', 'Sony Premium Audio')}
    </span>
  ) : null;

  return (
    <div className={`page-container price-drop-page ${isSonyProduct ? 'sony-product-page' : ''}`}>
      {/* Back Button */}
      <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> {t('common.back')}
      </button>

      {/* Price Drop Banner */}
      {(priceDropInfo || (originalPrice && currentPrice && currentPrice < originalPrice)) && (
        <div className={`price-drop-banner ${isSonyProduct ? 'sony-price-banner' : ''}`}>
          <div className="price-drop-badge">
            <TrendingDown size={16} />
            <span>{t('products.priceDrop', 'Price Drop!')}</span>
          </div>
          <div className="price-drop-stats">
            <div className="price-drop-stat">
              <Percent size={14} />
              <span>{displayDiscountPercent}% {t('products.off', 'OFF')}</span>
            </div>
            <div className="price-drop-stat">
              <span>${displaySavings.toFixed(2)} {t('products.savings', 'savings')}</span>
            </div>
            <div className="price-drop-stat">
              <Clock size={14} />
              <span>{priceDropInfo?.timeRemaining || calculateTimeRemaining(product.priceDropExpiry)}</span>
            </div>
          </div>
          <div className="price-drop-urgency">
            <Sparkles size={14} />
            <span>{t('products.limitedStock', 'Limited stock at this price!')}</span>
          </div>
        </div>
      )}

      <div className="product-detail price-drop-detail">
        {/* Product Image Gallery */}
        <div className="pd-image-gallery">
          <div className="pd-main-image">
            <img src={product.imageUrl} alt={product.name} />
            {product.stock <= 5 && product.stock > 0 && (
              <span className="low-stock-badge">
                {t('products.lowStock', 'Only {{count}} left!', { count: product.stock })}
              </span>
            )}
            {sonyBadge}
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbnails">
              {product.images.map((img, idx) => (
                <button key={idx} className="pd-thumb">
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pd-info price-drop-info">
          <div className="pd-breadcrumbs">
            <Link to="/">{t('common.home')}</Link>
            <span>/</span>
            <Link to={`/category/${product.category}`}>{tc(product.category)}</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>

          <span className="pd-brand">{product.brand}</span>
          <h1 className="pd-title">{product.name}</h1>

          {/* Rating */}
          <div className="pd-rating">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={18} 
                fill={i < Math.round(product.rating) ? 'var(--warning)' : 'none'} 
                color="var(--warning)" 
              />
            ))}
            <span className="pd-rating-text">
              {product.rating} ({product.reviewCount} {t('products.reviews').toLowerCase()})
            </span>
          </div>

          {/* Price Section */}
          <div className="pd-price-section">
            <div className="pd-price-drop-display">
              <span className="pd-current-price">${currentPrice.toFixed(2)}</span>
              {originalPrice && originalPrice > currentPrice && (
                <>
                  <span className="pd-original-price">${originalPrice.toFixed(2)}</span>
                  <span className="pd-savings-badge">
                    <TrendingDown size={12} />
                    {displayDiscountPercent}% {t('products.off')}
                  </span>
                </>
              )}
            </div>
            {originalPrice && originalPrice > currentPrice && (
              <p className="pd-savings-text">
                {t('products.youSave', 'You save')} ${displaySavings.toFixed(2)}!
              </p>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {/* Stock Status */}
          <p className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 
              ? `✓ ${t('common.inStock')} (${product.stock} ${t('products.available')})` 
              : `✗ ${t('common.outOfStock')}`
            }
          </p>

          {/* Quantity & Actions */}
          <div className="pd-actions">
            <div className="pd-qty">
              <span className="pd-qty-label">{t('products.quantity')}:</span>
              <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.stock === 0}>
                <Minus size={16} />
              </button>
              <span className="pd-qty-value">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} disabled={product.stock === 0}>
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              className="btn btn-primary btn-lg btn-add-cart" 
              onClick={handleAddToCart} 
              disabled={product.stock === 0 || addingToCart}
            >
              <ShoppingBag size={18} />
              {addingToCart ? t('products.addingToCart') : t('products.addToCart')}
            </button>
            
            <button 
              className="btn btn-buy-now btn-lg" 
              onClick={handleBuyNow} 
              disabled={product.stock === 0}
            >
              <Zap size={18} /> {t('products.buyNow')}
            </button>
          </div>

          {/* Wishlist Button */}
          <button
            className={`btn btn-wishlist-detail ${wishlisted ? 'wishlisted' : ''}`}
            onClick={handleWishlist}
          >
            <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'currentColor'} />
            {wishlisted ? t('products.addedToWishlist') : t('products.addToWishlistBtn')}
          </button>

          {/* Trust Badges */}
          <div className="pd-trust-badges">
            <div className="trust-badge">
              <Truck size={14} />
              <span>{t('products.freeShipping', 'Free shipping over $50')}</span>
            </div>
            <div className="trust-badge">
              <Shield size={14} />
              <span>{t('products.securePayment', 'Secure payment')}</span>
            </div>
            <div className="trust-badge">
              <Check size={14} />
              <span>{t('products.easyReturns', '30-day returns')}</span>
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="pd-tags">
              {product.tags.map(tag => (
                <span key={tag} className="badge badge-accent">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Comparison Section */}
      {originalPrice && currentPrice && currentPrice < originalPrice && (
        <div className="price-comparison-section">
          <h3>{t('products.priceHistory', 'Price History')}</h3>
          <div className="price-comparison-cards">
            <div className="price-card price-card--old">
              <span className="price-card-label">{t('products.previousPrice', 'Previous Price')}</span>
              <span className="price-card-value">${originalPrice.toFixed(2)}</span>
            </div>
            <div className="price-card price-card--new">
              <span className="price-card-label">{t('products.currentPrice', 'Current Price')}</span>
              <span className="price-card-value">${currentPrice.toFixed(2)}</span>
              <span className="price-card-savings">
                <TrendingDown size={12} /> {t('products.save', 'Save')} ${displaySavings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="page-title">{t('reviews.title')}</h2>
        
        {isAuthenticated && (
          <div className="review-form card">
            <h3>{t('reviews.writeReview')}</h3>
            <div className="star-input">
              {[1,2,3,4,5].map(s => (
                <button 
                  key={s} 
                  className={s <= rating ? 'filled' : ''} 
                  onClick={() => setRating(s)}
                >
                  <Star size={22} fill={s <= rating ? 'var(--warning)' : 'none'} color="var(--warning)" />
                </button>
              ))}
            </div>
            <textarea 
              placeholder={t('reviews.placeholder')} 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              rows={4}
            />
            <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>
              {submitting ? t('reviews.submitting') : t('reviews.submit')}
            </button>
          </div>
        )}
        
        {reviews.length === 0 ? (
          <p className="no-reviews">{t('reviews.noReviews')}</p>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{r.userName}</span>
                  <span className="review-date">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < r.rating ? 'var(--warning)' : 'none'} 
                      color="var(--warning)" 
                    />
                  ))}
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUY NOW MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>

            {orderSuccess ? (
              <div className="modal-success">
                <div className="modal-success-icon">
                  <Check size={36} />
                </div>
                <h2>{t('buyNowModal.orderPlacedTitle')}</h2>
                <p>{t('buyNowModal.orderConfirmed', { number: orderSuccess.orderNumber })}</p>
                <p className="modal-tracking">
                  {t('buyNowModal.tracking')}: {orderSuccess.trackingNumber}
                </p>
                <p className="modal-success-sub">
                  {paymentMethod === 'cod' 
                    ? t('buyNowModal.payOnDelivery') 
                    : t('buyNowModal.paymentProcessed')
                  }
                </p>
                <div className="modal-success-summary">
                  <img src={product.imageUrl} alt={product.name} />
                  <div>
                    <span>{product.name}</span>
                    <span className="modal-success-total">${orderSuccess.total?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="modal-success-actions">
                  <button 
                    className="btn btn-primary btn-full" 
                    onClick={() => { closeModal(); navigate('/orders'); }}
                  >
                    {t('buyNowModal.viewOrders')}
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={closeModal}>
                    {t('buyNowModal.continueShopping')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>{t('buyNowModal.quickCheckout')}</h2>
                  <p>{t('buyNowModal.completePurchase')}</p>
                </div>

                <div className="modal-product">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="modal-product-info">
                    <span className="modal-product-name">{product.name}</span>
                    <span className="modal-product-brand">{product.brand}</span>
                    <div className="modal-product-row">
                      <span>{t('buyNowModal.qty')}: {qty} × ${currentPrice.toFixed(2)}</span>
                      <strong>${lineTotal}</strong>
                    </div>
                    {originalPrice && originalPrice > currentPrice && (
                      <div className="modal-price-drop">
                        <TrendingDown size={12} />
                        <span>{t('products.youSave', 'You save')} ${displaySavings.toFixed(2)}!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-section">
                  <h4>
                    <span className="modal-step">1</span> {t('buyNowModal.contactDetails')}
                  </h4>
                  <div className="modal-form-grid">
                    <div className="modal-field">
                      <label>{t('buyNowModal.fullName')} *</label>
                      <input 
                        value={orderForm.fullName} 
                        onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} 
                        placeholder={t('buyNowModal.fullName')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.email')} *</label>
                      <input 
                        value={orderForm.email} 
                        onChange={e => setOrderForm({...orderForm, email: e.target.value})}
                        type="email"
                        placeholder={t('buyNowModal.email')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.phone')}</label>
                      <input 
                        value={orderForm.phone} 
                        onChange={e => setOrderForm({...orderForm, phone: e.target.value})}
                        placeholder={t('buyNowModal.phone')}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>
                    <MapPin size={14} /> <span className="modal-step">2</span> {t('buyNowModal.shippingAddress')}
                  </h4>
                  <div className="modal-form-grid">
                    <div className="modal-field full">
                      <label>{t('buyNowModal.streetAddress')} *</label>
                      <input 
                        value={orderForm.street} 
                        onChange={e => setOrderForm({...orderForm, street: e.target.value})}
                        placeholder={t('buyNowModal.streetAddress')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.city')} *</label>
                      <input 
                        value={orderForm.city} 
                        onChange={e => setOrderForm({...orderForm, city: e.target.value})}
                        placeholder={t('buyNowModal.city')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.state')} *</label>
                      <input 
                        value={orderForm.state} 
                        onChange={e => setOrderForm({...orderForm, state: e.target.value})}
                        placeholder={t('buyNowModal.state')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.zipCode')} *</label>
                      <input 
                        value={orderForm.zipCode} 
                        onChange={e => setOrderForm({...orderForm, zipCode: e.target.value})}
                        placeholder={t('buyNowModal.zipCode')}
                      />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.country')} *</label>
                      <input 
                        value={orderForm.country} 
                        onChange={e => setOrderForm({...orderForm, country: e.target.value})}
                        placeholder={t('buyNowModal.country')}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4>
                    <span className="modal-step">3</span> {t('buyNowModal.payment')}
                  </h4>
                  <div className="modal-payment-options">
                    <div 
                      className={`modal-payment ${paymentMethod === 'cod' ? 'active' : ''}`} 
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className={`modal-radio ${paymentMethod === 'cod' ? 'checked' : ''}`} />
                      <Truck size={18} />
                      <div>
                        <strong>{t('buyNowModal.cod')}</strong>
                        <span>{t('buyNowModal.codDesc')}</span>
                      </div>
                    </div>
                    <div 
                      className={`modal-payment ${paymentMethod === 'stripe' ? 'active' : ''}`} 
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      <div className={`modal-radio ${paymentMethod === 'stripe' ? 'checked' : ''}`} />
                      <CreditCard size={18} />
                      <div>
                        <strong>{t('buyNowModal.payWithCard')}</strong>
                        <span>{t('buyNowModal.cardDesc')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-totals">
                  <div className="modal-total-row">
                    <span>{t('buyNowModal.subtotal')}</span>
                    <span>${lineTotal}</span>
                  </div>
                  <div className="modal-total-row">
                    <span>{t('buyNowModal.tax')}</span>
                    <span>${tax}</span>
                  </div>
                  <div className="modal-total-row">
                    <span>{t('buyNowModal.shipping')}</span>
                    <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : t('buyNowModal.free')}</span>
                  </div>
                  {originalPrice && originalPrice > currentPrice && (
                    <div className="modal-total-row savings">
                      <span>{t('products.priceDropSavings', 'Price drop savings')}</span>
                      <span className="text-success">-${displaySavings.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="modal-total-row total">
                    <span>{t('buyNowModal.total')}</span>
                    <span>${orderTotal}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-full btn-lg modal-order-btn" 
                  onClick={handlePlaceOrder} 
                  disabled={processing}
                >
                  {processing ? (
                    <><Loader size={18} className="spin" /> {t('buyNowModal.processing')}</>
                  ) : paymentMethod === 'stripe' ? (
                    <><CreditCard size={18} /> {t('buyNowModal.pay')} ${orderTotal}</>
                  ) : (
                    <><Truck size={18} /> {t('buyNowModal.placeOrderCod')}</>
                  )}
                </button>

                <div className="modal-trust">
                  <Shield size={13} /> 
                  <span>{t('buyNowModal.secureCheckout')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}