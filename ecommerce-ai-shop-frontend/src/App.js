import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWidget from './components/Chat/ChatWidget';
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
import { WishlistProvider } from './context/Wishlistcontext';
import PriceDropProductPage from './pages/PriceDropProductPage'; 
import WhishList from './pages/WhishList';
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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Push Notification Hook
function usePushNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [pushSupported, setPushSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');

  // Check browser support
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setPushSupported(supported);
    if (supported && Notification.permission !== 'default') {
      setPermission(Notification.permission);
    }
  }, []);

  // Load existing subscription from backend on auth
  useEffect(() => {
    if (isAuthenticated && user?.id && pushSupported) {
      loadSubscription();
    }
  }, [isAuthenticated, user?.id, pushSupported]);

  const loadSubscription = async () => {
    try {
      const res = await userAPI.getPushSubscription();
      if (res.data?.data?.subscription) {
        setSubscription(res.data.data.subscription);
      }
    } catch (err) {
      console.warn('Could not load push subscription:', err);
    }
  };

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      console.log('Service Worker registered:', registration.scope);
      return registration;
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      throw err;
    }
  }, []);

  const subscribeUserToPush = useCallback(async () => {
    if (!pushSupported) {
      toast.error('Push notifications are not supported in this browser');
      return null;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission !== 'granted') {
        if (permission === 'denied') {
          toast.error('Notifications blocked. Enable in browser settings.');
        }
        return null;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      
      // Get VAPID public key from env or backend
      const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID_PUBLIC_KEY not configured');
      }

      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend
      const subscriptionData = JSON.parse(JSON.stringify(pushSubscription));
      await userAPI.savePushSubscription({
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
        userAgent: navigator.userAgent
      });

      setSubscription(subscriptionData);
      toast.success('Push notifications enabled!');
      return subscriptionData;
    } catch (err) {
      console.error('Push subscription failed:', err);
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
      await userAPI.deletePushSubscription();
      setSubscription(null);
      toast.success('Push notifications disabled');
    } catch (err) {
      console.error('Unsubscribe failed:', err);
      toast.error('Failed to disable notifications');
    }
  }, [subscription]);

  // Listen for push messages while app is open
  useEffect(() => {
    if (!pushSupported || !isAuthenticated) return;

    const handleMessage = (event) => {
      try {
        const data = event.data?.json();
        console.log('Push message received:', data);
        
        // Show in-app notification
        if (data?.title || data?.body) {
          toast.custom((t) => (
            <div className={`push-toast ${t.visible ? 'enter' : 'exit'}`}>
              <strong>{data.title}</strong>
              {data.body && <p>{data.body}</p>}
              {data.url && (
                <a href={data.url} className="toast-action">
                  {data.actionText || 'View'}
                </a>
              )}
            </div>
          ), { duration: 5000 });
        }

        // Optionally refresh data based on notification type
        if (data?.type === 'order_update' || data?.type === 'price_drop') {
          // Could trigger context updates here
          console.log(`Refresh triggered for: ${data.type}`);
        }
      } catch (err) {
        console.error('Error handling push message:', err);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [pushSupported, isAuthenticated]);

  // Cleanup on logout
  useEffect(() => {
    return () => {
      if (!isAuthenticated && subscription) {
        // Optionally keep subscription for re-login, or unsubscribe:
        // unsubscribeUser();
      }
    };
  }, [isAuthenticated, subscription, unsubscribeUser]);

  return {
    pushSupported,
    permission,
    subscription,
    subscribeUserToPush,
    unsubscribeUser,
    refreshPermission: () => setPermission(Notification.permission)
  };
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    pushSupported, 
    permission, 
    subscribeUserToPush,
    refreshPermission 
  } = usePushNotifications();

  // Request push permission after successful login (non-intrusive)
  useEffect(() => {
    if (isAuthenticated && permission === 'default' && pushSupported) {
      // Could show a subtle in-app prompt here instead of auto-requesting
      console.log('Push permission not set - consider prompting user in UI');
    }
  }, [isAuthenticated, permission, pushSupported]);

  // Sync permission state when returning to tab
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
          pushStatus={{ supported: pushSupported, permission, subscribed: !!usePushNotifications().subscription }}
        />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route 
              path="/price-drop/:id" 
              element={
                <ProtectedRoute>
                  <PriceDropProductPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
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
            <Route path="/notifications" element={<ProtectedRoute><Notificationspage /></ProtectedRoute>} />
            <Route path="/offers" element={<Offerspage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <ChatWidget />
      </div>
      
      {/* Global push permission prompt (optional, non-intrusive) */}
      {isAuthenticated && pushSupported && permission === 'default' && (
        <div className="push-permission-banner" style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'var(--bg-card, #fff)',
          border: '1px solid var(--border-color)',
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
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Enable push for orders, prices & security alerts
            </div>
          </div>
          <button 
            onClick={subscribeUserToPush}
            className="btn btn-sm btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Enable
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <WishlistProvider>
          <AppContent />
        </WishlistProvider>
      </CartProvider>
    </ThemeProvider>
  );
}