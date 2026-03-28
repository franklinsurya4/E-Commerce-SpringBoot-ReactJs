import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, X, Truck, CreditCard, Shield, Check, MapPin, Loader } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api/api';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout Modal
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
    if (showModal && user) {
      setOrderForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [showModal, user]);

  const subtotal = cart.subtotal || 0;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));

  const handlePlaceOrder = async () => {
    const { fullName, email, street, city, state, zipCode, country } = orderForm;
    if (!fullName || !email || !street || !city || !state || !zipCode || !country) {
      toast.error('Please fill all required fields');
      return;
    }

    setProcessing(true);
    try {
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
        total: total,
        itemCount: cart.itemCount,
      });
      clearCart();
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
    if (orderSuccess) navigate('/orders');
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (!cart.items?.length && !showModal) {
    return (
      <div className="page-container">
        <div className="cart-empty">
          <ShoppingBag size={56} color="var(--text-muted)" />
          <h2>Your cart is empty</h2>
          <p>Add some products to get started.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Shopping Cart ({cart.itemCount} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.product?.imageUrl} alt={item.product?.name} className="cart-item-img" />
              <div className="cart-item-info">
                <Link to={`/products/${item.product?.id}`} className="cart-item-name" style={{ color: 'var(--text-primary)' }}>
                  {item.product?.name}
                </Link>
                <p className="cart-item-meta">
                  {item.product?.brand}
                  {item.selectedSize && ` • Size: ${item.selectedSize}`}
                  {item.selectedColor && ` • Color: ${item.selectedColor}`}
                </p>
                <div className="cart-item-bottom">
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                  </div>
                  <span className="cart-item-price">${item.lineTotal?.toFixed(2)}</span>
                </div>
                <button className="cart-remove" onClick={() => removeItem(item.id)}>
                  <Trash2 size={14} style={{ marginRight: 4 }} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span></div>
          <div className="summary-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowModal(true)}>
            Proceed to Checkout
          </button>
          {shipping > 0 && subtotal > 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Add ${(50 - subtotal).toFixed(2)} more for free shipping
            </p>
          )}
        </div>
      </div>

      {/* ── CHECKOUT MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}><X size={20} /></button>

            {orderSuccess ? (
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
                  <ShoppingBag size={28} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div>
                    <span>{orderSuccess.itemCount} items ordered</span>
                    <span className="modal-success-total">${orderSuccess.total?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="modal-success-actions">
                  <button className="btn btn-primary btn-full" onClick={() => { closeModal(); navigate('/orders'); }}>
                    View Orders
                  </button>
                  <button className="btn btn-ghost btn-full" onClick={() => { closeModal(); navigate('/products'); }}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Checkout</h2>
                  <p>{cart.itemCount} items — ${subtotal.toFixed(2)}</p>
                </div>

                {/* Cart Items Preview */}
                <div className="modal-cart-items">
                  {cart.items.slice(0, 3).map(item => (
                    <div key={item.id} className="modal-cart-item">
                      <img src={item.product?.imageUrl} alt={item.product?.name} />
                      <div>
                        <span className="modal-product-name">{item.product?.name}</span>
                        <span className="modal-product-brand">
                          Qty: {item.quantity} × ${item.product?.price?.toFixed(2)}
                        </span>
                      </div>
                      <strong>${item.lineTotal?.toFixed(2)}</strong>
                    </div>
                  ))}
                  {cart.items.length > 3 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>
                      + {cart.items.length - 3} more items
                    </p>
                  )}
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

                {/* Payment */}
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

                {/* Totals */}
                <div className="modal-totals">
                  <div className="modal-total-row"><span>Subtotal ({cart.itemCount} items)</span><span>${subtotal.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>Shipping</span><span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span></div>
                  <div className="modal-total-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
                </div>

                <button className="btn btn-primary btn-full btn-lg modal-order-btn" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (
                    <><Loader size={18} className="spin" /> Processing...</>
                  ) : paymentMethod === 'stripe' ? (
                    <><CreditCard size={18} /> Pay ${total.toFixed(2)}</>
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