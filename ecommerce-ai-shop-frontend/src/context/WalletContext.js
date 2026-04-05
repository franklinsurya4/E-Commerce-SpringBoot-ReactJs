import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletAPI } from '../api/api';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch balance from backend ───
  const refreshBalance = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const apiResponse = await walletAPI.getBalance();
      let bal = 0;
      if (apiResponse?.data?.balance !== undefined) {
        bal = apiResponse.data.balance;
      } else if (apiResponse?.balance !== undefined) {
        bal = apiResponse.balance;
      } else if (typeof apiResponse?.data === 'number') {
        bal = apiResponse.data;
      }
      setBalance(Number(bal) || 0);
    } catch (err) {
      console.warn('Failed to fetch wallet balance:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ─── Fetch transactions from backend ───
  const refreshTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const apiResponse = await walletAPI.getTransactions();
      const txList = apiResponse?.data || apiResponse || [];
      setTransactions(Array.isArray(txList) ? txList : []);
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
    }
  }, [user?.id]);

  // ─── Initial load ───
  useEffect(() => {
    if (user?.id) {
      refreshBalance();
      refreshTransactions();
    } else {
      setBalance(0);
      setTransactions([]);
      setLoading(false);
    }
  }, [user?.id, refreshBalance, refreshTransactions]);

  // ─── Add funds via backend API ───
  const addFunds = useCallback(async (amount, paymentMethod = 'CARD') => {
    if (!user?.id) throw new Error('User not authenticated');
    if (!amount || amount <= 0) throw new Error('Invalid amount');

    try {
      const apiResponse = await walletAPI.addFunds({ amount, paymentMethod });
      const data = apiResponse?.data || apiResponse;

      if (data?.balance !== undefined) {
        setBalance(Number(data.balance) || 0);
      } else if (data?.newBalance !== undefined) {
        setBalance(Number(data.newBalance) || 0);
      } else {
        setBalance(prev => parseFloat((prev + amount).toFixed(2)));
        setTimeout(() => refreshBalance(), 500);
      }

      const tx = {
        id: data?.transactionId || `tx-${Date.now()}`,
        type: 'deposit',
        amount: Math.abs(amount),
        description: `Added $${amount.toFixed(2)} via ${paymentMethod}`,
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod
      };
      setTransactions(prev => [tx, ...prev]);

      return data;
    } catch (err) {
      console.error('Failed to add funds:', err);
      throw err;
    }
  }, [user?.id, refreshBalance]);

  // ─── Withdraw funds via backend API ───
  const withdrawFunds = useCallback(async (amount, account) => {
    if (!user?.id) throw new Error('User not authenticated');
    if (!amount || amount <= 0) throw new Error('Invalid amount');
    if (!account || !account.trim()) throw new Error('Account details required');
    if (amount > balance) throw new Error('Insufficient balance');
    if (amount < 50) throw new Error('Minimum withdrawal is $50');

    try {
      const apiResponse = await walletAPI.withdraw({ amount, account });
      const data = apiResponse?.data || apiResponse;

      // Update balance from server response
      if (data?.balance !== undefined) {
        setBalance(Number(data.balance) || 0);
      } else if (data?.newBalance !== undefined) {
        setBalance(Number(data.newBalance) || 0);
      } else {
        // Optimistic update + server refresh
        setBalance(prev => {
          const newBal = Math.max(0, prev - amount);
          return parseFloat(newBal.toFixed(2));
        });
        setTimeout(() => refreshBalance(), 500);
      }

      // Add withdrawal transaction locally for instant UI
      const tx = {
        id: data?.transactionId || `tx-${Date.now()}`,
        type: 'withdraw',
        amount: -Math.abs(amount),
        description: `Withdrawn $${amount.toFixed(2)} to ${account}`,
        date: new Date().toISOString(),
        status: 'completed',
        account: account
      };
      setTransactions(prev => [tx, ...prev]);

      return data;
    } catch (err) {
      console.error('Failed to withdraw funds:', err);
      // Re-throw with user-friendly message
      const msg = err?.response?.data?.message || err?.message || 'Withdrawal failed';
      throw new Error(msg);
    }
  }, [user?.id, balance, refreshBalance]);

  // ─── Deduct balance (optimistic update after wallet purchase) ───
  const deductBalance = useCallback((amount) => {
    setBalance(prev => {
      const newBal = Math.max(0, prev - amount);
      return parseFloat(newBal.toFixed(2));
    });
    const tx = {
      id: `tx-${Date.now()}`,
      type: 'purchase',
      amount: -Math.abs(amount),
      description: `Wallet payment of $${amount.toFixed(2)}`,
      date: new Date().toISOString(),
      status: 'completed',
      paymentMethod: 'Wallet'
    };
    setTransactions(prev => [tx, ...prev]);
  }, []);

  // ─── Add balance locally only (no API call) ───
  const addBalance = useCallback((amount) => {
    setBalance(prev => parseFloat((prev + amount).toFixed(2)));
  }, []);

  // ─── Get recent N transactions ───
  const getTransactions = useCallback((limit = 10) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  const value = {
    balance,
    currency,
    loading,
    transactions,
    refreshBalance,
    refreshTransactions,
    addFunds,
    withdrawFunds,
    deductBalance,
    addBalance,
    getTransactions
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;