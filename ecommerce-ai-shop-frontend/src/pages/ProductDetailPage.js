import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Minus, Plus, Zap, X, Truck, CreditCard, Shield, Check, MapPin, Loader } from 'lucide-react';
import { productAPI, reviewAPI, orderAPI } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Buy Now Modal
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

  useEffect(() => {
    productAPI.getById(id).then(r => setProduct(r.data.data)).catch(() => {});
    reviewAPI.getForProduct(id).then(r => setReviews(r.data.data || [])).catch(() => {});
  }, [id]);

  // Pre-fill form with user data when modal opens
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
      toast.error('Please sign in to add items');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, qty);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(err?.response?.data?.message || 'Failed to add to cart');
    }
    setAddingToCart(false);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order');
      navigate('/login');
      return;
    }
    setShowModal(true);
    setOrderSuccess(null);
  };

  const handlePlaceOrder = async () => {
    const { fullName, email, street, city, state, zipCode, country } = orderForm;
    if (!fullName || !email || !street || !city || !state || !zipCode || !country) {
      toast.error('Please fill all required fields');
      return;
    }

    setProcessing(true);
    try {
      // Buy Now: add to cart first, then place order (backend reads from cart)
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
      toast.success('Order placed successfully!');
    } catch (err) {
      console.error('Order failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to place order');
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
      toast.success('Review added!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add review');
    }
    setSubmitting(false);
  };

  if (!product) return <div className="page-loader"><div className="spinner" /></div>;

  const lineTotal = (product.price * qty).toFixed(2);
  const tax = (product.price * qty * 0.08).toFixed(2);
  const shipping = product.price * qty >= 50 ? 0 : 5.99;
  const orderTotal = (parseFloat(lineTotal) + parseFloat(tax) + shipping).toFixed(2);

  return (
    <div className="page-container">
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
              {product.rating} ({product.reviewCount} reviews)
            </span>
          </div>
          <div className="pd-price-row">
            <span className="pd-price">${product.price?.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="pd-orig-price">${product.originalPrice?.toFixed(2)}</span>
                <span className="pd-discount">Save {Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
              </>
            )}
          </div>
          <p className="pd-desc">{product.description}</p>
          <p className={`pd-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `✓ In stock (${product.stock} available)` : '✗ Out of stock'}
          </p>

          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}><Plus size={16} /></button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}>
              <ShoppingBag size={18} />
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="btn btn-buy-now btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {product.tags.map(t => <span key={t} className="badge badge-accent">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <h2 className="page-title">Reviews</h2>
        {isAuthenticated && (
          <div className="review-form card">
            <h3 style={{ marginBottom: 12 }}>Write a Review</h3>
            <div className="star-input">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={s <= rating ? 'filled' : ''} onClick={() => setRating(s)}>
                  <Star size={22} fill={s <= rating ? 'var(--warning)' : 'none'} color="var(--warning)" />
                </button>
              ))}
            </div>
            <textarea placeholder="Share your thoughts..." value={comment} onChange={e => setComment(e.target.value)} />
            <button className="btn btn-primary" onClick={submitReview} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '24px 0' }}>No reviews yet. Be the first!</p>
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
            {/* Close Button */}
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>

            {orderSuccess ? (
              /* ── SUCCESS SCREEN ── */
              <div className="modal-success">
                <div className="modal-success-icon"><Check size={36} /></div>
                <h2>Order Placed!</h2>
                <p>Order <strong>#{orderSuccess.orderNumber}</strong> confirmed</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Tracking: {orderSuccess.trackingNumber}
                </p>
                <p className="modal-success-sub">
                  {paymentMethod === 'cod' ? 'Pay on delivery' : 'Payment processed'}
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
                    View Orders
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={closeModal}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              /* ── ORDER FORM ── */
              <>
                <div className="modal-header">
                  <h2>Quick Checkout</h2>
                  <p>Complete your purchase</p>
                </div>

                {/* Product Summary */}
                <div className="modal-product">
                  <img src={product.imageUrl} alt={product.name} />
                  <div className="modal-product-info">
                    <span className="modal-product-name">{product.name}</span>
                    <span className="modal-product-brand">{product.brand}</span>
                    <div className="modal-product-row">
                      <span>Qty: {qty} × ${product.price?.toFixed(2)}</span>
                      <strong>${lineTotal}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="modal-section">
                  <h4><span className="modal-step">1</span> Contact Details</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field">
                      <label>Full Name *</label>
                      <input value={orderForm.fullName} onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} placeholder="Franklin" />
                    </div>
                    <div className="modal-field">
                      <label>Email *</label>
                      <input value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} placeholder="you@email.com" />
                    </div>
                    <div className="modal-field">
                      <label>Phone</label>
                      <input value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="modal-section">
                  <h4><MapPin size={14} /> <span className="modal-step">2</span> Shipping Address</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field full">
                      <label>Street Address *</label>
                      <input value={orderForm.street} onChange={e => setOrderForm({...orderForm, street: e.target.value})} placeholder="123 Main Street, Apt 4B" />
                    </div>
                    <div className="modal-field">
                      <label>City *</label>
                      <input value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} placeholder="Vellore" />
                    </div>
                    <div className="modal-field">
                      <label>State *</label>
                      <input value={orderForm.state} onChange={e => setOrderForm({...orderForm, state: e.target.value})} placeholder="Tamil Nadu" />
                    </div>
                    <div className="modal-field">
                      <label>ZIP Code *</label>
                      <input value={orderForm.zipCode} onChange={e => setOrderForm({...orderForm, zipCode: e.target.value})} placeholder="632001" />
                    </div>
                    <div className="modal-field">
                      <label>Country *</label>
                      <input value={orderForm.country} onChange={e => setOrderForm({...orderForm, country: e.target.value})} placeholder="India" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="modal-section">
                  <h4><span className="modal-step">3</span> Payment</h4>
                  <div className="modal-payment-options">
                    <div className={`modal-payment ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <div className={`modal-radio ${paymentMethod === 'cod' ? 'checked' : ''}`} />
                      <Truck size={18} />
                      <div>
                        <strong>Cash on Delivery</strong>
                        <span>Pay when you receive</span>
                      </div>
                    </div>
                    <div className={`modal-payment ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                      <div className={`modal-radio ${paymentMethod === 'stripe' ? 'checked' : ''}`} />
                      <CreditCard size={18} />
                      <div>
                        <strong>Pay with Card</strong>
                        <span>Visa, Mastercard, UPI</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Total */}
                <div className="modal-totals">
                  <div className="modal-total-row"><span>Subtotal</span><span>${lineTotal}</span></div>
                  <div className="modal-total-row"><span>Tax (8%)</span><span>${tax}</span></div>
                  <div className="modal-total-row"><span>Shipping</span><span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span></div>
                  <div className="modal-total-row total"><span>Total</span><span>${orderTotal}</span></div>
                </div>

                {/* Place Order Button */}
                <button className="btn btn-primary btn-full btn-lg modal-order-btn" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (
                    <><Loader size={18} className="spin" /> Processing...</>
                  ) : paymentMethod === 'stripe' ? (
                    <><CreditCard size={18} /> Pay ${orderTotal}</>
                  ) : (
                    <><Truck size={18} /> Place Order (COD)</>
                  )}
                </button>

                <div className="modal-trust">
                  <Shield size={13} /> <span>Secure checkout — encrypted & protected</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}