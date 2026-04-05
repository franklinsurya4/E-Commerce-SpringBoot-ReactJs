import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  X, Wallet, CreditCard, Plus, Check,
  AlertCircle, Loader2, Shield, Sparkles, ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';
import './AddFunds.css';

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function AddFundsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { balance, addFunds, loading: walletLoading, refreshBalance } = useWallet();

  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [addedAmount, setAddedAmount] = useState(0);

  // Refresh balance on mount
  useEffect(() => {
    if (refreshBalance) refreshBalance();
  }, []);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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
                   i18n.language === 'es' ? 'es-ES' : 'en-US';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
    return `${symbol}${formatted}`;
  };

  const parsedAmount = parseFloat(amount) || 0;
  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
  const isValidAmount = parsedAmount >= 1 && parsedAmount <= 50000;
  const canSubmit = isValidAmount && !processing && !walletLoading;

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      setAmount(val);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleAddFunds = async () => {
    if (!isValidAmount) {
      toast.error('Please enter a valid amount between $1 and $50,000');
      return;
    }

    setProcessing(true);
    try {
      await addFunds(parsedAmount, 'CARD');
      setAddedAmount(parsedAmount);
      setSuccess(true);
      toast.success(`${formatAmount(parsedAmount)} added to your wallet!`);
    } catch (err) {
      console.error('Add funds error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to add funds.';
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => navigate('/wallet');

  // ─── SUCCESS STATE ───
  if (success) {
    return (
      <div className={`af-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
        <div className={`af-modal-card ${isDark ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
          <button onClick={handleClose} className="af-close-btn" aria-label="Close">
            <X size={20} />
          </button>
          <div className="af-success-content">
            <div className="af-success-icon"><Check size={48} /></div>
            <h3>Funds Added Successfully!</h3>
            <p className="af-success-amount">+{formatAmount(addedAmount)}</p>
            <p className="af-success-msg">Your wallet has been topped up.</p>

            <div className="af-success-details">
              <div className="af-detail-row">
                <span>Amount Added</span>
                <strong className="amount-positive">+{formatAmount(addedAmount)}</strong>
              </div>
              <div className="af-detail-row">
                <span>Payment Method</span>
                <strong>Credit / Debit Card</strong>
              </div>
              <div className="af-detail-row">
                <span>Time</span>
                <strong>{new Date().toLocaleTimeString(i18n.language)}</strong>
              </div>
              <div className="af-detail-row highlight">
                <span>New Balance</span>
                <strong>{formatAmount(safeBalance)}</strong>
              </div>
            </div>

            <div className="af-success-actions">
              <button className="af-primary-btn" onClick={handleClose}>
                <span>Back to Wallet</span><ArrowRight size={18} />
              </button>
              <button className="af-secondary-btn" onClick={() => { setSuccess(false); setAmount(''); }}>
                <Plus size={16} /> Add More Funds
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── FORM STATE ───
  return (
    <div className={`af-modal-overlay ${isDark ? 'dark' : 'light'}`} onClick={handleClose}>
      <div className={`af-modal-card ${isDark ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="af-close-btn" aria-label="Close">
          <X size={20} />
        </button>
        <h2 className="af-modal-title">Add Money to Wallet</h2>

        {/* Current Balance */}
        <div className={`af-balance-info ${isDark ? 'dark' : 'light'}`}>
          <span>Current Balance</span>
          <strong>{walletLoading ? 'Loading...' : formatAmount(safeBalance)}</strong>
        </div>

        <div className="af-modal-form">
          {/* Amount Input */}
          <div className="af-form-section">
            <label htmlFor="add-amount">Enter Amount</label>
            <div className="af-amount-wrap">
              <span className="af-currency">{getCurrencySymbol()}</span>
              <input
                id="add-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                min="1"
                max="50000"
                step="0.01"
                autoFocus
                className={isDark ? 'dark' : ''}
              />
            </div>

            {/* Quick Amounts */}
            <div className="af-quick-amounts">
              {QUICK_AMOUNTS.map(val => (
                <button
                  key={val}
                  type="button"
                  className={`af-quick-btn ${amount === val.toString() ? 'active' : ''}`}
                  onClick={() => handleQuickAmount(val)}
                >
                  {getCurrencySymbol()}{val.toLocaleString()}
                </button>
              ))}
            </div>

            {amount !== '' && !isValidAmount && (
              <p className="af-error">
                <AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Enter an amount between {formatAmount(1)} and {formatAmount(50000)}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="af-form-section">
            <label>Payment Method</label>
            <div className={`af-method-card ${isDark ? 'dark' : 'light'}`}>
              <CreditCard size={20} />
              <div className="af-method-info">
                <span className="af-method-name">Credit / Debit Card</span>
                <span className="af-method-desc">Instant deposit</span>
              </div>
              <div className="af-method-check"><Check size={14} /></div>
            </div>
          </div>

          {/* Preview */}
          {isValidAmount && (
            <div className={`af-summary ${isDark ? 'dark' : 'light'}`}>
              <div className="af-sum-row">
                <span>Deposit Amount</span>
                <strong>{formatAmount(parsedAmount)}</strong>
              </div>
              <div className="af-sum-row">
                <span>Processing Fee</span>
                <strong className="af-free">Free</strong>
              </div>
              <div className="af-sum-row total">
                <span>New Balance</span>
                <strong>{formatAmount(safeBalance + parsedAmount)}</strong>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            className={`af-primary-btn ${isDark ? 'dark' : ''}`}
            onClick={handleAddFunds}
            disabled={!canSubmit}
          >
            {processing ? (
              <><Loader2 className="af-spin" size={18} /> Processing...</>
            ) : walletLoading ? (
              <><Loader2 className="af-spin" size={18} /> Loading...</>
            ) : (
              <><Sparkles size={18} /> <span>{isValidAmount ? `Add ${formatAmount(parsedAmount)} to Wallet` : 'Enter Amount to Continue'}</span></>
            )}
          </button>

          {/* Security */}
          <div className="af-security">
            <Shield size={13} /> <span>Secure payment protected by encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}