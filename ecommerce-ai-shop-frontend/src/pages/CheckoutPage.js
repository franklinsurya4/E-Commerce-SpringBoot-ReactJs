import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Truck, Shield, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, userAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { t } = useTranslation();
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
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: '' });

  useEffect(() => {
    userAPI.getAddresses().then(r => { const addrs = r.data.data || r.data || []; setAddresses(addrs); if (addrs.length > 0) setSelectedAddress(addrs[0].id); }).catch(() => {});
    if (isBuyNow) { const stored = sessionStorage.getItem('buyNow'); if (stored) setBuyNowItem(JSON.parse(stored)); else navigate('/products'); }
  }, [isBuyNow, navigate]);

  const items = isBuyNow && buyNowItem ? [buyNowItem] : (cart.items || []).map(item => ({
    productId: item.product?.id || item.productId, name: item.product?.name || item.name, brand: item.product?.brand || item.brand,
    imageUrl: item.product?.imageUrl || item.imageUrl, price: item.product?.price || item.price, quantity: item.quantity,
    lineTotal: item.lineTotal || (item.product?.price || item.price) * item.quantity,
  }));

  const subtotal = isBuyNow && buyNowItem ? buyNowItem.lineTotal : (cart.subtotal || 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode || !addressForm.country) { toast.error(t('checkout.fillAddressFields')); return; }
    try {
      const res = await userAPI.addAddress(addressForm);
      const newAddr = res.data.data || res.data;
      setAddresses(prev => [...prev, newAddr]); setSelectedAddress(newAddr.id); setShowAddressForm(false);
      setAddressForm({ label: 'Home', street: '', city: '', state: '', zipCode: '', country: '' });
      toast.success(t('checkout.addressSaved'));
    } catch { toast.error(t('checkout.failedSaveAddress')); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error(t('checkout.selectAddress')); return; }
    if (items.length === 0) { toast.error(t('checkout.noItemsToOrder')); return; }
    setProcessing(true);
    try {
      const res = await orderAPI.place({ addressId: selectedAddress, paymentMethod: paymentMethod === 'stripe' ? 'STRIPE' : 'COD' });
      const order = res.data.data || res.data;
      if (paymentMethod === 'stripe' && order.stripeCheckoutUrl) { window.location.href = order.stripeCheckoutUrl; return; }
      setOrderId(order.id || order.orderNumber); setOrderPlaced(true);
      if (!isBuyNow) clearCart(); sessionStorage.removeItem('buyNow');
      toast.success(t('buyNowModal.orderPlaced'));
    } catch (err) { toast.error(err.response?.data?.message || t('buyNowModal.orderFailed')); }
    setProcessing(false);
  };

  if (orderPlaced) {
    return (
      <div className="page-container">
        <div className="order-success">
          <div className="order-success-icon"><Check size={40} /></div>
          <h1>{t('checkout.orderPlacedTitle')}</h1>
          <p>{t('checkout.orderConfirmedMsg', { id: orderId })}</p>
          <p className="order-success-sub">{paymentMethod === 'cod' ? t('checkout.codMessage') : t('checkout.cardMessage')}</p>
          <div className="order-success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>{t('buyNowModal.viewOrders')}</button>
            <button className="btn btn-secondary" onClick={() => navigate('/products')}>{t('buyNowModal.continueShopping')}</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isBuyNow) { navigate('/cart'); return null; }

  return (
    <div className="page-container">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}><ArrowLeft size={18} /> {t('common.back')}</button>
      <h1 className="page-title">{t('checkout.title')}</h1>

      <div className="checkout-layout">
        <div>
          <div className="checkout-section">
            <h3>{t('checkout.deliveryAddress')}</h3>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map(addr => (
                  <div key={addr.id} className={`address-option ${selectedAddress === addr.id ? 'selected' : ''}`} onClick={() => setSelectedAddress(addr.id)}>
                    <div className="address-option-radio"><div className={`radio-dot ${selectedAddress === addr.id ? 'active' : ''}`} /></div>
                    <div><span className="address-label">{addr.label || t('account.addresses')}</span><p className="address-text">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}</p></div>
                  </div>
                ))}
              </div>
            ) : (<p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{t('checkout.noSavedAddresses')}</p>)}
            {!showAddressForm ? (
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddressForm(true)}>{t('checkout.addNewAddress')}</button>
            ) : (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="form-grid">
                  <div className="form-group"><label>{t('account.label')}</label>
                    <select value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}>
                      <option value="Home">{t('checkout.home')}</option><option value="Work">{t('checkout.work')}</option><option value="Other">{t('checkout.other')}</option>
                    </select>
                  </div>
                  <div className="form-group"><label>{t('account.country')}</label><input value={addressForm.country} onChange={e => setAddressForm({ ...addressForm, country: e.target.value })} /></div>
                  <div className="form-group full"><label>{t('buyNowModal.streetAddress')}</label><input value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} /></div>
                  <div className="form-group"><label>{t('buyNowModal.city')}</label><input value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} /></div>
                  <div className="form-group"><label>{t('buyNowModal.state')}</label><input value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} /></div>
                  <div className="form-group"><label>{t('buyNowModal.zipCode')}</label><input value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveAddress}>{t('checkout.saveAddress')}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>{t('account.cancel')}</button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-section">
            <h3>{t('checkout.paymentMethod')}</h3>
            <div className="payment-options">
              <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                <input type="radio" checked={paymentMethod === 'cod'} readOnly /><Truck size={20} />
                <div><strong>{t('buyNowModal.cod')}</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{t('buyNowModal.codDesc')}</p></div>
              </div>
              <div className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                <input type="radio" checked={paymentMethod === 'stripe'} readOnly /><CreditCard size={20} />
                <div><strong>{t('buyNowModal.payWithCard')} (Stripe)</strong><p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{t('buyNowModal.cardDesc')}</p></div>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3>{t('checkout.orderItems')} ({items.length})</h3>
            <div className="checkout-items">
              {items.map((item, i) => (
                <div key={i} className="checkout-item">
                  <img src={item.imageUrl} alt={item.name} className="checkout-item-img" />
                  <div className="checkout-item-info"><span className="checkout-item-name">{item.name}</span>{item.brand && <span className="checkout-item-brand">{item.brand}</span>}<span className="checkout-item-qty">{t('buyNowModal.qty')}: {item.quantity}</span></div>
                  <span className="checkout-item-price">${item.lineTotal?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="cart-summary">
            <h3>{t('cart.orderSummary')}</h3>
            <div className="summary-row"><span>{t('buyNowModal.subtotal')} ({items.length} {t('cart.items')})</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('buyNowModal.tax')}</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('buyNowModal.shipping')}</span><span>{shipping > 0 ? `$${shipping.toFixed(2)}` : t('buyNowModal.free')}</span></div>
            <div className="summary-total"><span>{t('buyNowModal.total')}</span><span>${total.toFixed(2)}</span></div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handlePlaceOrder} disabled={processing || !selectedAddress}>
              {processing ? t('buyNowModal.processing') : paymentMethod === 'stripe' ? t('checkout.payWithStripe') : t('buyNowModal.placeOrderCod')}
            </button>
            <div className="checkout-trust"><Shield size={14} /><span>{t('checkout.secureData')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}