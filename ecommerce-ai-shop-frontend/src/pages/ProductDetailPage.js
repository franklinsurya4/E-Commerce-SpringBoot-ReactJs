import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Minus, Plus, Zap, X, Truck, CreditCard, Shield, Check, MapPin, Loader, ArrowLeft, Heart, Wallet } from 'lucide-react';
import { productAPI, reviewAPI, orderAPI, walletAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/Wishlistcontext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/product-detail.css'

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

  // Buy Now Modal State
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({
    fullName: '', email: '', phone: '',
    street: '', city: '', state: '', zipCode: '', country: ''
  });
  
  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);

  const tc = (cat) => t(`categories.${cat}`, { defaultValue: cat });

  // Fetch product & reviews
  useEffect(() => {
    productAPI.getById(id).then(r => setProduct(r.data.data)).catch(() => {});
    reviewAPI.getForProduct(id).then(r => setReviews(r.data.data || [])).catch(() => {});
  }, [id]);

  // Fetch wallet balance when modal opens
  useEffect(() => {
    if (showModal && user?.id) {
      fetchWalletBalance();
    }
  }, [showModal, user?.id]);

  // Pre-fill form when user authenticated
  useEffect(() => {
    if (showModal && user) {
      setOrderForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [showModal, user]);

  const fetchWalletBalance = async () => {
    if (!user?.id) {
      setWalletBalance(0);
      setWalletLoading(false);
      return;
    }
    setWalletLoading(true);
    try {
      const res = await walletAPI.getBalance();
      let balance = 0;
      if (res?.data?.balance !== undefined) balance = res.data.balance;
      else if (res?.data?.data?.balance !== undefined) balance = res.data.data.balance;
      else if (typeof res?.data === 'number') balance = res.data;
      setWalletBalance(Number(balance) || 0);
    } catch { setWalletBalance(0); }
    finally { setWalletLoading(false); }
  };

  const formatCurrency = (value) => {
    const num = typeof value === 'number' && !isNaN(value) ? value : 0;
    return num.toFixed(2);
  };

  const safeWalletBalance = typeof walletBalance === 'number' && !isNaN(walletBalance) ? walletBalance : 0;
  const lineTotal = product ? (product.price * qty) : 0;
  const cartTax = parseFloat((lineTotal * 0.08).toFixed(2));
  const cartShipping = lineTotal >= 50 ? 0 : 5.99;
  const cartTotal = parseFloat((lineTotal + cartTax + cartShipping).toFixed(2));
  const hasSufficientWalletBalance = safeWalletBalance >= cartTotal - 0.01;

  // Add to Cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error(t('products.signInToAdd')); navigate('/login'); return; }
    if (!product || product.stock === 0) { toast.error(t('products.outOfStock')); return; }
    
    setAddingToCart(true);
    try {
      await addToCart({
        productId: product.id, name: product.name, brand: product.brand,
        price: product.price, imageUrl: product.imageUrl, quantity: qty,
        selectedSize: null, selectedColor: null
      });
      toast.success(t('products.addedToCartToast', { name: product.name }));
    } catch (err) { toast.error(err?.response?.data?.message || t('products.failedAddToCart')); }
    setAddingToCart(false);
  };

  // Buy Now - Show modal
  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error(t('products.signInToOrder')); navigate('/login'); return; }
    if (!product || product.stock === 0) { toast.error(t('products.outOfStock')); return; }
    setShowModal(true);
    setOrderSuccess(null);
    setPaymentMethod('cod');
    if (user?.id) fetchWalletBalance();
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product);
    toast.success(isInWishlist(product.id) ? t('products.removedFromWishlist') : t('products.addedToWishlistToast'));
  };

  // PLACE ORDER
  const handlePlaceOrder = async () => {
    const { fullName, email, street, city, state, zipCode, country } = orderForm;
    if (!fullName || !email || !street || !city || !state || !zipCode || !country) {
      toast.error(t('buyNowModal.fillAllFields'));
      return;
    }

    if (paymentMethod === 'wallet') {
      const walletPaymentData = {
        items: [{
          productId: product.id, name: product.name, brand: product.brand,
          imageUrl: product.imageUrl, price: product.price, quantity: qty, lineTotal: lineTotal
        }],
        subtotal: lineTotal, tax: cartTax, shipping: cartShipping, total: cartTotal,
        shippingAddress: { street, city, state, zipCode, country },
        contact: { fullName, email, phone: orderForm.phone },
        isFromCart: false,
        productDetails: { id: product.id, name: product.name, imageUrl: product.imageUrl }
      };

      sessionStorage.setItem('walletPayment', JSON.stringify(walletPaymentData));
      closeModal();
      navigate('/wallet/pay');
      return;
    }

    setProcessing(true);
    try {
      const orderPayload = {
        items: [{ productId: product.id, quantity: qty, price: product.price, lineTotal: lineTotal }],
        shippingAddress: street, shippingCity: city, shippingState: state,
        shippingZip: zipCode, shippingCountry: country,
        paymentMethod: paymentMethod === 'stripe' ? 'STRIPE' : 'COD',
        subtotal: lineTotal, tax: cartTax, shipping: cartShipping, total: cartTotal,
        contact: { fullName, email, phone: orderForm.phone }
      };

      const res = await orderAPI.place(orderPayload);
      const order = res.data.data || res.data;

      if (paymentMethod === 'stripe' && order.stripeCheckoutUrl) {
        window.location.href = order.stripeCheckoutUrl;
        return;
      }

      setOrderSuccess({ orderNumber: order.orderNumber || order.id, trackingNumber: order.trackingNumber, total: cartTotal });
      toast.success(t('buyNowModal.orderPlaced'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('buyNowModal.orderFailed'));
    } finally { setProcessing(false); }
  };

  const closeModal = () => {
    setShowModal(false);
    setOrderSuccess(null);
    setProcessing(false);
    if (orderSuccess) navigate('/orders');
  };

  const submitReview = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await reviewAPI.add(id, { rating, comment });
      setReviews(prev => [res.data.data, ...prev]);
      setComment('');
      toast.success(t('reviews.added'));
    } catch (e) { toast.error(e.response?.data?.message || t('reviews.failed')); }
    setSubmitting(false);
  };

  if (!product) return <div className="page-loader"><div className="spinner" /></div>;

  const wishlisted = isInWishlist(product.id);

  return (
    <div className="page-container">
      {/* Back Button - Top Left */}
      <button className="btn-back-top" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /><span>{t('common.back')}</span>
      </button>

      <div className="product-detail">
        <div className="pd-image"><img src={product.imageUrl} alt={product.name} /></div>
        <div className="pd-info">
          <span className="pd-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="pd-rating">
            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < Math.round(product.rating) ? 'var(--warning)' : 'none'} color="var(--warning)" />)}
            <span style={{ marginLeft: 8, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{product.rating} ({product.reviewCount} {t('products.reviews').toLowerCase()})</span>
          </div>
          <div className="pd-price-row">
            <span className="pd-price">${product.price?.toFixed(2)}</span>
            {product.originalPrice && (<><span className="pd-orig-price">${product.originalPrice?.toFixed(2)}</span><span className="pd-discount">{t('products.save')} {Math.round((1 - product.price / product.originalPrice) * 100)}%</span></>)}
          </div>
          <p className="pd-desc">{product.description}</p>
          <p className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `✓ ${t('common.inStock')} (${product.stock} ${t('products.available')})` : `✗ ${t('common.outOfStock')}`}
          </p>

          {/* 3 Buttons: Add to Cart | Buy Now | Add to Wishlist */}
          <div className="pd-actions-row">
            <button className="btn btn-primary btn-action" onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}>
              <ShoppingBag size={18} />{addingToCart ? t('products.addingToCart') : t('products.addToCart')}
            </button>
            <button className="btn btn-buy-now btn-action" onClick={handleBuyNow} disabled={product.stock === 0}>
              <Zap size={18} /> {t('products.buyNow')}
            </button>
            <button className={`btn btn-wishlist-action ${wishlisted ? 'wishlisted' : ''}`} onClick={handleWishlist}>
              <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} color={wishlisted ? '#ef4444' : 'currentColor'} />
              <span>{wishlisted ? t('products.addedToWishlist') : t('products.addToWishlistBtn')}</span>
            </button>
          </div>

          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {product.tags.map(tag => <span key={tag} className="badge badge-accent">{tag}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="reviews-section">
        <h2 className="page-title">{t('reviews.title')}</h2>
        {isAuthenticated && (
          <div className="review-form card">
            <h3 style={{ marginBottom: 12 }}>{t('reviews.writeReview')}</h3>
            <div className="star-input">
              {[1,2,3,4,5].map(s => <button key={s} className={s <= rating ? 'filled' : ''} onClick={() => setRating(s)}><Star size={22} fill={s <= rating ? 'var(--warning)' : 'none'} color="var(--warning)" /></button>)}
            </div>
            <textarea placeholder={t('reviews.placeholder')} value={comment} onChange={e => setComment(e.target.value)} />
            <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>{submitting ? t('reviews.submitting') : t('reviews.submit')}</button>
          </div>
        )}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>{t('reviews.noReviews')}</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-card">
              <div className="review-header"><span className="reviewer-name">{r.userName}</span><span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span></div>
              <div className="review-stars">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? 'var(--warning)' : 'none'} color="var(--warning)" />)}</div>
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
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t('buyNowModal.tracking')}: {orderSuccess.trackingNumber}</p>
                <p className="modal-success-sub">
                  {paymentMethod === 'cod' ? t('buyNowModal.payOnDelivery') : paymentMethod === 'wallet' ? t('wallet.paymentDeducted') : t('buyNowModal.paymentProcessed')}
                </p>
                <div className="modal-success-summary">
                  <img src={product.imageUrl} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                  <div><span>{product.name}</span><span className="modal-success-total">${orderSuccess.total?.toFixed(2)}</span></div>
                </div>
                <div className="modal-success-actions">
                  <button className="btn btn-primary btn-full" onClick={() => { closeModal(); navigate('/orders'); }}>{t('buyNowModal.viewOrders')}</button>
                  <button className="btn btn-ghost btn-full" onClick={closeModal}>{t('buyNowModal.continueShopping')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header"><h2>{t('buyNowModal.quickCheckout')}</h2><p>{t('buyNowModal.completePurchase')}</p></div>
                <div className="modal-product">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="modal-product-info">
                    <span className="modal-product-name">{product.name}</span>
                    <span className="modal-product-brand">{product.brand}</span>
                    <div className="modal-product-row"><span>{t('buyNowModal.qty')}: {qty} × ${product.price?.toFixed(2)}</span><strong>${lineTotal.toFixed(2)}</strong></div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><span className="modal-step">1</span> {t('buyNowModal.contactDetails')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field"><label>{t('buyNowModal.fullName')} *</label><input value={orderForm.fullName} onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} placeholder={t('buyNowModal.fullNamePlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.email')} *</label><input type="email" value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} placeholder={t('buyNowModal.emailPlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.phone')}</label><input type="tel" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} placeholder={t('buyNowModal.phonePlaceholder')} /></div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><MapPin size={14} /> <span className="modal-step">2</span> {t('buyNowModal.shippingAddress')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field full"><label>{t('buyNowModal.streetAddress')} *</label><input value={orderForm.street} onChange={e => setOrderForm({...orderForm, street: e.target.value})} placeholder={t('buyNowModal.streetPlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.city')} *</label><input value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} placeholder={t('buyNowModal.cityPlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.state')} *</label><input value={orderForm.state} onChange={e => setOrderForm({...orderForm, state: e.target.value})} placeholder={t('buyNowModal.statePlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.zipCode')} *</label><input value={orderForm.zipCode} onChange={e => setOrderForm({...orderForm, zipCode: e.target.value})} placeholder={t('buyNowModal.zipPlaceholder')} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.country')} *</label><input value={orderForm.country} onChange={e => setOrderForm({...orderForm, country: e.target.value})} placeholder={t('buyNowModal.countryPlaceholder')} /></div>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="modal-section">
                  <h4><span className="modal-step">3</span> {t('buyNowModal.payment')}</h4>
                  <div className="modal-payment-options">
                    <div className={`modal-payment ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}><div className={`modal-radio ${paymentMethod === 'cod' ? 'checked' : ''}`} /><Truck size={18} /><div><strong>{t('buyNowModal.cod')}</strong><span>{t('buyNowModal.codDesc')}</span></div></div>
                    
                    <div className={`modal-payment ${paymentMethod === 'wallet' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallet')} style={{ cursor: 'pointer', opacity: 1 }}>
                      <div className={`modal-radio ${paymentMethod === 'wallet' ? 'checked' : ''}`} /><Wallet size={18} />
                      <div style={{ flex: 1 }}>
                        <strong>{t('wallet.payWithWallet')}</strong>
                        <span>{walletLoading ? 'Loading balance...' : `${t('wallet.currentBalance')}: $${formatCurrency(safeWalletBalance)}`}</span>
                        {!walletLoading && !hasSufficientWalletBalance && <span style={{ fontSize: '0.72rem', color: 'var(--error, #ef4444)', marginTop: 4, display: 'block' }}>✗ {t('wallet.insufficient', { needed: formatCurrency(cartTotal) })}</span>}
                        {!walletLoading && hasSufficientWalletBalance && <span style={{ fontSize: '0.72rem', color: 'var(--success, #22c55e)', marginTop: 4, display: 'block' }}>✓ {t('wallet.sufficientBalance')}</span>}
                      </div>
                    </div>
                    
                    <div className={`modal-payment ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}><div className={`modal-radio ${paymentMethod === 'stripe' ? 'checked' : ''}`} /><CreditCard size={18} /><div><strong>{t('buyNowModal.payWithCard')}</strong><span>{t('buyNowModal.cardDesc')}</span></div></div>
                  </div>
                </div>

                <div className="modal-totals">
                  <div className="modal-total-row"><span>{t('buyNowModal.subtotal')}</span><span>${lineTotal.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.tax')}</span><span>${cartTax.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.shipping')}</span><span>{cartShipping > 0 ? `$${cartShipping.toFixed(2)}` : t('buyNowModal.free')}</span></div>
                  <div className="modal-total-row total"><span>{t('buyNowModal.total')}</span><span>${cartTotal.toFixed(2)}</span></div>
                  {paymentMethod === 'wallet' && !walletLoading && (<>
                    <div className="modal-total-row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)' }}><span>{t('wallet.currentBalance')}</span><span>${formatCurrency(safeWalletBalance)}</span></div>
                    <div className="modal-total-row"><span>{t('wallet.afterPayment')}</span><span style={{ color: safeWalletBalance - cartTotal < 0 ? 'var(--error, #ef4444)' : 'var(--success, #22c55e)', fontWeight: 700 }}>${formatCurrency(Math.max(0, safeWalletBalance - cartTotal))}</span></div>
                  </>)}
                </div>

                <button className="btn btn-primary btn-full btn-lg modal-order-btn" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (<><Loader size={18} className="spin" /> {t('buyNowModal.processing')}</>) : paymentMethod === 'stripe' ? (<><CreditCard size={18} /> {t('buyNowModal.pay')} ${cartTotal.toFixed(2)}</>) : paymentMethod === 'wallet' ? (<><Wallet size={18} /> {t('wallet.proceedToPayment')} ${cartTotal.toFixed(2)}</>) : (<><Truck size={18} /> {t('buyNowModal.placeOrderCod')}</>)}
                </button>

                <div className="modal-trust"><Shield size={13} /> <span>{t('buyNowModal.secureCheckout')}</span></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}