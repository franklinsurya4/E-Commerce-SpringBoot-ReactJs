import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, Clock, 
  CreditCard, DollarSign
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import './WalletPage.css';

export default function WalletPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { balance, getTransactions, refreshBalance, refreshTransactions } = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  // Refresh balance + transactions on mount
  useEffect(() => {
    const load = async () => {
      if (refreshBalance) await refreshBalance();
      if (refreshTransactions) await refreshTransactions();
    };
    load();
  }, []);

  // Sync transactions whenever balance changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(getTransactions(10));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [balance, getTransactions]);

  const handleAddFunds = () => navigate('/wallet/add-funds');
  const handleWithdraw = () => navigate('/wallet/withdraw');
  const handleViewAllTransactions = () => navigate('/wallet/transactions');
  const handleStartShopping = () => navigate('/products');

  const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft size={18} className="icon-deposit" />;
      case 'purchase': return <CreditCard size={18} className="icon-purchase" />;
      case 'withdraw': return <ArrowUpRight size={18} className="icon-withdraw" />;
      case 'refund': return <ArrowDownLeft size={18} className="icon-refund" />;
      default: return <Clock size={18} />;
    }
  };

  const formatTransactionAmount = (amount) => {
    const symbol = i18n.language === 'de' ? '€' : i18n.language === 'ja' ? '¥' : '$';
    const absValue = Math.abs(amount).toFixed(2);
    
    if (amount > 0) {
      return <span className="amount-positive">{symbol}{absValue}</span>;
    } else if (amount < 0) {
      return <span className="amount-negative">{symbol}{absValue}</span>;
    }
    return <span>{symbol}{absValue}</span>;
  };

  const formatBalance = () => {
    const symbol = i18n.language === 'de' ? '€' : i18n.language === 'ja' ? '¥' : '$';
    const locale = i18n.language === 'de' ? 'de-DE' : i18n.language === 'ja' ? 'ja-JP' : 'en-US';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeBalance);
    return `${symbol}${formatted}`;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      completed: { icon: '✓', class: 'status-completed' },
      pending: { icon: '⏳', class: 'status-pending' },
      failed: { icon: '✗', class: 'status-failed' }
    };
    const { icon, class: className } = config[status] || { icon: '•', class: '' };
    return <span className={`tx-status ${className}`}>{icon}</span>;
  };

  if (loading) {
    return (
      <div className={`page wallet-page ${isDark ? 'dark' : 'light'}`}>
        <div className="wallet-skeleton">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-balance" />
          <div className="skeleton skeleton-actions" />
          <div className="skeleton skeleton-list" />
        </div>
      </div>
    );
  }

  return (
    <div className={`page wallet-page ${isDark ? 'dark' : 'light'}`}>
      {/* Page Header */}
      <div className="page-header">
        <Wallet size={26} className="header-icon" />
        <h1>{t('nav.wallet')}</h1>
      </div>

      {/* Balance Card */}
      <div className="wallet-balance-card">
        <div className="balance-header">
          <span className="balance-label">{t('wallet.availableBalance')}</span>
          <span className="wallet-badge">{t('wallet.verified')}</span>
        </div>
        <div className="balance-amount">
          <DollarSign size={28} className="currency-icon" />
          <span data-testid="balance">{formatBalance()}</span>
        </div>
        
        {/* Action Buttons — same style for both */}
        <div className="balance-actions">
          <button 
            type="button"
            className="btn-wallet btn-wallet-add"
            onClick={handleAddFunds}
            aria-label={t('wallet.addFunds')}
          >
            <Plus size={16} /> 
            <span>{t('wallet.addFunds')}</span>
          </button>
          <button 
            type="button"
            className="btn-wallet btn-wallet-withdraw"
            onClick={handleWithdraw}
            aria-label={t('wallet.withdraw')}
            disabled={safeBalance < 50}
          >
            <ArrowUpRight size={16} /> 
            <span>{t('wallet.withdraw')}</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="wallet-history-section">
        <div className="section-header">
          <h2>{t('wallet.transactionHistory')}</h2>
          <button 
            className="btn btn-text" 
            onClick={handleViewAllTransactions}
            aria-label={t('wallet.viewAll')}
          >
            {t('wallet.viewAll')}
          </button>
        </div>
        
        <div className="transactions-list">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="transaction-item" data-testid={`tx-${tx.id}`}>
                <div className={`tx-icon tx-${tx.type}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                
                <div className="tx-details">
                  <p className="tx-description">{tx.description}</p>
                  <p className="tx-date">
                    {new Date(tx.date).toLocaleDateString(i18n.language)}
                    {tx.paymentMethod && <span className="tx-method">• {tx.paymentMethod}</span>}
                    {tx.account && <span className="tx-method">• {tx.account}</span>}
                  </p>
                </div>
                
                <div className="tx-amount-wrapper">
                  <div className={`tx-amount ${tx.amount >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                    {formatTransactionAmount(tx.amount)}
                  </div>
                  <StatusBadge status={tx.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Wallet size={48} className="empty-icon" />
              <p>{t('wallet.noTransactions')}</p>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleStartShopping}
              >
                {t('wallet.startShopping')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}