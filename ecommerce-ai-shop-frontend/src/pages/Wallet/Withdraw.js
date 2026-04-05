import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, CheckCircle, Banknote, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext'; 
import { useWallet } from '../../context/WalletContext';
import './Withdraw.css';

export default function Withdraw() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const { balance, loading: walletLoading, withdrawFunds, refreshBalance } = useWallet();
  
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  // ✅ Refresh balance when withdraw page opens
  useEffect(() => {
    if (refreshBalance) {
      refreshBalance();
    }
  }, []);

  const getCurrencySymbol = () => {
    const map = { de: '€', ja: '¥', fr: '€', es: '€', en: '$' };
    return map[i18n.language] || '₹';
  };

  const formatAmount = (value) => {
    const symbol = getCurrencySymbol();
    const locale = i18n.language === 'de' ? 'de-DE' : 
                   i18n.language === 'ja' ? 'ja-JP' : 
                   i18n.language === 'fr' ? 'fr-FR' :
                   i18n.language === 'es' ? 'es-ES' : 'en-IN';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
    return `${symbol}${formatted}`;
  };

  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && navigate('/wallet');
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [navigate]);

  const parsedAmount = parseFloat(amount) || 0;
  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
  const canWithdraw = parsedAmount >= 50 && account.trim() !== '' && parsedAmount <= safeBalance && !loading && !walletLoading;

  const handleWithdraw = async () => {
    setError('');
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) 
      return setError(t('withdraw.error.invalidAmount'));
    if (!account.trim()) 
      return setError(t('withdraw.error.enterAccount'));
    if (parsedAmount < 50) 
      return setError(t('withdraw.error.minWithdrawal', { min: formatAmount(50) }));
    if (parsedAmount > safeBalance) 
      return setError(t('withdraw.error.insufficientBalance', { balance: formatAmount(safeBalance) }));

    setLoading(true);
    try {
      await withdrawFunds(parsedAmount, account);
      setWithdrawAmount(parsedAmount);
      setSuccess(true);
    } catch (err) {
      setError(err.message || t('withdraw.error.withdrawalFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => navigate('/wallet');

  // ─── SUCCESS STATE ───
  if (success) {
    const newBalance = Math.max(0, safeBalance - withdrawAmount);
    return (
      <div 
        className={`withdraw-modal-overlay ${isDark ? 'dark' : 'light'}`} 
        onClick={handleClose}
      >
        <div 
          className={`withdraw-modal-card ${isDark ? 'dark' : 'light'}`} 
          onClick={e => e.stopPropagation()}
        >
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
              <div className="wd-detail-row">
                <span>{t('withdraw.amountDebited')}</span>
                <strong className={`amount-negative ${isDark ? 'dark' : ''}`}>-{formatAmount(withdrawAmount)}</strong>
              </div>
              <div className="wd-detail-row highlight">
                <span>{t('withdraw.remainingBalance')}</span>
                <strong>{formatAmount(newBalance)}</strong>
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

  // ─── FORM STATE ───
  return (
    <div 
      className={`withdraw-modal-overlay ${isDark ? 'dark' : 'light'}`} 
      onClick={handleClose}
    >
      <div 
        className={`withdraw-modal-card ${isDark ? 'dark' : 'light'}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleClose} className="wd-close-btn" aria-label={t('withdraw.close')}>
          <X size={20} />
        </button>
        <h2 className="wd-modal-title">{t('withdraw.title')}</h2>
        
        {/* Current Balance */}
        <div className={`wd-balance-info ${isDark ? 'dark' : 'light'}`}>
          <span>{t('withdraw.currentBalance')}</span>
          <strong>
            {walletLoading ? 'Loading...' : formatAmount(safeBalance)}
          </strong>
        </div>

        {/* Low balance warning */}
        {!walletLoading && safeBalance < 50 && (
          <div className="wd-low-balance-warning">
            <AlertCircle size={14} />
            <span>Minimum withdrawal is {formatAmount(50)}. Your balance is too low.</span>
          </div>
        )}
        
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
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                min="50" 
                step="0.01"
                max={safeBalance}
                aria-label={t('withdraw.enterAmount')}
                className={isDark ? 'dark' : ''}
                disabled={walletLoading || safeBalance < 50}
              />
            </div>
            
            {/* Quick amount buttons */}
            {safeBalance >= 50 && (
              <div className="wd-quick-amounts">
                {[50, 100, 250, 500].filter(v => v <= safeBalance).map(val => (
                  <button
                    key={val}
                    type="button"
                    className={`wd-quick-btn ${amount === val.toString() ? 'active' : ''}`}
                    onClick={() => { setAmount(val.toString()); setError(''); }}
                  >
                    {getCurrencySymbol()}{val}
                  </button>
                ))}
                {safeBalance >= 100 && (
                  <button
                    type="button"
                    className={`wd-quick-btn ${amount === safeBalance.toString() ? 'active' : ''}`}
                    onClick={() => { setAmount(safeBalance.toFixed(2)); setError(''); }}
                  >
                    Max
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="wd-error" role="alert">
                <AlertCircle size={14} style={{verticalAlign: 'middle', marginRight: 4}} />
                {error}
              </p>
            )}
          </div>

          <div className="wd-form-section">
            <label htmlFor="withdraw-account">{t('withdraw.upiOrBank')}</label>
            <input 
              id="withdraw-account"
              type="text" 
              placeholder={t('withdraw.accountPlaceholder')} 
              value={account} 
              onChange={(e) => { setAccount(e.target.value); setError(''); }}
              className={`wd-account-input ${isDark ? 'dark' : ''}`}
              aria-label={t('withdraw.upiOrBank')}
              disabled={walletLoading || safeBalance < 50}
            />
          </div>

          {parsedAmount >= 50 && parsedAmount <= safeBalance && (
            <div className={`wd-summary ${isDark ? 'dark' : 'light'}`}>
              <div className="wd-sum-row">
                <span>{t('withdraw.processingFee')}</span>
                <strong className="wd-free">{t('withdraw.free')}</strong>
              </div>
              <div className="wd-sum-row total">
                <span>{t('withdraw.youWillReceive')}</span>
                <strong>{formatAmount(parsedAmount)}</strong>
              </div>
              <div className="wd-sum-row">
                <span>Remaining Balance</span>
                <strong>{formatAmount(safeBalance - parsedAmount)}</strong>
              </div>
            </div>
          )}

          <button 
            className={`wd-primary-btn ${isDark ? 'dark' : ''}`}
            onClick={handleWithdraw} 
            disabled={!canWithdraw}
            aria-busy={loading}
          >
            {loading ? (
              <><Loader2 className="wd-spin" size={18} /> {t('withdraw.processing')}</>
            ) : walletLoading ? (
              <><Loader2 className="wd-spin" size={18} /> Loading balance...</>
            ) : safeBalance < 50 ? (
              <><AlertCircle size={18} /> Insufficient balance (min {formatAmount(50)})</>
            ) : (
              <><span>{t('withdraw.withdrawAction')} {parsedAmount > 0 ? formatAmount(parsedAmount) : ''}</span><Banknote size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}