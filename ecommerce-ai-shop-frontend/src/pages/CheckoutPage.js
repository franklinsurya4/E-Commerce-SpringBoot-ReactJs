import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, userAPI } from '../api/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buynow';
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Buy Now item from sessionStorage
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    // Load addresses
    userAPI.getAddresses()
      .then(r => {
        const addrs = r.data.data || r.data || [];
        setAddresses(addrs);
        if (addrs.length > 0) setSelectedAddress(addrs[0].id);
      })
      .catch(() => {});

    // Load buy-now item
    if (isBuyNow) {
      const stored = sessionStorage.getItem('buyNow');
      if (stored) {
        setBuyNowItem(JSON.parse(stored));
      } else {
        navigate('/products');
      }
    }
  }, [isBuyNow, navigate]);

  // Determine items and totals
  const items = isBuyNow && buyNowItem
    ? [buyNowItem]
    : (cart.items || []).map(item => ({
        productId: item.product?.id || item.productId,
        name: item.product?.name || item.name,
        brand: item.product?.brand || item.brand,
        imageUrl: item.product?.imageUrl || item.imageUrl,
        price: item.product?.price || item.price,
        quantity: item.quantity,
        lineTotal: item.lineTotal || (item.product?.price || item.price) * item.quantity,
      }));

  const subtotal = isBuyNow && buyNowItem
    ? buyNowItem.lineTotal
    : (cart.subtotal || 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode || !addressForm.country) {
      toast.error('Please fill all address fields');
      return;
    }
    try {
      const res = await userAPI.addAddress(addressForm);
      const newAddr = res.data.data || res.data;
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddress(newAddr.id);
      setShowAddressForm(false);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: '' });
      toast.success('Address saved');
    } catch {
      toast.error('Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('No items to order');
      return;
    }

    setProcessing(true);
    try {
      const orderData = {
        addressId: selectedAddress,
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      if (paymentMethod === 'stripe') {
        // For Stripe, call a different endpoint or handle redirect
        try {
          const res = await orderAPI.place({ ...orderData, paymentMethod: 'STRIPE' });
          const order = res.data.data || res.data;

          // If backend returns a Stripe checkout URL, redirect
          if (order.stripeCheckoutUrl) {
            window.location.href = order.stripeCheckoutUrl;
            return;
          }

          // Otherwise order placed directly
          setOrderId(order.id || order.orderNumber);
          setOrderPlaced(true);
          if (!isBuyNow) clearCart();
          sessionStorage.removeItem('buyNow');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Stripe payment failed');
          setProcessing(false);
          return;
        }
      } else {
        // COD order
        const res = await orderAPI.place({ ...orderData, paymentMethod: 'COD' });
        const order = res.data.data || res.data;
        setOrderId(order.id || order.orderNumber);
        setOrderPlaced(true);
        if (!isBuyNow) clearCart();
        sessionStorage.removeItem('buyNow');
        toast.success('Order placed successfully!');
      }
    } catch (err) {
      console.error('Order failed:', err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setProcessing(false);
  };

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="page-container">
        <div className="order-success">
          <div className="order-success-icon">
            <Check size={40} />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Your order <strong>#{orderId}</strong> has been confirmed.</p>
          <p className="order-success-sub">
            {paymentMethod === 'cod'
              ? 'Payment will be collected upon delivery.'
              : 'Payment has been processed successfully.'}
          </p>
          <div className="order-success-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/orders`)}>
              View Orders
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isBuyNow) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={18} /> Back
      </button>
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Left Column */}
        <div>
          {/* Delivery Address */}
          <div className="checkout-section">
            <h3>Delivery Address</h3>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`address-option ${selectedAddress === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr.id)}
                  >
                    <div className="address-option-radio">
                      <div className={`radio-dot ${selectedAddress === addr.id ? 'active' : ''}`} />
                    </div>
                    <div>
                      <span className="address-label">{addr.label || 'Address'}</span>
                      <p className="address-text">
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No saved addresses</p>
            )}
            {!showAddressForm ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddressForm(true)}>
                + Add New Address
              </button>
            ) : (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Label</label>
                    <select value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}>
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input placeholder="India" value={addressForm.country}
                      onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} />
                  </div>
                  <div className="form-group full">
                    <label>Street Address</label>
                    <input placeholder="123 Main Street" value={addressForm.street}
                      onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input placeholder="Chennai" value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input placeholder="Tamil Nadu" value={addressForm.state}
                      onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input placeholder="600001" value={addressForm.zipCode}
                      onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveAddress}>Save Address</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input type="radio" checked={paymentMethod === 'cod'} readOnly />
                <Truck size={20} />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Pay when you receive</p>
                </div>
              </div>
              <div
                className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('stripe')}
              >
                <input type="radio" checked={paymentMethod === 'stripe'} readOnly />
                <CreditCard size={20} />
                <div>
                  <strong>Pay with Card (Stripe)</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Visa, Mastercard, UPI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="checkout-section">
            <h3>Order Items ({items.length})</h3>
            <div className="checkout-items">
              {items.map((item, i) => (
                <div key={i} className="checkout-item">
                  <img src={item.imageUrl} alt={item.name} className="checkout-item-img" />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    {item.brand && <span className="checkout-item-brand">{item.brand}</span>}
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">${item.lineTotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Summary */}
        <div>
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({items.length} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handlePlaceOrder}
              disabled={processing || !selectedAddress}
            >
              {processing ? 'Processing...' : paymentMethod === 'stripe' ? 'Pay with Stripe' : 'Place Order (COD)'}
            </button>

            <div className="checkout-trust">
              <Shield size={14} />
              <span>Secure checkout — your data is encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}