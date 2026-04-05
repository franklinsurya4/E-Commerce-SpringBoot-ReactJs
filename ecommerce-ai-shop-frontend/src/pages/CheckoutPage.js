// src/pages/CheckoutPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowLeft, Check, Wallet, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, userAPI, walletAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// 🔹 Helper: Safe number formatter
const formatCurrency = (value) => {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toFixed(2);
};

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBuyNow = searchParams.get('mode') === 'buynow';
  const { cart, clearCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'stripe' | 'wallet'
  const [walletBalance, setWalletBalance] = useState(0); // Start with 0, not null
  const [walletLoading, setWalletLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ 
    label: 'Home', street: '', city: '', state: '', zipCode: '', country: '' 
  });

  // 🔹 Fetch wallet balance on mount
  useEffect(() => {
    if (user?.id) {
      setWalletLoading(true);
      walletAPI.getBalance()
        .then(res => {
          // Handle various API response formats safely
          let balance = 0;
          if (res?.data?.balance !== undefined) {
            balance = res.data.balance;
          } else if (res?.data?.data?.balance !== undefined) {
            balance = res.data.data.balance;
          } else if (typeof res?.data === 'number') {
            balance = res.data;
          }
          setWalletBalance(Number(balance) || 0);
        })
        .catch(err => {
          console.warn('⚠️ Wallet balance fetch failed:', err);
          setWalletBalance(0); // Fallback to 0
          toast.error(t('wallet.errorLoading', { defaultValue: 'Could not load wallet balance' }));
        })
        .finally(() => {
          setWalletLoading(false);
        });
    } else {
      setWalletLoading(false);
    }
  }, [user?.id, t]);

  // 🔹 Fetch addresses and buy-now item
  useEffect(() => {
    if (user?.id) {
      userAPI.getAddresses()
        .then(r => { 
          const addrs = r.data?.data || r.data || []; 
          setAddresses(addrs); 
          if (addrs.length > 0 && !selectedAddress) {
            // Auto-select default address if available
            const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
            setSelectedAddress(defaultAddr.id); 
          }
        })
        .catch(err => {
          console.warn('⚠️ Failed to load addresses:', err);
          toast.error(t('checkout.failedLoadAddresses', { defaultValue: 'Could not load addresses' }));
        });
    }
    
    if (isBuyNow) { 
      const stored = sessionStorage.getItem('buyNow'); 
      if (stored) {
        try {
          setBuyNowItem(JSON.parse(stored)); 
        } catch (e) {
          console.error('❌ Failed to parse buyNow item:', e);
          toast.error('Invalid purchase data');
          navigate('/products');
        }
      } else {
        navigate('/products'); 
      }
    }
  }, [isBuyNow, navigate, selectedAddress, t, user?.id]);

  // 🔹 Prepare items list
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

  // 🔹 Calculate totals
  const subtotal = isBuyNow && buyNowItem ? buyNowItem.lineTotal : (cart.subtotal || 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  // 🔹 Wallet balance checks
  const safeWalletBalance = typeof walletBalance === 'number' && !isNaN(walletBalance) ? walletBalance : 0;
  const hasSufficientWalletBalance = safeWalletBalance >= total - 0.01; // Small buffer for float comparison

  // 🔹 Handle address form
  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode || !addressForm.country) { 
      toast.error(t('checkout.fillAddressFields', { defaultValue: 'Please fill all address fields' })); 
      return; 
    }
    try {
      const res = await userAPI.addAddress(addressForm);
      const newAddr = res.data?.data || res.data;
      setAddresses(prev => [...prev, newAddr]); 
      setSelectedAddress(newAddr.id); 
      setShowAddressForm(false);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: '' });
      toast.success(t('checkout.addressSaved', { defaultValue: 'Address saved successfully' }));
    } catch (err) { 
      console.error('❌ Failed to save address:', err);
      toast.error(t('checkout.failedSaveAddress', { defaultValue: 'Failed to save address' })); 
    }
  };

  // 🔹 Handle order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddress) { 
      toast.error(t('checkout.selectAddress', { defaultValue: 'Please select a shipping address' })); 
      return; 
    }
    if (items.length === 0 && !isBuyNow) { 
      toast.error(t('checkout.noItemsToOrder', { defaultValue: 'No items to order' })); 
      return; 
    }

    // 🔹 Wallet Payment: Final balance check before placing order
    if (paymentMethod === 'wallet') {
      if (walletLoading) {
        toast.error(t('wallet.loading', { defaultValue: 'Please wait, loading wallet...' }));
        return;
      }
      if (!hasSufficientWalletBalance) {
        toast.error(t('wallet.errorInsufficientBalance', { 
          defaultValue: 'Insufficient wallet balance',
          current: formatCurrency(safeWalletBalance), 
          required: formatCurrency(total) 
        }));
        if (window.confirm(t('wallet.redirectToAddFunds', { defaultValue: 'Would you like to add funds to your wallet?' }))) {
          navigate('/wallet/add-funds');
        }
        return;
      }
    }

    setProcessing(true);
    try {
      const res = await orderAPI.place({ 
        addressId: selectedAddress, 
        paymentMethod: paymentMethod === 'stripe' ? 'STRIPE' : paymentMethod === 'wallet' ? 'WALLET' : 'COD',
        isBuyNow: isBuyNow
      });
      
      const order = res.data?.data || res.data;
      
      // 🔹 Handle Stripe redirect
      if (paymentMethod === 'stripe' && order?.stripeCheckoutUrl) { 
        window.location.href = order.stripeCheckoutUrl; 
        return; 
      }
      
      // 🔹 Order success
      setOrderId(order?.id || order?.orderNumber); 
      setOrderPlaced(true);
      
      if (!isBuyNow) clearCart(); 
      sessionStorage.removeItem('buyNow');
      
      toast.success(t('buyNowModal.orderPlaced', { defaultValue: 'Order placed successfully!' }));
      
    } catch (err) { 
      const msg = err.response?.data?.message || t('buyNowModal.orderFailed', { defaultValue: 'Order failed. Please try again.' });
      
      if (msg.includes('Insufficient wallet balance')) {
        toast.error(t('wallet.errorInsufficientBalance', { 
          defaultValue: 'Insufficient wallet balance',
          current: formatCurrency(safeWalletBalance), 
          required: formatCurrency(total) 
        }));
      } else {
        toast.error(msg);
      }
      console.error('❌ Order placement error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // 🔹 Order Success View
  if (orderPlaced) {
    return (
      <div className="page-container">
        <div className="order-success">
          <div className="order-success-icon"><Check size={40} /></div>
          <h1>{t('checkout.orderPlacedTitle', { defaultValue: 'Order Confirmed!' })}</h1>
          <p>{t('checkout.orderConfirmedMsg', { 
            defaultValue: 'Your order #{{id}} has been confirmed.', 
            id: orderId 
          })}</p>
          <p className="order-success-sub">
            {paymentMethod === 'cod' 
              ? t('checkout.codMessage', { defaultValue: 'Pay cash when your order arrives.' }) 
              : paymentMethod === 'wallet'
                ? t('checkout.walletMessage', { defaultValue: 'Payment deducted from your wallet balance.' }) 
                : t('checkout.cardMessage', { defaultValue: 'Payment processed successfully.' })}
          </p>
          <div className="order-success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              {t('buyNowModal.viewOrders', { defaultValue: 'View Orders' })}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/products')}>
              {t('buyNowModal.continueShopping', { defaultValue: 'Continue Shopping' })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Redirect if cart empty (non-buy-now)
  if (items.length === 0 && !isBuyNow) { 
    navigate('/cart'); 
    return null; 
  }

  // 🔹 Main Checkout Render
  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        <ArrowLeft size={18} /> {t('common.back', { defaultValue: 'Back' })}
      </button>
      <h1 className="page-title">{t('checkout.title', { defaultValue: 'Quick Checkout' })}</h1>
      <p className="page-subtitle">{t('checkout.subtitle', { defaultValue: 'Complete your purchase' })}</p>

      <div className="checkout-layout">
        <div className="checkout-form">
          {/* Address Section */}
          <div className="checkout-section">
            <h3>1. {t('checkout.deliveryAddress', { defaultValue: 'Shipping Address' })}</h3>
            
            {showAddressForm ? (
              <div className="address-form">
                <div className="form-grid">
                  <input 
                    type="text" 
                    placeholder={t('checkout.addressLabel', { defaultValue: 'Label (e.g., Home)' })}
                    value={addressForm.label}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                    className="form-input"
                  />
                  <input 
                    type="text" 
                    placeholder={t('checkout.street', { defaultValue: 'Street Address *' })}
                    value={addressForm.street}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                    className="form-input"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder={t('checkout.city', { defaultValue: 'City *' })}
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="form-input"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder={t('checkout.state', { defaultValue: 'State/Province *' })}
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="form-input"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder={t('checkout.zipCode', { defaultValue: 'ZIP/Postal Code *' })}
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="form-input"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder={t('checkout.country', { defaultValue: 'Country *' })}
                    value={addressForm.country}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={handleSaveAddress}>
                    {t('checkout.saveAddress', { defaultValue: 'Save Address' })}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setShowAddressForm(false)}>
                    {t('common.cancel', { defaultValue: 'Cancel' })}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="address-list">
                  {addresses.length === 0 ? (
                    <p className="text-muted">{t('checkout.noAddresses', { defaultValue: 'No saved addresses. Add one below.' })}</p>
                  ) : (
                    addresses.map(addr => (
                      <label key={addr.id} className={`address-option ${selectedAddress === addr.id ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="address" 
                          checked={selectedAddress === addr.id} 
                          onChange={() => setSelectedAddress(addr.id)} 
                        />
                        <div className="address-details">
                          <div className="address-header">
                            <strong>{addr.label}</strong>
                            {addr.isDefault && <span className="badge badge-default">{t('checkout.default', { defaultValue: 'Default' })}</span>}
                          </div>
                          <p className="address-line">{addr.street}</p>
                          <p className="address-line">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="address-line">{addr.country}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowAddressForm(true)}
                  style={{ marginTop: 12 }}
                >
                  + {t('checkout.addNewAddress', { defaultValue: 'Add New Address' })}
                </button>
              </>
            )}
          </div>

          {/* Payment Options Section */}
          <div className="checkout-section">
            <h3>2. {t('checkout.paymentMethod', { defaultValue: 'Payment Method' })}</h3>
            <div className="payment-options">
              {/* COD Option */}
              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} 
                onClick={() => setPaymentMethod('cod')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('cod')}
              >
                <div className="payment-radio">
                  <input type="radio" name="payment" id="cod" checked={paymentMethod === 'cod'} readOnly />
                  <label htmlFor="cod"><Truck size={20} /></label>
                </div>
                <div className="payment-info">
                  <strong>{t('buyNowModal.cod', { defaultValue: 'Cash on Delivery' })}</strong>
                  <p className="payment-desc">{t('buyNowModal.codDesc', { defaultValue: 'Pay when you receive your order' })}</p>
                </div>
              </div>

              {/* 🔹 WALLET Option — Always visible with clear status */}
              <div 
                className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''} ${!hasSufficientWalletBalance ? 'disabled' : ''}`} 
                onClick={() => !walletLoading && hasSufficientWalletBalance && setPaymentMethod('wallet')}
                role="button"
                tabIndex={walletLoading || !hasSufficientWalletBalance ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && !walletLoading && hasSufficientWalletBalance && setPaymentMethod('wallet')}
                style={{
                  cursor: walletLoading || !hasSufficientWalletBalance ? 'not-allowed' : 'pointer',
                  opacity: walletLoading ? 0.8 : 1
                }}
              >
                <div className="payment-radio">
                  <input type="radio" name="payment" id="wallet" checked={paymentMethod === 'wallet'} readOnly disabled={walletLoading || !hasSufficientWalletBalance} />
                  <label htmlFor="wallet"><Wallet size={20} /></label>
                </div>
                <div className="payment-info">
                  <strong>{t('checkout.payWithWallet', { defaultValue: 'Pay with Wallet' })}</strong>
                  <p className="payment-desc">
                    {walletLoading 
                      ? t('common.loading', { defaultValue: 'Loading balance...' })
                      : t('checkout.walletBalance', { 
                          defaultValue: 'Balance: ${{balance}}',
                          balance: formatCurrency(safeWalletBalance) 
                        })}
                  </p>
                  
                  {/* Status indicators */}
                  {!walletLoading && !hasSufficientWalletBalance && (
                    <p className="payment-error">
                      <AlertCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {t('checkout.insufficientBalance', { 
                        defaultValue: 'Insufficient funds. Need ${{required}}',
                        required: formatCurrency(total)
                      })}
                      <button 
                        type="button"
                        className="btn-link"
                        onClick={(e) => { e.stopPropagation(); navigate('/wallet/add-funds'); }}
                        style={{ marginLeft: 8 }}
                      >
                        {t('checkout.addFunds', { defaultValue: 'Add Funds' })} →
                      </button>
                    </p>
                  )}
                  
                  {!walletLoading && hasSufficientWalletBalance && (
                    <p className="payment-success">
                      ✓ {t('checkout.sufficientBalance', { defaultValue: 'Sufficient balance for this order' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Stripe/Card Option */}
              <div 
                className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`} 
                onClick={() => setPaymentMethod('stripe')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('stripe')}
              >
                <div className="payment-radio">
                  <input type="radio" name="payment" id="stripe" checked={paymentMethod === 'stripe'} readOnly />
                  <label htmlFor="stripe"><CreditCard size={20} /></label>
                </div>
                <div className="payment-info">
                  <strong>{t('buyNowModal.payWithCard', { defaultValue: 'Pay with Card' })} (Stripe)</strong>
                  <p className="payment-desc">{t('buyNowModal.cardDesc', { defaultValue: 'Secure payment via Visa, Mastercard, or UPI' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Preview */}
          <div className="checkout-section">
            <h3>3. {t('checkout.orderItems', { defaultValue: 'Order Items' })}</h3>
            <div className="order-items-preview">
              {items.map((item, idx) => (
                <div key={item.productId || idx} className="order-item-row">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="order-item-image"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="order-item-details">
                    <strong>{item.name}</strong>
                    {item.brand && <p className="item-brand">{item.brand}</p>}
                    <p className="item-qty-price">
                      {item.quantity} × ${formatCurrency(item.price)}
                    </p>
                  </div>
                  <strong className="item-total">${formatCurrency(item.lineTotal)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-summary">
          <div className="cart-summary">
            <h3>{t('cart.orderSummary', { defaultValue: 'Order Summary' })}</h3>
            
            <div className="summary-row">
              <span>{t('buyNowModal.subtotal', { defaultValue: 'Subtotal' })}</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>{t('buyNowModal.tax', { defaultValue: 'Tax (8%)' })}</span>
              <span>${formatCurrency(tax)}</span>
            </div>
            <div className="summary-row">
              <span>{t('buyNowModal.shipping', { defaultValue: 'Shipping' })}</span>
              <span>{shipping > 0 ? `$${formatCurrency(shipping)}` : t('buyNowModal.free', { defaultValue: 'Free' })}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-total">
              <span>{t('buyNowModal.total', { defaultValue: 'Total' })}</span>
              <span>${formatCurrency(total)}</span>
            </div>
            
            {/* Wallet balance preview */}
            {paymentMethod === 'wallet' && !walletLoading && (
              <div className="wallet-preview">
                <div className="summary-row">
                  <span>{t('checkout.currentBalance', { defaultValue: 'Current Balance' })}</span>
                  <span>${formatCurrency(safeWalletBalance)}</span>
                </div>
                <div className="summary-row">
                  <span>{t('checkout.afterPayment', { defaultValue: 'After Payment' })}</span>
                  <span className={safeWalletBalance - total < 0 ? 'text-error' : 'text-success'}>
                    ${formatCurrency(Math.max(0, safeWalletBalance - total))}
                  </span>
                </div>
              </div>
            )}
            
            <button 
              className="btn btn-primary btn-full btn-lg" 
              onClick={handlePlaceOrder} 
              disabled={
                processing || 
                !selectedAddress || 
                (paymentMethod === 'wallet' && (!hasSufficientWalletBalance || walletLoading))
              }
              style={{ marginTop: 16 }}
            >
              {processing 
                ? t('buyNowModal.processing', { defaultValue: 'Processing...' }) 
                : paymentMethod === 'stripe' 
                  ? t('checkout.payWithStripe', { defaultValue: 'Pay with Stripe' }) 
                  : paymentMethod === 'wallet'
                    ? walletLoading
                      ? t('common.loading', { defaultValue: 'Loading...' })
                      : !hasSufficientWalletBalance
                        ? t('checkout.insufficientFunds', { defaultValue: 'Add Funds to Pay' })
                        : t('checkout.payWithWallet', { defaultValue: 'Pay with Wallet' })
                    : t('buyNowModal.placeOrderCod', { defaultValue: 'Place Order (COD)' })}
            </button>
            
            <div className="checkout-trust">
              <Shield size={14} />
              <span>{t('checkout.secureData', { defaultValue: 'Secure checkout — encrypted & protected' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}