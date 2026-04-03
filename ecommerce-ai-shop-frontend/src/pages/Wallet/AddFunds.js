import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, CheckCircle, CreditCard, Wallet, Shield, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext'; // Adjust path as needed
import './AddFunds.css';

export default function AddFunds() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme(); // Get theme state
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);

  const quickAmounts = [100, 500, 1000, 2000];
  
  const paymentMethods = [
    { id: 'card', labelKey: 'addFunds.paymentCard', icon: CreditCard },
    { id: 'upi', labelKey: 'addFunds.paymentUPI', icon: Wallet },
    { id: 'netbanking', labelKey: 'addFunds.paymentNetBanking', icon: Shield },
  ];

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && navigate('/wallet');
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  // Helper: Format currency based on locale
  const formatCurrency = (value) => {
    const currency = i18n.language === 'de' ? '€' : 
                     i18n.language === 'ja' ? '¥' : '₹';
    return `${currency}${parseFloat(value).toFixed(2)}`;
  };

  const handleAddFunds = async () => {
    setError('');
    const num = parseFloat(amount);
    
    if (!amount || isNaN(num) || num <= 0) 
      return setError(t('addFunds.error.invalidAmount'));
    if (num < 10) 
      return setError(t('addFunds.error.minAmount', { min: formatCurrency(10) }));
    if (!paymentMethod) 
      return setError(t('addFunds.error.selectPayment'));

    setLoading(true);
    try {
      // 🔥 Replace with Razorpay/Stripe API
      await new Promise(res => setTimeout(res, 1500));
      setAddedAmount(num);
      setSuccess(true);
    } catch {
      setError(t('addFunds.error.paymentFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/wallet');

  // ✅ SUCCESS STATE
  if (success) {
    return (
      <div className={`addfunds-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
        <div className="addfunds-modal-card" onClick={e => e.stopPropagation()}>
          <button onClick={handleClose} className="af-close-btn" aria-label={t('addFunds.close')}>
            <X size={20} />
          </button>
          <div className="af-success-content">
            <div className="af-success-icon"><CheckCircle size={48} /></div>
            <h3>{t('addFunds.successTitle', { amount: formatCurrency(addedAmount) })}</h3>
            <p className="af-success-msg">{t('addFunds.successMessage')}</p>
            <div className="af-success-details">
              <div className="af-detail-row">
                <span>{t('addFunds.method')}</span>
                <strong>{t(paymentMethods.find(m => m.id === paymentMethod)?.labelKey)}</strong>
              </div>
              <div className="af-detail-row">
                <span>{t('addFunds.time')}</span>
                <strong>{new Date().toLocaleTimeString(i18n.language)}</strong>
              </div>
            </div>
            <div className="af-success-actions">
              <button className="af-primary-btn" onClick={() => navigate('/products')}>
                <span>{t('addFunds.continueShopping')}</span><ArrowRight size={18} />
              </button>
              <button className="af-secondary-btn" onClick={handleClose}>
                {t('addFunds.viewWalletBalance')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORM STATE
  return (
    <div className={`addfunds-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
      <div className="addfunds-modal-card" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="af-close-btn" aria-label={t('addFunds.close')}>
          <X size={20} />
        </button>
        <h2 className="af-modal-title">{t('addFunds.title')}</h2>
        
        <div className="af-modal-form">
          <div className="af-form-section">
            <label>{t('addFunds.enterAmount')}</label>
            <div className="af-amount-wrap">
              <span className="af-currency">{i18n.language === 'de' ? '€' : i18n.language === 'ja' ? '¥' : '₹'}</span>
              <input 
                type="number" 
                placeholder={t('addFunds.amountPlaceholder')} 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                min="10" 
                step="0.01" 
                aria-label={t('addFunds.enterAmount')}
              />
            </div>
            <div className="af-quick-amounts">
              {quickAmounts.map(v => (
                <button 
                  key={v} 
                  type="button" 
                  onClick={() => setAmount(v.toString())} 
                  className={`af-quick-btn ${amount === v.toString() ? 'selected' : ''}`}
                  aria-label={`${t('addFunds.enterAmount')}: ${v}`}
                >
                  {i18n.language === 'de' ? '€' : i18n.language === 'ja' ? '¥' : '₹'}{v}
                </button>
              ))}
            </div>
            {error && <p className="af-error" role="alert">{error}</p>}
          </div>

          <div className="af-form-section">
            <label>{t('addFunds.paymentMethod')}</label>
            <div className="af-payment-methods">
              {paymentMethods.map(m => {
                const Icon = m.icon;
                return (
                  <button 
                    key={m.id} 
                    type="button" 
                    onClick={() => setPaymentMethod(m.id)} 
                    className={`af-payment-btn ${paymentMethod === m.id ? 'selected' : ''}`}
                    aria-pressed={paymentMethod === m.id}
                  >
                    <Icon size={18} /> 
                    <span>{t(m.labelKey)}</span>
                    {paymentMethod === m.id && <CheckCircle size={16} className="af-check-icon" />}
                  </button>
                );
              })}
            </div>
          </div>

          {amount && parseFloat(amount) >= 10 && (
            <div className="af-summary">
              <div className="af-sum-row">
                <span>{t('addFunds.convenienceFee')}</span>
                <strong className="af-free">{t('addFunds.free')}</strong>
              </div>
              <div className="af-sum-row total">
                <span>{t('addFunds.totalPayable')}</span>
                <strong>{formatCurrency(amount)}</strong>
              </div>
            </div>
          )}

          <button 
            className="af-primary-btn" 
            onClick={handleAddFunds} 
            disabled={loading || !amount || parseFloat(amount) < 10}
            aria-busy={loading}
          >
            {loading ? (
              <><Loader2 className="af-spin" size={18} /> {t('addFunds.processing')}</>
            ) : (
              <><span>{t('addFunds.pay')} {formatCurrency(amount || 0)}</span><ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}