import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, Clock, 
  CreditCard, DollarSign 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; // Import your theme hook
import './WalletPage.css';

export default function WalletPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme(); // Access theme state
  const [loading, setLoading] = useState(true);
  
  const [walletData, setWalletData] = useState({
    balance: 0,
    currency: 'USD',
    transactions: []
  });

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        await new Promise(res => setTimeout(res, 800));
        setWalletData({
          balance: 142.75,
          currency: 'USD',
          transactions: [
            { id: 1, type: 'deposit', amount: 50.00, date: '2026-04-01', description: 'Top-up via Card', status: 'completed' },
            { id: 2, type: 'purchase', amount: -24.99, date: '2026-03-28', description: 'Order #QP-8821', status: 'completed' },
            { id: 3, type: 'refund', amount: 15.50, date: '2026-03-25', description: 'Refund for Order #QP-7740', status: 'pending' },
          ]
        });
      } catch (err) {
        console.error('Failed to load wallet data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft size={18} />;
      case 'purchase': return <CreditCard size={18} />;
      case 'refund': 
      case 'withdraw': return <ArrowUpRight size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const getAmountColor = (amount) => amount >= 0 ? 'amount-positive' : 'amount-negative';
  
  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✓';
      case 'pending': return '⏳';
      case 'failed': return '✗';
      default: return '•';
    }
  };

  const handleAddFunds = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate('/wallet/add-funds');
  };
  
  const handleWithdraw = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    navigate('/wallet/withdraw');
  };

  if (loading) {
    return (
      <div className="page wallet-page">
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
    <div className={`page wallet-page ${isDark ? 'theme-dark' : 'theme-light'}`}>
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
          <span>{walletData.balance.toFixed(2)}</span>
          <span className="currency-code">{walletData.currency}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="balance-actions">
          <button 
            type="button"
            className="btn-wallet btn-primary"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/wallet/add-funds'); }}
            aria-label={t('wallet.addFunds')}
          >
            <Plus size={16} /> 
            <span>{t('wallet.addFunds')}</span>
          </button>
          <button 
            type="button"
            className="btn-wallet btn-outline"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/wallet/withdraw'); }}
            aria-label={t('wallet.withdraw')}
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
            className="btn-text" 
            onClick={() => navigate('/wallet/transactions')}
            aria-label={t('wallet.viewAll')}
          >
            {t('wallet.viewAll')}
          </button>
        </div>

        <div className="transactions-list" role="list">
          {walletData.transactions.length > 0 ? (
            walletData.transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="transaction-item"
                role="listitem"
                aria-label={`${tx.description}: ${tx.amount >= 0 ? '+' : ''}${tx.amount.toFixed(2)} ${walletData.currency}`}
              >
                <div className={`tx-icon tx-${tx.type}`} aria-hidden="true">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="tx-details">
                  <p className="tx-description">{tx.description}</p>
                  <p className="tx-date">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <div className={`tx-amount ${getAmountColor(tx.amount)}`}>
                  <span>
                    {tx.amount >= 0 ? '+' : ''}{Math.abs(tx.amount).toFixed(2)} {walletData.currency}
                  </span>
                  <span className={`tx-status tx-${tx.status}`} title={tx.status}>
                    {getStatusIcon(tx.status)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Wallet size={48} className="empty-icon" aria-hidden="true" />
              <p>{t('wallet.noTransactions')}</p>
              <button 
                className="btn-primary btn-sm" 
                onClick={() => navigate('/products')}
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