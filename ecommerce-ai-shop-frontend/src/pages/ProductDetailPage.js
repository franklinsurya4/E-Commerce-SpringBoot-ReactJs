import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Minus, Plus, Zap, X, Truck, CreditCard, Shield, Check, MapPin, Loader, ArrowLeft, Heart } from 'lucide-react';
import { productAPI, reviewAPI, orderAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/Wishlistcontext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
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

  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  // Translate a backend category name using the categories map, fallback to original
  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  useEffect(() => {
    productAPI.getById(id).then(r => setProduct(r.data.data)).catch(() => {});
    reviewAPI.getForProduct(id).then(r => setReviews(r.data.data || [])).catch(() => {});
  }, [id]);

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
    if (isInWishlist(product.id)) {
      toast.success(t('products.removedFromWishlist'));
    } else {
      toast.success(t('products.addedToWishlistToast'));
    }
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
        shippingAddress: street,
        shippingCity: city,
        shippingState: state,
        shippingZip: zipCode,
        shippingCountry: country,
        paymentMethod: paymentMethod.toUpperCase(),
      };

      const res = await orderAPI.place(orderData);
      const order = res.data.data || res.data;

      if (paymentMethod === 'stripe' && order.stripeCheckoutUrl) {
        window.location.href = order.stripeCheckoutUrl;
        return;
      }

      setOrderSuccess({
        orderNumber: order.orderNumber || order.id,
        trackingNumber: order.trackingNumber,
        total: (product.price * qty),
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
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await reviewAPI.add(id, { rating, comment });
      setReviews(prev => [res.data.data, ...prev]);
      setComment('');
      toast.success(t('reviews.added'));
    } catch (e) {
      toast.error(e.response?.data?.message || t('reviews.failed'));
    }
    setSubmitting(false);
  };

  if (!product) return <div className="page-loader"><div className="spinner" /></div>;

  const wishlisted = isInWishlist(product.id);
  const lineTotal = (product.price * qty).toFixed(2);
  const tax = (product.price * qty * 0.08).toFixed(2);
  const shipping = product.price * qty >= 50 ? 0 : 5.99;
  const orderTotal = (parseFloat(lineTotal) + parseFloat(tax) + shipping).toFixed(2);

  return (
    <div className="page-container">
      {/* Back Button */}
      <button className="btn btn-secondary btn-back" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} />
        <span>{t('common.back')}</span>
      </button>

      <div className="product-detail">
        <div className="pd-image"><img src={product.imageUrl} alt={product.name} /></div>
        <div className="pd-info">
          <span className="pd-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="pd-rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill={i < Math.round(product.rating) ? 'var(--warning)' : 'none'} color="var(--warning)" />
            ))}
            <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {product.rating} ({product.reviewCount} {t('products.reviews').toLowerCase()})
            </span>
          </div>
          <div className="pd-price-row">
            <span className="pd-price">${product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="pd-orig-price">${product.originalPrice?.toFixed(2)}</span>
                <span className="pd-discount">{t('products.save')} {Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
              </>
            )}
          </div>
          <p className="pd-desc">{product.description}</p>
          <p className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `✓ ${t('common.inStock')} (${product.stock} ${t('products.available')})` : `✗ ${t('common.outOfStock')}`}
          </p>

          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}><Plus size={16} /></button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}>
              <ShoppingBag size={18} />
              {addingToCart ? t('products.addingToCart') : t('products.addToCart')}
            </button>
            <button className="btn btn-buy-now btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>
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

          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {product.tags.map(tag => <span key={tag} className="badge badge-accent">{tag}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="page-title">{t('reviews.title')}</h2>
        {isAuthenticated && (
          <div className="review-form card">
            <h3 style={{ marginBottom: 12 }}>{t('reviews.writeReview')}</h3>
            <div className="star-input">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={s <= rating ? 'filled' : ''} onClick={() => setRating(s)}>
                  <Star size={22} fill={s <= rating ? 'var(--warning)' : 'none'} color="var(--warning)" />
                </button>
              ))}
            </div>
            <textarea placeholder={t('reviews.placeholder')} value={comment} onChange={e => setComment(e.target.value)} />
            <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>
              {submitting ? t('reviews.submitting') : t('reviews.submit')}
            </button>
          </div>
        )}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>{t('reviews.noReviews')}</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header">
                <span className="reviewer-name">{r.userName}</span>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < r.rating ? 'var(--warning)' : 'none'} color="var(--warning)" />
                ))}
              </div>
              <p className="review-comment">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* ── BUY NOW MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>

            {orderSuccess ? (
              <div className="modal-success">
                <div className="modal-success-icon"><Check size={36} /></div>
                <h2>{t('buyNowModal.orderPlacedTitle')}</h2>
                <p>{t('buyNowModal.orderConfirmed', { number: orderSuccess.orderNumber })}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {t('buyNowModal.tracking')}: {orderSuccess.trackingNumber}
                </p>
                <p className="modal-success-sub">
                  {paymentMethod === 'cod' ? t('buyNowModal.payOnDelivery') : t('buyNowModal.paymentProcessed')}
                </p>
                <div className="modal-success-summary">
                  <img src={product.imageUrl} alt={product.name} />
                  <div>
                    <span>{product.name}</span>
                    <span className="modal-success-total">${orderSuccess.total?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="modal-success-actions">
                  <button className="btn btn-primary btn-full" onClick={() => { closeModal(); navigate('/orders'); }}>
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
                      <span>{t('buyNowModal.qty')}: {qty} × ${product.price?.toFixed(2)}</span>
                      <strong>${lineTotal}</strong>
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><span className="modal-step">1</span> {t('buyNowModal.contactDetails')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field">
                      <label>{t('buyNowModal.fullName')} *</label>
                      <input value={orderForm.fullName} onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.email')} *</label>
                      <input value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.phone')}</label>
                      <input value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><MapPin size={14} /> <span className="modal-step">2</span> {t('buyNowModal.shippingAddress')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field full">
                      <label>{t('buyNowModal.streetAddress')} *</label>
                      <input value={orderForm.street} onChange={e => setOrderForm({...orderForm, street: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.city')} *</label>
                      <input value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.state')} *</label>
                      <input value={orderForm.state} onChange={e => setOrderForm({...orderForm, state: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.zipCode')} *</label>
                      <input value={orderForm.zipCode} onChange={e => setOrderForm({...orderForm, zipCode: e.target.value})} />
                    </div>
                    <div className="modal-field">
                      <label>{t('buyNowModal.country')} *</label>
                      <input value={orderForm.country} onChange={e => setOrderForm({...orderForm, country: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><span className="modal-step">3</span> {t('buyNowModal.payment')}</h4>
                  <div className="modal-payment-options">
                    <div className={`modal-payment ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <div className={`modal-radio ${paymentMethod === 'cod' ? 'checked' : ''}`} />
                      <Truck size={18} />
                      <div>
                        <strong>{t('buyNowModal.cod')}</strong>
                        <span>{t('buyNowModal.codDesc')}</span>
                      </div>
                    </div>
                    <div className={`modal-payment ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}>
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
                  <div className="modal-total-row"><span>{t('buyNowModal.subtotal')}</span><span>${lineTotal}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.tax')}</span><span>${tax}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.shipping')}</span><span>{shipping > 0 ? `$${shipping.toFixed(2)}` : t('buyNowModal.free')}</span></div>
                  <div className="modal-total-row total"><span>{t('buyNowModal.total')}</span><span>${orderTotal}</span></div>
                </div>

                <button className="btn btn-primary btn-full btn-lg modal-order-btn" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (
                    <><Loader size={18} className="spin" /> {t('buyNowModal.processing')}</>
                  ) : paymentMethod === 'stripe' ? (
                    <><CreditCard size={18} /> {t('buyNowModal.pay')} ${orderTotal}</>
                  ) : (
                    <><Truck size={18} /> {t('buyNowModal.placeOrderCod')}</>
                  )}
                </button>

                <div className="modal-trust">
                  <Shield size={13} /> <span>{t('buyNowModal.secureCheckout')}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}