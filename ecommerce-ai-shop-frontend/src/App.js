import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WalletProvider, useWallet } from './context/WalletContext'; 
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/Wishlistcontext'; 

// Components
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWidget from './components/Chat/ChatWidget';
import ErrorBoundary from './components/ErrorBoundary'; 

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TrackingPage from './pages/TrackingPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Notificationspage from './pages/Notificationspage';
import Offerspage from './pages/Offerspage';
import PriceDropProductPage from './pages/PriceDropProductPage'; 
import WhishList from './pages/WhishList';
import WalletPage from './pages/Wallet/WalletPage';
import AddFundsPage from './pages/Wallet/AddFunds';
import WithdrawPage from './pages/Wallet/Withdraw';
import TransactionsPage from './pages/Wallet/TransactionsPage';
import WalletPaymentPage from './pages/Wallet/WalletPaymentPage';

// API & Utils
import { userAPI } from './api/api';
import toast from 'react-hot-toast';

// Utility: Convert URL-safe base64 to ArrayBuffer
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Push Notification Hook — ✅ FIXED: Graceful 404 handling
function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [pushSupported, setPushSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setPushSupported(supported);
    if (supported && Notification.permission !== 'default') {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.id && pushSupported) {
      loadSubscription();
    }
  }, [isAuthenticated, user?.id, pushSupported]);

  // ✅ FIXED: Load subscription with graceful error handling
  const loadSubscription = async () => {
    try {
      // Defensive: Check if API method exists
      if (typeof userAPI?.getPushSubscription !== 'function') {
        console.debug('ℹ️ Push subscription API not implemented yet');
        return;
      }

      const res = await userAPI.getPushSubscription();
      
      // Handle different response structures safely
      let subscriptionData = null;
      if (res?.data?.data?.subscription) {
        subscriptionData = res.data.data.subscription;
      } else if (Array.isArray(res?.data?.data) && res.data.data.length > 0) {
        // If endpoint returns array, take first active subscription
        subscriptionData = res.data.data.find(s => s?.active) || res.data.data[0];
      } else if (res?.data?.subscription) {
        subscriptionData = res.data.subscription;
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData);
        console.debug('✅ Push subscription loaded');
      }
    } catch (err) {
      // ✅ Handle 404 gracefully: user just hasn't subscribed yet (NORMAL)
      if (err?.response?.status === 404) {
        console.debug('ℹ️ No push subscription found (user not subscribed yet)');
        return; // Don't show error — this is expected behavior
      }
      
      // Handle auth errors silently
      if (err?.response?.status === 401) {
        console.debug('⚠️ Push request unauthorized (token may be invalid)');
      } else if (err?.response?.status === 403) {
        console.debug('⚠️ Push request forbidden (check user roles)');
      } else if (err?.code === 'ERR_NETWORK') {
        console.debug('⚠️ Network error connecting to push API');
      } else {
        // Log other errors at debug level to avoid console spam
        console.debug('Push subscription load skipped:', err?.message || err);
      }
    }
  };

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('✅ Service Worker registered:', registration.scope);
      return registration;
    } catch (err) {
      console.error('❌ Service Worker registration failed:', err);
      throw err;
    }
  }, []);

  const subscribeUserToPush = useCallback(async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser');
      return null;
    }
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== 'granted') {
        if (permission === 'denied') {
          toast.error('Notifications blocked. Enable in browser settings.');
        }
        return null;
      }
      const registration = await registerServiceWorker();
      const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID_PUBLIC_KEY not configured in .env');
      }
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      const subscriptionData = JSON.parse(JSON.stringify(pushSubscription));
      
      // Defensive: Check if save method exists
      if (typeof userAPI?.savePushSubscription !== 'function') {
        throw new Error('savePushSubscription API not implemented');
      }
      
      await userAPI.savePushSubscription({
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
        userAgent: navigator.userAgent
      });
      setSubscription(subscriptionData);
      toast.success('Push notifications enabled!');
      return subscriptionData;
    } catch (err) {
      console.error('❌ Push subscription failed:', err);
      toast.error('Failed to enable notifications');
      return null;
    }
  }, [pushSupported, registerServiceWorker]);

  const unsubscribeUser = useCallback(async () => {
    if (!subscription) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }
      // Defensive: Check if delete method exists
      if (typeof userAPI?.deletePushSubscription === 'function') {
        await userAPI.deletePushSubscription();
      }
      setSubscription(null);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('❌ Unsubscribe failed:', err);
      toast.error('Failed to disable notifications');
    }
  }, [subscription]);

  // ✅ Handle foreground push messages
  useEffect(() => {
    if (!pushSupported || !isAuthenticated) return;
    
    const handleMessage = (event) => {
      try {
        const data = event.data?.json?.() || event.data;
        console.debug('🔔 Push message received:', data);
        if (data?.title || data?.body) {
          toast.custom((t) => (
            <div className={`push-toast ${t.visible ? 'enter' : 'exit'}`}>
              <strong>{data.title}</strong>
              {data.body && <p>{data.body}</p>}
              {data.url && (
                <a href={data.url} className="toast-action" target="_blank" rel="noopener noreferrer">
                  {data.actionText || 'View'}
                </a>
              )}
            </div>
          ), { duration: 5000 });
        }
      } catch (err) {
        console.error('❌ Error handling push message:', err);
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [pushSupported, isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optionally keep subscription for re-login
    };
  }, [isAuthenticated, subscription]);

  return {
    pushSupported,
    permission,
    subscription,
    subscribeUserToPush,
    unsubscribeUser,
    refreshPermission: () => setPermission(Notification.permission)
  };
}

// Main App Content
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fixed: Added 'subscription' to destructuring
  const { 
    pushSupported, 
    permission, 
    subscription, 
    subscribeUserToPush, 
    refreshPermission 
  } = usePushNotifications();

  // Log push permission state for debugging
  useEffect(() => {
    if (isAuthenticated && permission === 'default' && pushSupported) {
      console.debug('ℹ️ Push permission not set - banner will prompt user');
    }
  }, [isAuthenticated, permission, pushSupported]);

  // Refresh permission when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pushSupported) {
        refreshPermission();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pushSupported, refreshPermission]);

  return (
    <div className="app-layout">
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          pushPermission={permission}
          onEnablePush={subscribeUserToPush}
        />
      )}
      <div className="main-content" style={!isAuthenticated ? { marginLeft: 0 } : undefined}>
        <Navbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pushStatus={{ 
            supported: pushSupported, 
            permission, 
            subscribed: !!subscription 
          }}
        />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/price-drop/:id" element={
              <ProtectedRoute><PriceDropProductPage /></ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={
              <ProtectedRoute><CartPage /></ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute><CheckoutPage /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><OrdersPage /></ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
            } />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/account" element={
              <ProtectedRoute><AccountPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage 
                  pushProps={{ 
                    supported: pushSupported, 
                    permission, 
                    onEnable: subscribeUserToPush 
                  }} 
                />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={<WhishList />} />
            <Route path="/notifications" element={
              <ProtectedRoute><Notificationspage /></ProtectedRoute>
            } />
            <Route path="/offers" element={<Offerspage />} />
            
            {/* 🔹 Wallet Routes */}
            <Route path="/wallet" element={
              <ProtectedRoute><WalletPage /></ProtectedRoute>
            } />
            <Route path="/wallet/transactions" element={
              <ProtectedRoute><TransactionsPage /></ProtectedRoute>
            } />
            <Route path="/wallet/add-funds" element={
              <ProtectedRoute><AddFundsPage /></ProtectedRoute>
            } />
            <Route path="/wallet/withdraw" element={
              <ProtectedRoute><WithdrawPage /></ProtectedRoute>
            } />
            <Route path="/wallet/pay" element={
              <ProtectedRoute><WalletPaymentPage /></ProtectedRoute>
            } />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
      
      {/* 🔔 Push permission banner — Only shows when permission not set */}
      {isAuthenticated && pushSupported && permission === 'default' && (
        <div className="push-permission-banner" style={{
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          background: 'var(--bg-card, #fff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 12, 
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          maxWidth: 320, 
          zIndex: 1000,
          display: 'flex', 
          alignItems: 'center', 
          gap: 12
        }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <div style={{ flex: 1, fontSize: '0.9rem' }}>
            <strong>Get instant updates</strong>
            <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.85rem' }}>
              Enable push for orders, prices & security alerts
            </div>
          </div>
          <button 
            onClick={subscribeUserToPush} 
            className="btn btn-sm btn-primary" 
            style={{ 
              padding: '6px 14px', 
              fontSize: '0.85rem',
              background: 'var(--primary, #3b82f6)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Enable
          </button>
        </div>
      )}
    </div>
  );
}

// ✅ Root App Component with ErrorBoundary
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WalletProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </WalletProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}