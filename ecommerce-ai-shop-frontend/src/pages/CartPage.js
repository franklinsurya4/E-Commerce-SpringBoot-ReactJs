import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, X, Truck, CreditCard, Shield, Check, MapPin, Loader, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import '../styles/cart-summary.css';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = cart.items?.find(i => i.id === selectedItemId) || null;

  const fullSubtotal = cart.subtotal || 0;
  const displaySubtotal = selectedItem ? (selectedItem.lineTotal || 0) : fullSubtotal;
  const displayTax = parseFloat((displaySubtotal * 0.08).toFixed(2));
  const displayShipping = displaySubtotal >= 50 ? 0 : 5.99;
  const displayTotal = parseFloat((displaySubtotal + displayTax + displayShipping).toFixed(2));

  const cartTax = parseFloat((fullSubtotal * 0.08).toFixed(2));
  const cartShipping = fullSubtotal >= 50 ? 0 : 5.99;
  const cartTotal = parseFloat((fullSubtotal + cartTax + cartShipping).toFixed(2));

  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderForm, setOrderForm] = useState({ fullName: '', email: '', phone: '', street: '', city: '', state: '', zipCode: '', country: '' });

  useEffect(() => {
    if (showModal && user) setOrderForm(prev => ({ ...prev, fullName: prev.fullName || user.fullName || '', email: prev.email || user.email || '', phone: prev.phone || user.phone || '' }));
  }, [showModal, user]);

  useEffect(() => {
    if (selectedItemId && !cart.items?.find(i => i.id === selectedItemId)) setSelectedItemId(null);
  }, [cart.items, selectedItemId]);

  const handleSelectItem = (itemId) => setSelectedItemId(prev => (prev === itemId ? null : itemId));

  const handlePlaceOrder = async () => {
    const { fullName, email, street, city, state, zipCode, country } = orderForm;
    if (!fullName || !email || !street || !city || !state || !zipCode || !country) { toast.error(t('buyNowModal.fillAllFields')); return; }
    setProcessing(true);
    try {
      const res = await orderAPI.place({ shippingAddress: street, shippingCity: city, shippingState: state, shippingZip: zipCode, shippingCountry: country, paymentMethod: paymentMethod.toUpperCase() });
      const order = res.data.data || res.data;
      if (paymentMethod === 'stripe' && order.stripeCheckoutUrl) { window.location.href = order.stripeCheckoutUrl; return; }
      setOrderSuccess({ orderNumber: order.orderNumber || order.id, trackingNumber: order.trackingNumber, total: cartTotal, itemCount: cart.itemCount });
      clearCart(); setSelectedItemId(null); toast.success(t('buyNowModal.orderPlaced'));
    } catch (err) { toast.error(err?.response?.data?.message || t('buyNowModal.orderFailed')); }
    setProcessing(false);
  };

  const closeModal = () => { setShowModal(false); setOrderSuccess(null); setProcessing(false); if (orderSuccess) navigate('/orders'); };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (!cart.items?.length && !showModal) {
    return (
      <div className="page-container">
        <div className="cart-empty">
          <ShoppingBag size={56} color="var(--text-muted)" />
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.emptyDesc')}</p>
          <Link to="/products" className="btn btn-primary">{t('cart.browseProducts')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">{t('cart.title')} ({cart.itemCount} {t('cart.items')})</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className={`cart-item ${selectedItemId === item.id ? 'cart-item-selected' : ''}`} onClick={() => handleSelectItem(item.id)}>
              <img src={item.product?.imageUrl} alt={item.product?.name} className="cart-item-img" />
              <div className="cart-item-info">
                <Link to={`/products/${item.product?.id}`} className="cart-item-name" style={{ color: 'var(--text-primary)' }} onClick={e => e.stopPropagation()}>{item.product?.name}</Link>
                <p className="cart-item-meta">
                  {item.product?.brand}
                  {item.selectedSize && ` • ${t('cart.size')}: ${item.selectedSize}`}
                  {item.selectedColor && ` • ${t('cart.color')}: ${item.selectedColor}`}
                </p>
                <div className="cart-item-bottom">
                  <div className="cart-qty">
                    <button onClick={e => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={e => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }}><Plus size={14} /></button>
                  </div>
                  <span className="cart-item-price">${item.lineTotal?.toFixed(2)}</span>
                </div>
                <button className="cart-remove" onClick={e => { e.stopPropagation(); removeItem(item.id); }}>
                  <Trash2 size={14} style={{ marginRight: 4 }} /> {t('cart.remove')}
                </button>
              </div>
              <ChevronRight size={16} className="cart-item-chevron" />
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>{t('cart.orderSummary')}</h3>
          {selectedItem && (
            <div className="summary-viewing-label">
              {t('cart.viewing')}: <strong>{selectedItem.product?.name}</strong>
              <button className="summary-view-all" onClick={() => setSelectedItemId(null)}>{t('cart.viewAllItems')}</button>
            </div>
          )}
          {selectedItem && (
            <div className="summary-selected-product">
              <img src={selectedItem.product?.imageUrl} alt={selectedItem.product?.name} className="summary-product-img" />
              <div className="summary-product-details">
                <span className="summary-product-name">{selectedItem.product?.name}</span>
                {selectedItem.product?.brand && <span className="summary-product-brand">{selectedItem.product.brand}</span>}
                <div className="summary-product-pricing">
                  <span className="summary-product-qty">{t('buyNowModal.qty')}: {selectedItem.quantity}</span>
                  <span className="summary-product-unit">× ${selectedItem.product?.price?.toFixed(2)}</span>
                </div>
                <span className="summary-product-line-total">${selectedItem.lineTotal?.toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="summary-items-list">
            {cart.items.map(item => (
              <div key={item.id} className={`summary-item-row ${selectedItemId === item.id ? 'summary-item-active' : ''}`} onClick={() => handleSelectItem(item.id)}>
                <span className="summary-item-name">{item.product?.name}<span className="summary-item-qty"> ×{item.quantity}</span></span>
                <span className="summary-item-price">${item.lineTotal?.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-row"><span>{selectedItem ? t('cart.itemSubtotal') : t('cart.subtotal')}</span><span>${displaySubtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>{t('buyNowModal.tax')}</span><span>${displayTax.toFixed(2)}</span></div>
          <div className="summary-row"><span>{t('cart.shipping')}</span><span>{displayShipping > 0 ? `$${displayShipping.toFixed(2)}` : t('buyNowModal.free')}</span></div>
          <div className="summary-total"><span>{selectedItem ? t('cart.itemTotal') : t('cart.total')}</span><span>${displayTotal.toFixed(2)}</span></div>
          {selectedItem && (
            <div className="summary-full-cart-note">{t('cart.fullCartTotal')}: <strong>${cartTotal.toFixed(2)}</strong> ({cart.itemCount} {t('cart.items')})</div>
          )}
          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowModal(true)}>{t('cart.proceedToCheckout')}</button>
          {!selectedItem && displayShipping > 0 && fullSubtotal > 0 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              {t('cart.addMoreForFree', { amount: (50 - fullSubtotal).toFixed(2) })}
            </p>
          )}
        </div>
      </div>

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
                <p className="modal-success-sub">{paymentMethod === 'cod' ? t('buyNowModal.payOnDelivery') : t('buyNowModal.paymentProcessed')}</p>
                <div className="modal-success-summary">
                  <ShoppingBag size={28} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div><span>{t('cart.itemsOrdered', { count: orderSuccess.itemCount })}</span><span className="modal-success-total">${orderSuccess.total?.toFixed(2)}</span></div>
                </div>
                <div className="modal-success-actions">
                  <button className="btn btn-primary btn-full" onClick={() => { closeModal(); navigate('/orders'); }}>{t('buyNowModal.viewOrders')}</button>
                  <button className="btn btn-ghost btn-full" onClick={() => { closeModal(); navigate('/products'); }}>{t('buyNowModal.continueShopping')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-header"><h2>{t('checkout.title')}</h2><p>{cart.itemCount} {t('cart.items')} — ${fullSubtotal.toFixed(2)}</p></div>
                <div className="modal-cart-items">
                  {cart.items.slice(0, 3).map(item => (
                    <div key={item.id} className="modal-cart-item">
                      <img src={item.product?.imageUrl} alt={item.product?.name} />
                      <div><span className="modal-product-name">{item.product?.name}</span><span className="modal-product-brand">{t('buyNowModal.qty')}: {item.quantity} × ${item.product?.price?.toFixed(2)}</span></div>
                      <strong>${item.lineTotal?.toFixed(2)}</strong>
                    </div>
                  ))}
                  {cart.items.length > 3 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>{t('cart.moreItems', { count: cart.items.length - 3 })}</p>}
                </div>
                <div className="modal-section">
                  <h4><span className="modal-step">1</span> {t('buyNowModal.contactDetails')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field"><label>{t('buyNowModal.fullName')} *</label><input value={orderForm.fullName} onChange={e => setOrderForm({...orderForm, fullName: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.email')} *</label><input value={orderForm.email} onChange={e => setOrderForm({...orderForm, email: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.phone')}</label><input value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} /></div>
                  </div>
                </div>
                <div className="modal-section">
                  <h4><MapPin size={14} /> <span className="modal-step">2</span> {t('buyNowModal.shippingAddress')}</h4>
                  <div className="modal-form-grid">
                    <div className="modal-field full"><label>{t('buyNowModal.streetAddress')} *</label><input value={orderForm.street} onChange={e => setOrderForm({...orderForm, street: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.city')} *</label><input value={orderForm.city} onChange={e => setOrderForm({...orderForm, city: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.state')} *</label><input value={orderForm.state} onChange={e => setOrderForm({...orderForm, state: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.zipCode')} *</label><input value={orderForm.zipCode} onChange={e => setOrderForm({...orderForm, zipCode: e.target.value})} /></div>
                    <div className="modal-field"><label>{t('buyNowModal.country')} *</label><input value={orderForm.country} onChange={e => setOrderForm({...orderForm, country: e.target.value})} /></div>
                  </div>
                </div>
                <div className="modal-section">
                  <h4><span className="modal-step">3</span> {t('buyNowModal.payment')}</h4>
                  <div className="modal-payment-options">
                    <div className={`modal-payment ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <div className={`modal-radio ${paymentMethod === 'cod' ? 'checked' : ''}`} /><Truck size={18} /><div><strong>{t('buyNowModal.cod')}</strong><span>{t('buyNowModal.codDesc')}</span></div>
                    </div>
                    <div className={`modal-payment ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}>
                      <div className={`modal-radio ${paymentMethod === 'stripe' ? 'checked' : ''}`} /><CreditCard size={18} /><div><strong>{t('buyNowModal.payWithCard')}</strong><span>{t('buyNowModal.cardDesc')}</span></div>
                    </div>
                  </div>
                </div>
                <div className="modal-totals">
                  <div className="modal-total-row"><span>{t('buyNowModal.subtotal')} ({cart.itemCount} {t('cart.items')})</span><span>${fullSubtotal.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.tax')}</span><span>${cartTax.toFixed(2)}</span></div>
                  <div className="modal-total-row"><span>{t('buyNowModal.shipping')}</span><span>{cartShipping > 0 ? `$${cartShipping.toFixed(2)}` : t('buyNowModal.free')}</span></div>
                  <div className="modal-total-row total"><span>{t('buyNowModal.total')}</span><span>${cartTotal.toFixed(2)}</span></div>
                </div>
                <button className="btn btn-primary btn-full btn-lg modal-order-btn" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (<><Loader size={18} className="spin" /> {t('buyNowModal.processing')}</>) : paymentMethod === 'stripe' ? (<><CreditCard size={18} /> {t('buyNowModal.pay')} ${cartTotal.toFixed(2)}</>) : (<><Truck size={18} /> {t('buyNowModal.placeOrderCod')}</>)}
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