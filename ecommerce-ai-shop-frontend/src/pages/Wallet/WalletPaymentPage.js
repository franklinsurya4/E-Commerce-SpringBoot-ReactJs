import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowLeft, 
  AlertCircle, 
  ShoppingBag, 
  Shield, 
  Loader,
  MapPin,
  Package,
  Truck,
  Receipt,
  ChevronRight,
  Sparkles,
  CircleCheck,
  Building2,
  Lock,
  BadgeCheck,
  Store,
  Tag,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWallet } from '../../context/WalletContext';
import { orderAPI } from '../../api/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './WalletPayment.css';

const formatCurrency = (value) => {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDate = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(now);
};

export default function WalletPaymentPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();

  // ✅ Use WalletContext instead of direct API call — stays in sync with WalletPage
  const { balance, loading: walletLoading, refreshBalance } = useWallet();

  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [newBalance, setNewBalance] = useState(null); // Store post-payment balance for success screen

  // Refresh wallet balance on mount to ensure it's current
  useEffect(() => {
    if (user?.id && refreshBalance) {
      refreshBalance();
    }
  }, [user?.id]);

  useEffect(() => {
    const stored = sessionStorage.getItem('walletPayment');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.items || !parsed.total || !parsed.shippingAddress) {
          throw new Error('Invalid data structure');
        }
        setOrderData(parsed);
        
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 5);
        setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }));
      } catch (e) {
        console.error('Failed to parse wallet payment data:', e);
        toast.error(t('wallet.invalidPaymentData') || 'Invalid payment data');
        navigate('/products');
      }
    } else {
      toast.error(t('wallet.noPaymentData') || 'No payment data found');
      navigate('/products');
    }
  }, [navigate, t]);

  if (!orderData) {
    return (
      <div className="premium-payment-page">
        <div className="premium-loader">
          <div className="premium-loader-ring">
            <div></div><div></div><div></div><div></div>
          </div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  const { items, subtotal, tax, shipping, total, shippingAddress, isFromCart, contact } = orderData;

  // ✅ Use balance from WalletContext (same source as WalletPage)
  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
  const hasSufficientBalance = safeBalance >= total - 0.01;
  const remainingBalance = Math.max(0, safeBalance - total);
  const insufficientAmount = total - safeBalance;

  const handleConfirmPayment = async () => {
    if (!hasSufficientBalance) {
      toast.error(t('wallet.insufficientBalance', {
        current: formatCurrency(safeBalance),
        required: formatCurrency(total)
      }));
      return;
    }

    setProcessing(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          lineTotal: item.lineTotal,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        shippingAddress: shippingAddress.street,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZip: shippingAddress.zipCode,
        shippingCountry: shippingAddress.country,
        paymentMethod: 'WALLET',
        subtotal,
        tax,
        shipping,
        total,
        contact: contact || {}
      };

      // Place order — backend deducts wallet balance in OrderService
      const res = await orderAPI.place(orderPayload);
      const order = res.data?.data || res.data;

      // ✅ Save remaining balance for success screen before refreshing
      const calculatedRemaining = Math.max(0, safeBalance - total);
      setNewBalance(calculatedRemaining);

      // ✅ Refresh balance from server so WalletPage and everywhere else shows updated balance
      if (refreshBalance) {
        await refreshBalance();
      }

      setOrderResult({
        orderNumber: order.orderNumber || order.id,
        trackingNumber: order.trackingNumber,
        total: total,
        itemCount: items.length,
        orderDate: formatDate(),
        estimatedDelivery
      });
      setOrderPlaced(true);

      if (isFromCart) {
        clearCart();
      }
      
      sessionStorage.removeItem('walletPayment');
      toast.success(t('wallet.orderPlaced') || 'Order placed successfully!');

    } catch (err) {
      console.error('Wallet payment error:', err);
      const msg = err?.response?.data?.message || t('wallet.orderFailed') || 'Order failed. Please try again.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  // ─── Success View ───
  if (orderPlaced && orderResult) {
    // Use the live balance from context (already refreshed), or the calculated one as fallback
    const displayRemainingBalance = newBalance !== null ? newBalance : balance;

    return (
      <div className="premium-payment-page success">
        <div className="premium-container">
          <div className="success-card">
            <div className="success-animation">
              <div className="success-circle">
                <CircleCheck size={56} strokeWidth={1.5} />
              </div>
              <div className="success-particles">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            
            <h1 className="success-title">Payment Successful!</h1>
            <p className="success-message">
              Your order has been confirmed and a confirmation email has been sent.
            </p>
            
            <div className="order-summary-card">
              <div className="order-summary-header">
                <Receipt size={18} />
                <span>Order Summary</span>
              </div>
              
              <div className="order-summary-details">
                <div className="detail-row">
                  <span className="detail-label">Order Number</span>
                  <span className="detail-value highlight">#{orderResult.orderNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Date</span>
                  <span className="detail-value">{orderResult.orderDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estimated Delivery</span>
                  <span className="detail-value">{orderResult.estimatedDelivery}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">
                    <span className="payment-badge">
                      <Wallet size={12} />
                      Wallet Balance
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Deducted</span>
                  <span className="detail-value" style={{ color: '#ef4444', fontWeight: 600 }}>
                    -${formatCurrency(orderResult.total)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Remaining Wallet Balance</span>
                  <span className="detail-value" style={{ color: '#22c55e', fontWeight: 700 }}>
                    ${formatCurrency(displayRemainingBalance)}
                  </span>
                </div>
              </div>
              
              <div className="order-summary-divider" />
              
              <div className="order-summary-total">
                <span>Total Paid</span>
                <strong>${formatCurrency(orderResult.total)}</strong>
              </div>
            </div>
            
            <div className="action-buttons">
              <button className="btn-primary" onClick={() => navigate('/orders')}>
                View My Orders
                <ChevronRight size={16} />
              </button>
              <button className="btn-secondary" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Payment View ───
  return (
    <div className="premium-payment-page">
      <div className="premium-container">
        
        {/* Navigation */}
        <div className="premium-nav">
          <button className="nav-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div className="nav-steps">
            <div className="step active">
              <div className="step-number">1</div>
              <span>Review</span>
            </div>
            <div className="step-line" />
            <div className="step">
              <div className="step-number">2</div>
              <span>Payment</span>
            </div>
            <div className="step-line" />
            <div className="step">
              <div className="step-number">3</div>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="premium-header">
          <div className="header-badge">
            <ShoppingBag size={16} />
            <span>Secure Checkout</span>
          </div>
          <h1 className="premium-title">Complete Your Purchase</h1>
          <p className="premium-subtitle">Review your order and confirm payment</p>
        </div>

        {/* Main Content Grid */}
        <div className="premium-grid">
          
          {/* Left Column */}
          <div className="grid-left">
            
            {/* Wallet Card — uses WalletContext balance */}
            <div className={`wallet-premium-card ${!hasSufficientBalance ? 'warning' : ''}`}>
              <div className="card-gradient-bg" />
              <div className="wallet-card-content">
                <div className="wallet-icon-wrapper">
                  <Wallet size={28} />
                </div>
                <div className="wallet-info">
                  <p className="wallet-label">Available Balance</p>
                  {walletLoading ? (
                    <div className="balance-skeleton" />
                  ) : (
                    <p className={`wallet-amount ${hasSufficientBalance ? 'sufficient' : 'insufficient'}`}>
                      ${formatCurrency(safeBalance)}
                    </p>
                  )}
                </div>
                {hasSufficientBalance && !walletLoading && (
                  <div className="balance-status">
                    <BadgeCheck size={14} />
                    <span>Sufficient Balance</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="premium-card">
              <div className="card-header">
                <Package size={18} />
                <h3>Order Items ({items?.length || 0})</h3>
              </div>
              <div className="items-list">
                {items?.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <Store size={24} />
                      )}
                    </div>
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      {item.brand && <p className="item-brand">{item.brand}</p>}
                      <div className="item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>× ${formatCurrency(item.price)}</span>
                      </div>
                    </div>
                    <div className="item-price">
                      ${formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="premium-card">
              <div className="card-header">
                <MapPin size={18} />
                <h3>Shipping Address</h3>
              </div>
              <div className="address-content">
                <div className="address-icon">
                  <Building2 size={20} />
                </div>
                <div className="address-details">
                  <p className="address-name">{shippingAddress.fullName || contact?.name || 'Customer'}</p>
                  <p className="address-line">{shippingAddress.street}</p>
                  <p className="address-line">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                  </p>
                  <p className="address-line">{shippingAddress.country}</p>
                  {contact?.phone && (
                    <p className="address-phone">📞 {contact.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="grid-right">
            
            {/* Price Breakdown with Buy Now Button */}
            <div className="price-card">
              <div className="price-header">
                <Tag size={18} />
                <h3>Price Breakdown</h3>
              </div>
              
              <div className="price-details">
                <div className="price-row">
                  <span>Subtotal</span>
                  <span>${formatCurrency(subtotal)}</span>
                </div>
                <div className="price-row">
                  <span>Tax (8%)</span>
                  <span>${formatCurrency(tax)}</span>
                </div>
                <div className="price-row">
                  <span>Shipping</span>
                  <span>{shipping > 0 ? `$${formatCurrency(shipping)}` : 'Free'}</span>
                </div>
                
                <div className="price-divider" />
                
                <div className="price-row total">
                  <strong>Total Amount</strong>
                  <strong className="total-value">${formatCurrency(total)}</strong>
                </div>
                
                <div className="price-divider dashed" />
                
                {!walletLoading && (
                  <div className="payment-flow">
                    <div className="flow-row">
                      <div className="flow-label">
                        <Wallet size={14} />
                        <span>Wallet Balance</span>
                      </div>
                      <span>${formatCurrency(safeBalance)}</span>
                    </div>
                    <div className="flow-arrow">
                      <TrendingUp size={14} />
                    </div>
                    <div className="flow-row deduction">
                      <div className="flow-label">
                        <span>Amount to Deduct</span>
                      </div>
                      <span className="deduction-amount">-${formatCurrency(total)}</span>
                    </div>
                    <div className="flow-arrow">
                      <ChevronRight size={14} />
                    </div>
                    <div className={`flow-row remaining ${hasSufficientBalance ? 'positive' : 'negative'}`}>
                      <div className="flow-label">
                        <span>Remaining Balance</span>
                      </div>
                      <span>${formatCurrency(remainingBalance)}</span>
                    </div>
                  </div>
                )}

                {/* Insufficient Balance Alert */}
                {!walletLoading && !hasSufficientBalance && (
                  <div className="price-alert-inline">
                    <AlertCircle size={16} />
                    <span>
                      You need <strong>${formatCurrency(insufficientAmount)}</strong> more.{' '}
                      <button className="inline-link" onClick={() => navigate('/wallet/add-funds')}>
                        Add Funds
                      </button>
                    </span>
                  </div>
                )}

                {/* Buy Now Button */}
                <button
                  className={`buy-now-button ${!hasSufficientBalance ? 'disabled' : ''} ${processing ? 'processing' : ''}`}
                  onClick={handleConfirmPayment}
                  disabled={processing || walletLoading || !hasSufficientBalance}
                >
                  {processing ? (
                    <>
                      <Loader size={20} className="spinning" />
                      <span>Processing Payment...</span>
                    </>
                  ) : walletLoading ? (
                    <>
                      <Loader size={20} className="spinning" />
                      <span>Verifying Balance...</span>
                    </>
                  ) : !hasSufficientBalance ? (
                    <>
                      <AlertCircle size={20} />
                      <span>Insufficient Balance</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      <span>Buy Now — ${formatCurrency(total)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="info-card">
              <Truck size={16} />
              <div className="info-content">
                <strong>Estimated Delivery</strong>
                <span>{estimatedDelivery}</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="security-card">
              <Lock size={14} />
              <span>Secure payment protected by encryption</span>
              <Shield size={14} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}