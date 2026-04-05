import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import './TransactionsPage.css';

export default function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { balance, getTransactions } = useWallet();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, deposit, purchase, withdraw, refund

  useEffect(() => {
    // Fetch ALL transactions (no limit)
    const allTxs = getTransactions(); 
    setTransactions(allTxs);
    setLoading(false);
  }, [balance, getTransactions]);

  // Filter transactions
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.type === filter);

  // Format amount (reuse logic from WalletPage or extract to utility)
  const formatAmount = (amount) => {
    const symbol = i18n.language === 'de' ? '€' : i18n.language === 'ja' ? '¥' : '$';
    const absValue = Math.abs(amount).toFixed(2);
    const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
    const className = amount > 0 ? 'amount-positive' : amount < 0 ? 'amount-negative' : '';
    return <span className={className}>{sign}{symbol}{absValue}</span>;
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return <ArrowDownLeft size={18} className="icon-deposit" />;
      case 'purchase': return <CreditCard size={18} className="icon-purchase" />;
      case 'withdraw': return <ArrowUpRight size={18} className="icon-withdraw" />;
      case 'refund': return <ArrowDownLeft size={18} className="icon-refund" />;
      default: return <Clock size={18} />;
    }
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
      <div className={`page transactions-page ${isDark ? 'dark' : 'light'}`}>
        <div className="skeleton-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-item" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`page transactions-page ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <div className="page-header">
        <button 
          className="btn-back" 
          onClick={() => navigate('/wallet')}
          aria-label={t('common.back')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1>{t('wallet.transactionHistory')}</h1>
      </div>

      {/* Filter Tabs */}
      <div className="transaction-filters">
        {['all', 'deposit', 'purchase', 'withdraw', 'refund'].map((type) => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {t(`wallet.filters.${type}`)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="transactions-list">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div key={tx.id} className="transaction-item" data-testid={`tx-${tx.id}`}>
              <div className={`tx-icon tx-${tx.type}`}>
                {getTransactionIcon(tx.type)}
              </div>
              
              <div className="tx-details">
                <p className="tx-description">{tx.description}</p>
                <p className="tx-date">
                  {new Date(tx.date).toLocaleDateString(i18n.language, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                  {tx.paymentMethod && <span className="tx-method"> • {tx.paymentMethod}</span>}
                  {tx.account && <span className="tx-method"> • {tx.account}</span>}
                </p>
              </div>
              
              <div className="tx-amount-wrapper">
                <div className="tx-amount">
                  {formatAmount(tx.amount)}
                </div>
                <StatusBadge status={tx.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Clock size={48} className="empty-icon" />
            <p>{t('wallet.noTransactionsFiltered')}</p>
            <button className="btn btn-primary btn-sm" onClick={() => setFilter('all')}>
              {t('wallet.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}