import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, CheckCircle, Banknote, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext'; // ✅ Adjust path as needed
import './Withdraw.css';

export default function Withdraw() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme(); // Get theme state
  
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  // Helper: Get currency symbol based on language
  const getCurrencySymbol = () => {
    const map = { de: '€', ja: '¥', fr: '€', es: '€', en: '₹' };
    return map[i18n.language] || '₹';
  };

  // Helper: Format amount with locale
  const formatAmount = (value) => {
    const symbol = getCurrencySymbol();
    const locale = i18n.language === 'de' ? 'de-DE' : 
                   i18n.language === 'ja' ? 'ja-JP' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' : 'en-IN';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    return `${symbol}${formatted}`;
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && navigate('/wallet');
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const handleWithdraw = async () => {
    setError('');
    const num = parseFloat(amount);
    
    // Validation with translated errors
    if (!amount || isNaN(num) || num <= 0) 
      return setError(t('withdraw.error.invalidAmount'));
    if (!account.trim()) 
      return setError(t('withdraw.error.enterAccount'));
    if (num < 50) 
      return setError(t('withdraw.error.minWithdrawal', { min: formatAmount(50) }));

    setLoading(true);
    try {
      // Replace with backend API
      await new Promise(res => setTimeout(res, 1500));
      setWithdrawAmount(num);
      setSuccess(true);
    } catch {
      setError(t('withdraw.error.withdrawalFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/wallet');

  // SUCCESS STATE
  if (success) {
    return (
      <div className={`withdraw-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
        <div className="withdraw-modal-card" onClick={e => e.stopPropagation()}>
          <button onClick={handleClose} className="wd-close-btn" aria-label={t('withdraw.close')}>
            <X size={20} />
          </button>
          <div className="wd-success-content">
            <div className="wd-success-icon"><CheckCircle size={48} /></div>
            <h3>{t('withdraw.successTitle', { amount: formatAmount(withdrawAmount) })}</h3>
            <p className="wd-success-msg">{t('withdraw.successMessage')}</p>
            <div className="wd-success-details">
              <div className="wd-detail-row">
                <span>{t('withdraw.account')}</span>
                <strong>{account}</strong>
              </div>
              <div className="wd-detail-row">
                <span>{t('withdraw.time')}</span>
                <strong>{new Date().toLocaleTimeString(i18n.language)}</strong>
              </div>
            </div>
            <div className="wd-success-actions">
              <button className="wd-primary-btn" onClick={handleClose}>
                <span>{t('withdraw.backToWallet')}</span><ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM STATE
  return (
    <div className={`withdraw-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
      <div className="withdraw-modal-card" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="wd-close-btn" aria-label={t('withdraw.close')}>
          <X size={20} />
        </button>
        <h2 className="wd-modal-title">{t('withdraw.title')}</h2>
        
        <div className="wd-modal-form">
          <div className="wd-form-section">
            <label htmlFor="withdraw-amount">{t('withdraw.enterAmount')}</label>
            <div className="wd-amount-wrap">
              <span className="wd-currency">{getCurrencySymbol()}</span>
              <input 
                id="withdraw-amount"
                type="number" 
                placeholder={t('withdraw.amountPlaceholder')} 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                min="50" 
                step="0.01"
                aria-label={t('withdraw.enterAmount')}
              />
            </div>
            {error && <p className="wd-error" role="alert">{error}</p>}
          </div>

          <div className="wd-form-section">
            <label htmlFor="withdraw-account">{t('withdraw.upiOrBank')}</label>
            <input 
              id="withdraw-account"
              type="text" 
              placeholder={t('withdraw.accountPlaceholder')} 
              value={account} 
              onChange={(e) => setAccount(e.target.value)} 
              className="wd-account-input"
              aria-label={t('withdraw.upiOrBank')}
            />
          </div>

          {amount && parseFloat(amount) >= 50 && (
            <div className="wd-summary">
              <div className="wd-sum-row">
                <span>{t('withdraw.processingFee')}</span>
                <strong className="wd-free">{t('withdraw.free')}</strong>
              </div>
              <div className="wd-sum-row total">
                <span>{t('withdraw.youWillReceive')}</span>
                <strong>{formatAmount(amount)}</strong>
              </div>
            </div>
          )}

          <button 
            className="wd-primary-btn" 
            onClick={handleWithdraw} 
            disabled={loading || !amount || parseFloat(amount) < 50 || !account}
            aria-busy={loading}
          >
            {loading ? (
              <><Loader2 className="wd-spin" size={18} /> {t('withdraw.processing')}</>
            ) : (
              <><span>{t('withdraw.withdrawAction')} {formatAmount(amount || 0)}</span><Banknote size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}